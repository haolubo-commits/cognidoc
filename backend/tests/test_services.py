"""
Unit tests for EmbeddingService and SearchService utilities.
"""

from app.services.embedding import EmbeddingService


def test_embedding_dimension_and_norm():
    service = EmbeddingService(dimension=384)
    emb = service.get_embedding("Visual RAG citations and chunk retrieval")
    
    assert len(emb) == 384
    # Check that vector is non-zero
    assert any(x != 0.0 for x in emb)


def test_cosine_similarity():
    service = EmbeddingService(dimension=384)
    v1 = service.get_embedding("Deep learning transformers and attention")
    v2 = service.get_embedding("Deep learning transformers and attention")
    v3 = service.get_embedding("Completely unrelated topic about cooking food")

    # Identical texts should have similarity ~1.0
    sim_identical = service.cosine_similarity(v1, v2)
    assert sim_identical >= 0.99

    # Unrelated texts should have lower similarity
    sim_diff = service.cosine_similarity(v1, v3)
    assert sim_diff < sim_identical
