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
from graph_config import llm


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
