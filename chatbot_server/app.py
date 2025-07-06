from typing import Optional
from langchain_core.messages import (
    HumanMessage,
    AIMessage,
    SystemMessage,
)
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from database import get_database
from routes.chat_routes import router as chat_router
import json
from utils.memory_utils import summarize_messages, serialise_ai_message_chunk
from utils.graph_config import graph


db = get_database()

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mern-ecommerce-frontend-of3877ez1-hashims-projects-1d68b3df.vercel.app",
        "https://mern-ecommerce-frontend-jcmqogpn4-hashims-projects-1d68b3df.vercel.app",
        "https://mern-ecommerce-frontend-git-main-hashims-projects-1d68b3df.vercel.app",
        "https://mern-ecommerce-frontend-eta-ten.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)

conversation_collection = db["conversations"]
users_collection = db["users"]


# Purpose: This is the main async generator that:
#   Sends a user message to the AI model.
#   Handles streaming of the AI response and tool use (like search).
#   Yields chunks of data as Server-Sent Events (SSE).
async def generate_chat_responses(user_id: str, message: str):
    # Load conversation history from MongoDB where userId = to user who is logged in
    mongo_record = conversation_collection.find_one({"session_id": user_id})

    # if there are messages in mongo_record save into existing_messages variable else just keep it empty list.
    existing_messages = mongo_record["messages"] if mongo_record else []

    # initilazing memory
    memory = ConversationBufferMemory(return_messages=True)

    if len(existing_messages) > 12:
        summary_messages = existing_messages[
            :-10
        ]  # takes everything except the last 10 messages
        latest_messages = existing_messages[-10:]  # takes the last 10 messages only

        # summarize everything except last 10 messages.
        summary_text = await summarize_messages(summary_messages)
        # then add them into memory.
        memory.chat_memory.add_message(
            SystemMessage(content=f"Conversation Summary: {summary_text}")
        )

        for msg in latest_messages:
            if msg["role"] == "user":
                memory.chat_memory.add_message(HumanMessage(content=msg["content"]))
            elif msg["role"] == "ai":
                memory.chat_memory.add_message(AIMessage(content=msg["content"]))
    else:
        for msg in existing_messages:
            if msg["role"] == "user":
                memory.chat_memory.add_message(HumanMessage(content=msg["content"]))
            elif msg["role"] == "ai":
                memory.chat_memory.add_message(AIMessage(content=msg["content"]))

    memory.chat_memory.add_message(HumanMessage(content=message))

    # we keep track of the length of messages brofre running the program,
    #  to ensure saving only new messages and avoid duplication.
    messages_before = len(memory.chat_memory.messages)

    config = {"configurable": {"thread_id": user_id}}

    events = graph.astream_events(
        {"messages": memory.chat_memory.messages}, config=config, version="v2"
    )

    ai_response = ""

    async for event in events:
        event_type = event["event"]

        if event_type == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            # we pass event["data"]["chunk"] to the "serialise_ai_message_chunk" to check if is an AI response.
            # if yes we save it to this variable.
            chunk_content = serialise_ai_message_chunk(chunk)
            ai_response += chunk_content
            # Escape single quotes and newlines for safe JSON parsing
            safe_content = chunk_content.replace("'", "\\'").replace("\n", "\\n")

            # Stream AI message	As AI generates it. also streaming this way will be using in the frontend
            yield f'data: {{"type": "content", "content": "{safe_content}"}}\n\n'

        elif event_type == "on_chat_model_end":
            # This event signals the end of the AI model’s main generation ste
            # Check if there are tool calls for search
            # the value of this variable will be the list that has tool_calls attribute.
            yield f'data: {{"type": "checkpoint", "checkpoint_id": "{user_id}"}}\n\n'

            tool_calls = (
                event["data"]["output"].tool_calls  # we access the list of tool calls
                if hasattr(
                    event["data"]["output"], "tool_calls"
                )  # if it has an attribute of tools call
                else []  # else we set it to an empty list
            )

            # then we loop through tools_calls
            # Filter tool calls to find only the tool["name"] is "tavily_search_results_json"
            # or else it ill be an empty list.
            search_calls = [
                call
                for call in tool_calls
                if call["name"] == "tavily_search_results_json"
            ]

            if search_calls:
                # Signal that a search is starting
                search_query = search_calls[0]["args"].get(
                    "query", ""
                )  # Get the actual query string the AI wants to search.

                # Escape quotes and special characters
                safe_query = (
                    search_query.replace('"', '\\"')
                    .replace("'", "\\'")
                    .replace("\n", "\\n")
                )
                # Notify of tool use After AI finishes thinking (useful in frontend)
                yield f'data: {{"type": "search_start", "query": "{safe_query}"}}\n\n'

        # If the event is the completion of the search tool.
        elif (
            event_type == "on_tool_end"
            and event["name"] == "tavily_search_results_json"
        ):
            # get the output of the tool.
            output = event["data"]["output"]

            # Check if output is a list
            if isinstance(output, list):
                # tavily_search_results_json usually return urls as a refrence to where it got the info from.
                # Extract URLs from list of search results
                urls = [
                    # we look for the urls and add them on the urls list
                    item["url"]
                    for item in output
                    if isinstance(item, dict) and "url" in item
                ]
                # Convert URLs to JSON and yield them
                urls_json = json.dumps(urls)
                yield f'data: {{"type": "search_results", "urls": {urls_json}}}\n\n'

    # Final stream end
    yield f'data: {{"type": "end"}}\n\n'

    # add AI response to memory
    memory.chat_memory.add_message(AIMessage(content=ai_response))

    # split the new messages that were added to memory after the user's input, including the user message itself,
    # AI and user input
    new_messages = memory.chat_memory.messages[
        messages_before - 1 :
    ]  # include user message

    formatted = []
    for m in new_messages:
        formatted.append(
            {
                "role": m.type,
                "content": m.content,
                "user_id": user_id if m.type == "human" else None,
            }
        )

    if formatted:
        conversation_collection.update_one(
            {"session_id": user_id},
            {"$push": {"messages": {"$each": formatted}}},
            upsert=True,
        )


