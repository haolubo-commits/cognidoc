"""
Vector similarity and hybrid search endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import SearchQuery, SearchResultChunk
from app.services.search_service import SearchService

router = APIRouter()


@router.post("/", response_model=List[SearchResultChunk])
def search_similar_chunks(search_in: SearchQuery, db: Session = Depends(get_db)):
    """
    Computes vector similarity against indexed chunks and returns ranked citations.
    """
    service = SearchService(db)
    return service.search_similar_chunks(
        query=search_in.query,
        top_k=search_in.top_k,
        document_id=search_in.document_id
    )
