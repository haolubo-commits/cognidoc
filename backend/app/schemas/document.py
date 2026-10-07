"""
Pydantic v2 schemas for Document and Chunk operations.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ChunkBase(BaseModel):
    chunk_index: int
    page_number: int = 1
    content: str
    token_count: int = 0


class ChunkResponse(ChunkBase):
    id: str
    document_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentBase(BaseModel):
    title: str = Field(..., max_length=255)
    filename: str = Field(..., max_length=255)
    content_type: str = "text/plain"
    meta_info: Dict[str, Any] = Field(default_factory=dict)


class DocumentCreate(DocumentBase):
    content: str = Field(..., description="Raw text content to be chunked and indexed")


class DocumentResponse(DocumentBase):
    id: str
    total_chunks: int
    created_at: datetime
    updated_at: datetime
    chunks: Optional[List[ChunkResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class SearchQuery(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=20)
    document_id: Optional[str] = None


class SearchResultChunk(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    chunk_index: int
    page_number: int
    content: str
    similarity_score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
