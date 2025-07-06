from langchain_core.messages import (
    HumanMessage,
    AIMessageChunk,
)
from utils.graph_config import llm


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