@app.get("/chat_stream/{message}")
# Defines the handler function. message is required (from URL), and checkpoint_id is an optional query param.
async def chat_stream(message: str, user_id: str = Query(...)):
    # StreamingResponse, which:
    # Sends each yield as a Server-Sent Event (text/event-stream)
    # Keeps the connection open and streams updates in real time
    return StreamingResponse(
        generate_chat_responses(user_id=user_id, message=message),
        media_type="text/event-stream",
    )


# this function will be triggred once the user loggs in if the user has no history meaning first time texting the chatbot,
# the chatbot witll greet user by his own name, else(if the user has texted the chatbot previously) it will fetch the messages.
@app.get("/chat_boot")
async def chat_boot(user_id: str = Query(...), fname: Optional[str] = Query(None)):
    # getting history where user id = to who's logged in.
    mongo_record = conversation_collection.find_one({"session_id": user_id})

    greeted = mongo_record.get("greeted", False) if mongo_record else False

    # If user has history, return all messages
    if greeted and mongo_record:
        return {"messages": mongo_record["messages"]}

    # Otherwise, generate greeting
    if not fname:
        raise HTTPException(status_code=400, detail="First name required for greeting")

    memory = ConversationBufferMemory(return_messages=True)

    system_prompt = SystemMessage(
        content=f"The user's name is {fname}. Greet them personally."
    )
    memory.chat_memory.add_message(system_prompt)

    config = {"configurable": {"thread_id": user_id}}

    events = graph.astream_events(
        {"messages": memory.chat_memory.messages}, config=config, version="v2"
    )

    ai_greeting = ""
    async for event in events:
        if event["event"] == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            ai_greeting += chunk.content

    # Save messages to DB
    formatted = [
        {"role": "system", "content": system_prompt.content, "user_id": None},
        # {"role": "fake_user", "content": fake_human.content, "user_id": user_id},
        {"role": "ai", "content": ai_greeting, "user_id": None},
    ]

    conversation_collection.insert_one(
        {
            "session_id": user_id,
            "messages": formatted,
            "greeted": True,
            "user_name": fname,
        }
    )

    return {"messages": formatted}


app.include_router(chat_router, prefix="/api")
