"""
Document management and ingestion endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentCreate, DocumentResponse
from app.services.document_service import DocumentService

router = APIRouter()


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(doc_in: DocumentCreate, db: Session = Depends(get_db)):
    """
    Ingests a document: chunks raw content, generates vector embeddings,
    and indexes for visual RAG search.
    """
    service = DocumentService(db)
    return service.ingest_document(doc_in)


@router.get("/", response_model=List[DocumentResponse])
def list_documents(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Lists indexed documents with pagination."""
    service = DocumentService(db)
    return service.list_documents(skip=skip, limit=limit)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    """Fetches a document and its indexed chunks by ID."""
    service = DocumentService(db)
    doc = service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found"
        )
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Deletes a document and its cascading chunks."""
    service = DocumentService(db)
    deleted = service.delete_document(document_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found"
        )
