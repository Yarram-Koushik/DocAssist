"""Embeddings setup for RAG."""
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_embedding_model():
    """Get embedding model based on configuration."""
    provider = os.getenv('LLM_PROVIDER', 'gemini')
    if provider == 'gemini':
        return GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv('GEMINI_API_KEY')
        )
    else:
        try:
            from langchain_openai import OpenAIEmbeddings
            return OpenAIEmbeddings(
                api_key=os.getenv('OPENAI_API_KEY')
            )
        except ImportError:
            from langchain_core.embeddings import FakeEmbeddings
            return FakeEmbeddings(size=768)
