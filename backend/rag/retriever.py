"""Retriever wrapper."""
from rag.vector_store import VectorStoreManager

def create_retriever(vector_store_manager: VectorStoreManager, k: int = 5):
    """Creates retriever from FAISS store."""
    if not vector_store_manager.vector_store:
        return None
    return vector_store_manager.vector_store.as_retriever(search_kwargs={"k": k})

def format_docs(docs: list) -> str:
    """Format retrieved documents into context string with source attribution."""
    formatted_docs = []
    for doc in docs:
        source = doc.metadata.get('filename', 'Unknown Source')
        formatted_docs.append(f"Source: {source}\nContent: {doc.page_content}")
    return "\n\n".join(formatted_docs)
