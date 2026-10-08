"""
Document processing and ingestion service.
Orchestrates chunking, embedding generation, and database persistence.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.schemas.document import DocumentCreate
from app.services.chunker import TextChunker
from app.services.embedding import EmbeddingService
from app.core.config import settings


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.chunker = TextChunker(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        self.embedder = EmbeddingService(dimension=settings.EMBEDDING_DIMENSION)

    def ingest_document(self, doc_in: DocumentCreate) -> Document:
        """
        Ingests a document: chunks raw text, computes vector embeddings,
        and saves records to the database.
        """
        # 1. Chunk document text
        raw_chunks = self.chunker.chunk_text(doc_in.content)
        
        # 2. Create parent Document
        doc = Document(
            title=doc_in.title,
            filename=doc_in.filename,
            content_type=doc_in.content_type,
            total_chunks=len(raw_chunks),
            meta_info=doc_in.meta_info
        )
        self.db.add(doc)
        self.db.flush()  # Obtain doc.id

        # 3. Create Chunks with embeddings
        chunk_texts = [c["content"] for c in raw_chunks]
        embeddings = self.embedder.get_embeddings_batch(chunk_texts)

        for raw_c, emb in zip(raw_chunks, embeddings):
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=raw_c["chunk_index"],
                page_number=raw_c["page_number"],
                content=raw_c["content"],
                token_count=raw_c["token_count"],
                embedding=emb
            )
            self.db.add(chunk)

        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_document(self, doc_id: str) -> Optional[Document]:
        """Retrieves a document by ID."""
        return self.db.query(Document).filter(Document.id == doc_id).first()

    def list_documents(self, skip: int = 0, limit: int = 20) -> List[Document]:
        """Lists documents with pagination."""
        return self.db.query(Document).offset(skip).limit(limit).all()

    def delete_document(self, doc_id: str) -> bool:
        """Deletes a document and its cascading chunks."""
        doc = self.get_document(doc_id)
        if not doc:
            return False
        self.db.delete(doc)
        self.db.commit()
        return True
