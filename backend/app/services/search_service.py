"""
Vector and hybrid search service.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.document import DocumentChunk, Document
from app.schemas.document import SearchResultChunk
from app.services.embedding import EmbeddingService
from app.core.config import settings


class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.embedder = EmbeddingService(dimension=settings.EMBEDDING_DIMENSION)

    def search_similar_chunks(
        self,
        query: str,
        top_k: int = 5,
        document_id: Optional[str] = None
    ) -> List[SearchResultChunk]:
        """
        Calculates query embedding and returns top-k most similar document chunks.
        """
        query_vector = self.embedder.get_embedding(query)

        # Base query joining document info
        q = (
            self.db.query(DocumentChunk, Document.title)
            .join(Document, DocumentChunk.document_id == Document.id)
        )
        if document_id:
            q = q.filter(DocumentChunk.document_id == document_id)

        all_chunks = q.all()
        if not all_chunks:
            return []

        # Score chunks using cosine similarity
        scored_results = []
        for chunk, doc_title in all_chunks:
            if chunk.embedding is not None:
                # Handle pgvector or list embedding
                emb_list = list(chunk.embedding) if hasattr(chunk.embedding, "__iter__") else []
                sim = self.embedder.cosine_similarity(query_vector, emb_list)
            else:
                sim = 0.0

            scored_results.append({
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "document_title": doc_title,
                "chunk_index": chunk.chunk_index,
                "page_number": chunk.page_number,
                "content": chunk.content,
                "similarity_score": sim
            })

        # Sort descending by similarity
        scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_matches = scored_results[:top_k]

        return [SearchResultChunk(**item) for item in top_matches]
