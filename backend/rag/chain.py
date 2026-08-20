"""RAG chain module."""
import os
import json
from langchain_groq import ChatGroq
from rag.vector_store import VectorStoreManager
from rag.prompts import RAG_PROMPT_TEMPLATE
from rag.retriever import create_retriever, format_docs

def get_llm():
    """Returns Groq LLM based on config."""
    return ChatGroq(
        model='groq/compound-mini',
        api_key=os.getenv('GROQ_API_KEY'),
        temperature=0.2
    )

def create_rag_chain(vector_store_manager: VectorStoreManager):
    """Creates a retrieval chain."""
    llm = get_llm()
    retriever = create_retriever(vector_store_manager)
    chain = RAG_PROMPT_TEMPLATE | llm
    return chain, retriever

def query_rag(question: str, vector_store_manager: VectorStoreManager, conversation_history: str = "") -> dict:
    """Runs the chain and returns structured response."""
    retriever = create_retriever(vector_store_manager)
    docs = retriever.invoke(question) if retriever else []
    
    context = format_docs(docs) if docs else "No specific documents found."
    chain, _ = create_rag_chain(vector_store_manager)
    
    try:
        response = chain.invoke({"context": context, "conversation_history": conversation_history, "question": question})
        response_text = response.content
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        result = json.loads(response_text)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "answer": f"An error occurred while generating the response: {str(e)}",
            "sources": [],
            "confidence": "low",
            "related_topics": [],
            "follow_up_questions": [],
            "disclaimer": "I am an AI and not a substitute for professional medical advice."
        }
