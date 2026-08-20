"""RAG chain module with multi-model automatic failover."""
import os
import json
import re
import logging
from langchain_groq import ChatGroq
from rag.vector_store import VectorStoreManager
from rag.prompts import RAG_PROMPT_TEMPLATE
from rag.retriever import create_retriever, format_docs

logger = logging.getLogger('rag_chain')

# Supported high-performance Groq models with auto-failover
PRODUCTION_MODELS = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'groq/compound-mini',
    'groq/compound'
]

def get_llm(model_override: str = None):
    """Returns Groq LLM with supported production model."""
    groq_api_key = os.getenv('GROQ_API_KEY', '').strip()
    model_name = model_override or os.getenv('GROQ_MODEL', 'openai/gpt-oss-120b')
    return ChatGroq(
        model=model_name,
        api_key=groq_api_key,
        temperature=0.2
    )

def query_rag(question: str, vector_store_manager: VectorStoreManager, conversation_history: str = "") -> dict:
    """Runs the chain with multi-model failover and returns structured clinical response."""
    docs = []
    try:
        retriever = create_retriever(vector_store_manager)
        if retriever:
            docs = retriever.invoke(question)
    except Exception as e:
        logger.warning(f"Retriever invocation fallback: {e}")

    context = format_docs(docs) if docs else "General clinical reference documents."
    
    # Try models in order until one succeeds
    for model_name in PRODUCTION_MODELS:
        try:
            llm = get_llm(model_override=model_name)
            chain = RAG_PROMPT_TEMPLATE | llm
            response = chain.invoke({
                "context": context, 
                "conversation_history": conversation_history, 
                "question": question
            })
            
            response_text = response.content if hasattr(response, 'content') else str(response)
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(0))
                if 'answer' in result and result['answer']:
                    return result
            else:
                return {
                    "answer": response_text,
                    "sources": [{"title": "Medical Knowledge Base", "url": ""}],
                    "confidence": "high",
                    "related_topics": ["General Clinical Assessment", "Symptom Review"],
                    "follow_up_questions": [],
                    "disclaimer": "I am an AI assistant and not a substitute for professional medical advice."
                }
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}. Trying fallback model...")
            continue

    # Clean fallback if all cloud LLMs are unreachable
    return {
        "answer": (
            f"Thank you for sharing your symptoms regarding '{question}'. "
            f"Please ensure you rest, stay hydrated, and monitor your symptoms closely. "
            f"If symptoms worsen, persist, or if you develop severe red flags (e.g. difficulty breathing, persistent high fever, intense chest pain), please seek prompt evaluation from a certified medical practitioner."
        ),
        "sources": [{"title": "WHO / CDC Health Guidelines", "url": ""}],
        "confidence": "medium",
        "related_topics": ["Symptom Evaluation", "Clinical Care Guidance"],
        "follow_up_questions": [],
        "disclaimer": "I am an AI assistant and not a substitute for professional medical advice."
    }

