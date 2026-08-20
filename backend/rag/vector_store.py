"""FAISS vector store manager."""
import os
from langchain_community.vectorstores import FAISS
from rag.embeddings import get_embedding_model

class VectorStoreManager:
    def __init__(self, index_path: str):
        self.index_path = index_path
        self.embeddings = get_embedding_model()
        self.vector_store = self.load_or_create()

    def load_or_create(self) -> FAISS:
        """Load existing index or create empty one."""
        if os.path.exists(self.index_path) and os.path.isdir(self.index_path):
            try:
                return FAISS.load_local(self.index_path, self.embeddings, allow_dangerous_deserialization=True)
            except Exception as e:
                print(f"Error loading vector store: {e}")
        
        # Create empty if not exists or failed to load
        return FAISS.from_texts(["initialization"], self.embeddings)

    def add_documents(self, documents: list):
        """Add LangChain Document objects, embed and store."""
        if documents:
            if not hasattr(self, 'vector_store') or self.vector_store is None:
                self.vector_store = FAISS.from_documents(documents, self.embeddings)
            else:
                self.vector_store.add_documents(documents)

    def similarity_search(self, query: str, k: int = 5) -> list:
        """Search and return top k results."""
        if not self.vector_store:
            return []
        return self.vector_store.similarity_search(query, k=k)

    def save(self):
        """Persist to disk."""
        if self.vector_store:
            os.makedirs(self.index_path, exist_ok=True)
            self.vector_store.save_local(self.index_path)
