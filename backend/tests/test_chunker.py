"""
Unit tests for the TextChunker service.
"""

from app.services.chunker import TextChunker


def test_chunker_basic():
    chunker = TextChunker(chunk_size=100, chunk_overlap=20)
    sample_text = (
        "CogniDoc is a lightweight visual RAG engine. "
        "It splits long documents into coherent semantic chunks. "
        "Each chunk preserves sentence boundaries and tracks character ranges. "
        "This makes visual citation and source retrieval accurate and explainable."
    )
    chunks = chunker.chunk_text(sample_text, page_number=1)
    
    assert len(chunks) > 0
    for chunk in chunks:
        assert "chunk_index" in chunk
        assert "content" in chunk
        assert "token_count" in chunk
        assert chunk["page_number"] == 1
        assert chunk["token_count"] > 0


def test_chunker_empty_string():
    chunker = TextChunker()
    chunks = chunker.chunk_text("")
    assert chunks == []
