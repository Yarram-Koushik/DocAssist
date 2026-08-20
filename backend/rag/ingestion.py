"""Document ingestion pipeline."""
import os
from langchain_community.document_loaders import PyMuPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from rag.vector_store import VectorStoreManager

def ingest_directory(directory_path: str, vector_store_manager: VectorStoreManager) -> int:
    """Walk directory, load .txt/.pdf files."""
    total_chunks = 0
    for root, _, files in os.walk(directory_path):
        for file in files:
            file_path = os.path.join(root, file)
            if file.lower().endswith(('.pdf', '.txt')):
                total_chunks += ingest_file(file_path, vector_store_manager)
    return total_chunks

def ingest_file(file_path: str, vector_store_manager: VectorStoreManager) -> int:
    """Load single file, split and add to vector store."""
    documents = []
    try:
        if file_path.lower().endswith('.pdf'):
            loader = PyMuPDFLoader(file_path)
            documents = loader.load()
        elif file_path.lower().endswith('.txt'):
            loader = TextLoader(file_path)
            documents = loader.load()
            
        for doc in documents:
            doc.metadata['source_type'] = 'pdf' if file_path.lower().endswith('.pdf') else 'text'
            doc.metadata['filename'] = os.path.basename(file_path)
            
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(documents)
        
        vector_store_manager.add_documents(chunks)
        vector_store_manager.save()
        return len(chunks)
    except Exception as e:
        print(f"Error ingesting file {file_path}: {e}")
        return 0
