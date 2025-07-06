from typing import TypedDict, Annotated
from langgraph.graph import add_messages, StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    ToolMessage,
)
from dotenv import load_dotenv
import os
from chatbot_server.utils.tools import rag_tool, search_tool

load_dotenv()


class State(TypedDict):
    messages: Annotated[list, add_messages]


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
            print(f"search tool args: {tool_args}")
            # Execute the search tool with the provided arguments
            search_results = await search_tool.ainvoke(tool_args)

            # Create a ToolMessage for this result
            tool_message = ToolMessage(
                content=str(search_results), tool_call_id=tool_id, name=tool_name
            )

            tool_messages.append(tool_message)

        elif tool_name == "rag_tool":
            print(f"RAG tool args: {tool_args}")
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
