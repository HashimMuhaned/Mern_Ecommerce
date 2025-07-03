from typing import TypedDict, Annotated, Optional
from langgraph.graph import add_messages, StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    HumanMessage,
    AIMessageChunk,
    ToolMessage,
    AIMessage,
    SystemMessage,
)
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from bson import ObjectId
from database import get_database
from routes.chat_routes import router as chat_router
import json
from langchain_core.tools import tool
from RAG_config import retriever


db = get_database()

load_dotenv()


# initial state
class State(TypedDict):
    messages: Annotated[list, add_messages]


# defining search tool
search_tool = TavilySearchResults(
    max_results=2,
)


@tool
def rag_tool(query: str) -> str:
    """Search the knowledge base which is qdrant for relevant information about the query."""
    docs = retriever.invoke(query)
    if not docs:
        return "I'm not sure."
    return "\n\n".join([doc.page_content for doc in docs])


tools = [search_tool, rag_tool]

llm = ChatOpenAI(
    # model="openai/gpt-3.5-turbo-16k",
    model="qwen/qwen3-14b",
    api_key=os.getenv("OPEN_ROUTER_API"),
    base_url="https://openrouter.ai/api/v1",
)

llm_with_tools = llm.bind_tools(tools=tools)


async def model(state: State):
    result = await llm_with_tools.ainvoke(state["messages"])
    return {
        "messages": [result],
    }


async def tools_router(state: State):
    last_message = state["messages"][-1]

    if hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0:
        return "tool_node"
    else:
        return END


async def tool_node(state):
    """Custom tool node that handles tool calls from the LLM."""
    # Get the tool calls from the last message
    tool_calls = state["messages"][-1].tool_calls

    # Initialize list to store tool messages
    tool_messages = []

    # Process each tool call
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]

        # Handle the search tool
        if tool_name == "tavily_search_results_json":
            print(f"🔍 search tool invoked with args: {tool_args}")
            # Execute the search tool with the provided arguments
            search_results = await search_tool.ainvoke(tool_args)

            # Create a ToolMessage for this result
            tool_message = ToolMessage(
                content=str(search_results), tool_call_id=tool_id, name=tool_name
            )

            tool_messages.append(tool_message)

        elif tool_name == "rag_tool":
            print(f"🔍 RAG tool invoked with args: {tool_args}")
            # Get the answer from RAG tool
            rag_result = rag_tool.invoke(tool_args["query"])
            tool_message = ToolMessage(
                content=rag_result, tool_call_id=tool_id, name=tool_name
            )
            tool_messages.append(tool_message)

    # Add the tool messages to the state
    return {"messages": tool_messages}


graph_builder = StateGraph(State)

graph_builder.add_node("model", model)
graph_builder.add_node("tool_node", tool_node)
graph_builder.set_entry_point("model")

graph_builder.add_conditional_edges("model", tools_router)
graph_builder.add_edge("tool_node", "model")

graph = graph_builder.compile()


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


async def summarize_messages(messages: list):
    text = "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in messages)
    summary_prompt = f"""
        Summarize the following conversation to retain the core topics, context, and user goals:
        
        {text}
            """
    summary = await llm.ainvoke([HumanMessage(content=summary_prompt)])
    return summary.content


# To extract the content from an AI-generated message chunk.
# Used inside: generate_chat_responses() to safely extract content from streamed AI message chunks.
def serialise_ai_message_chunk(chunk):
    if isinstance(chunk, AIMessageChunk):
        return chunk.content
    else:
        raise TypeError(
            f"Object of type {type(chunk).__name__} is not correctly formatted for serialisation"
        )


# Purpose: This is the main async generator that:
#   Sends a user message to the AI model.
#   Handles streaming of the AI response and tool use (like search).
#   Yields chunks of data as Server-Sent Events (SSE).

conversation_collection = db["conversations"]
users_collection = db["users"]


async def generate_chat_responses(user_id: str, message: str):
    # Step 1: Load conversation history from MongoDB
    mongo_record = conversation_collection.find_one({"session_id": user_id})
    existing_messages = mongo_record["messages"] if mongo_record else []

    memory = ConversationBufferMemory(return_messages=True)

    # Step 2: Add previous messages to memory
    if len(existing_messages) > 12:
        summary_messages = existing_messages[:-10]
        latest_messages = existing_messages[-10:]

        summary_text = await summarize_messages(summary_messages)
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

    # Step 3: Add new user message
    memory.chat_memory.add_message(HumanMessage(content=message))
    messages_before = len(memory.chat_memory.messages)

    # Step 4: Run LangGraph with checkpoint as thread_id
    config = {"configurable": {"thread_id": user_id}}

    events = graph.astream_events(
        {"messages": memory.chat_memory.messages}, config=config, version="v2"
    )

    ai_response = ""

    async for event in events:
        event_type = event["event"]

        if event_type == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            chunk_content = serialise_ai_message_chunk(chunk)
            ai_response += chunk_content
            safe_content = chunk_content.replace("'", "\\'").replace("\n", "\\n")
            yield f'data: {{"type": "content", "content": "{safe_content}"}}\n\n'

        elif event_type == "on_chat_model_end":
            # Always yield checkpoint (thread_id)
            yield f'data: {{"type": "checkpoint", "checkpoint_id": "{user_id}"}}\n\n'

            tool_calls = (
                event["data"]["output"].tool_calls
                if hasattr(event["data"]["output"], "tool_calls")
                else []
            )

            search_calls = [
                call
                for call in tool_calls
                if call["name"] == "tavily_search_results_json"
            ]

            if search_calls:
                search_query = search_calls[0]["args"].get("query", "")
                safe_query = (
                    search_query.replace('"', '\\"')
                    .replace("'", "\\'")
                    .replace("\n", "\\n")
                )
                yield f'data: {{"type": "search_start", "query": "{safe_query}"}}\n\n'

        elif (
            event_type == "on_tool_end"
            and event["name"] == "tavily_search_results_json"
        ):
            output = event["data"]["output"]
            if isinstance(output, list):
                urls = [
                    item["url"]
                    for item in output
                    if isinstance(item, dict) and "url" in item
                ]
                urls_json = json.dumps(urls)
                yield f'data: {{"type": "search_results", "urls": {urls_json}}}\n\n'

    # Final stream end
    yield f'data: {{"type": "end"}}\n\n'

    # Step 5: Add AI response to memory and save both user + AI to DB
    memory.chat_memory.add_message(AIMessage(content=ai_response))
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


@app.get("/chat_boot")
async def chat_boot(user_id: str = Query(...), fname: Optional[str] = Query(None)):
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
    fake_human = HumanMessage(content="Say hello to the user.")
    memory.chat_memory.add_message(system_prompt)
    # memory.chat_memory.add_message(fake_human)

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
