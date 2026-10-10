"""
API integration tests for CogniDoc FastAPI endpoints.
Tests health checks, document ingestion, listing, detail view, deletion, and vector search.
"""

from unittest.mock import patch, MagicMock
from app.models.document import Document, DocumentChunk


def test_health_check(client):
    """Test /health endpoint status and vector dimensions."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CogniDoc"
    assert data["pgvector_dimension"] == 384


def test_root_endpoint(client):
    """Test / root endpoint welcome response."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "CogniDoc" in data["message"]
    assert data["docs"] == "/docs"


def test_list_documents(client, mock_db_session):
    """Test listing documents with pagination."""
    mock_doc = MagicMock(spec=Document)
    mock_doc.id = "doc-test-123"
    mock_doc.title = "Attention Is All You Need"
    mock_doc.filename = "attention.pdf"
    mock_doc.content_type = "application/pdf"
    mock_doc.total_chunks = 4
    mock_doc.meta_info = {"author": "Vaswani et al."}
    mock_doc.created_at = "2026-10-10T12:00:00"
    mock_doc.updated_at = "2026-10-10T12:00:00"
    mock_doc.chunks = []

    mock_db_session.query.return_value.offset.return_value.limit.return_value.all.return_value = [mock_doc]

    response = client.get("/api/v1/documents/")
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) == 1
    assert docs[0]["id"] == "doc-test-123"
    assert docs[0]["title"] == "Attention Is All You Need"


def test_get_document_not_found(client, mock_db_session):
    """Test 404 response when querying non-existent document."""
    mock_db_session.query.return_value.filter.return_value.first.return_value = None

    response = client.get("/api/v1/documents/non-existent-id")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_document_success(client, mock_db_session):
    """Test successful deletion of a document."""
    mock_doc = MagicMock(spec=Document)
    mock_doc.id = "doc-del-1"
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_doc

    response = client.delete("/api/v1/documents/doc-del-1")
    assert response.status_code == 204
    assert mock_db_session.delete.called
    assert mock_db_session.commit.called


def test_delete_document_not_found(client, mock_db_session):
    """Test 404 response on deleting missing document."""
    mock_db_session.query.return_value.filter.return_value.first.return_value = None

    response = client.delete("/api/v1/documents/missing-id")
    assert response.status_code == 404


def test_create_document_ingestion(client, mock_db_session):
    """Test document ingestion and semantic chunk generation."""
    payload = {
        "title": "FlashAttention Fast IO-Aware Algorithms",
        "filename": "flash_attention.pdf",
        "content_type": "application/pdf",
        "content": (
            "FlashAttention is a fast and memory-efficient exact attention algorithm. "
            "It computes attention by tiling inputs and avoiding materializing the full N x N matrix in HBM."
        ),
        "meta_info": {"citations": 1200}
    }

    # Simulate DB flush providing id
    def fake_flush():
        pass
    mock_db_session.flush.side_effect = fake_flush

    with patch("app.services.document_service.DocumentService.ingest_document") as mock_ingest:
        fake_res = {
            "id": "doc-flash-1",
            "title": payload["title"],
            "filename": payload["filename"],
            "content_type": payload["content_type"],
            "total_chunks": 1,
            "meta_info": payload["meta_info"],
            "created_at": "2026-10-10T12:00:00",
            "updated_at": "2026-10-10T12:00:00",
            "chunks": []
        }
        mock_ingest.return_value = fake_res

        response = client.post("/api/v1/documents/", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == payload["title"]
        assert data["id"] == "doc-flash-1"


def test_search_endpoint(client, mock_db_session):
    """Test vector similarity search citation returns."""
    search_payload = {
        "query": "How does IO tiling reduce HBM memory overhead?",
        "top_k": 3
    }

    mock_hit = {
        "chunk_id": "chunk-101",
        "document_id": "doc-flash-1",
        "document_title": "FlashAttention Fast IO-Aware Algorithms",
        "chunk_index": 0,
        "page_number": 1,
        "content": "FlashAttention reduces memory overhead by tiling inputs into fast SRAM.",
        "similarity_score": 0.8842
    }

    with patch("app.services.search_service.SearchService.search_similar_chunks") as mock_search:
        mock_search.return_value = [mock_hit]

        response = client.post("/api/v1/search/", json=search_payload)
        assert response.status_code == 200
        results = response.json()
        assert len(results) == 1
        assert results[0]["similarity_score"] == 0.8842
        assert results[0]["chunk_id"] == "chunk-101"
