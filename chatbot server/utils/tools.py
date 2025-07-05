from RAG_config import retriever
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool


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
