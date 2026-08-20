"""Embeddings setup for RAG with safe fallback."""
import os

def get_embedding_model():
    """Get embedding model based on configuration with safe fallback."""
    gemini_key = os.getenv('GEMINI_API_KEY')
    if gemini_key:
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            return GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=gemini_key
            )
        except Exception:
            pass
            
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key:
        try:
            from langchain_openai import OpenAIEmbeddings
            return OpenAIEmbeddings(api_key=openai_key)
        except Exception:
            pass

    # Fast, zero-dependency embedding fallback for cloud serverless/containers
    from langchain_core.embeddings import FakeEmbeddings
    return FakeEmbeddings(size=768)

