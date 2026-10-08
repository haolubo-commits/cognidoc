"""
Vector embedding generation service.
Uses lightweight vector embeddings with normalized cosine vectors.
"""

import math
import hashlib
from typing import List
from app.core.config import settings


class EmbeddingService:
    def __init__(self, dimension: int = settings.EMBEDDING_DIMENSION):
        self.dimension = dimension

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates a deterministic, normalized vector embedding for the input text.
        In production, this routes to sentence-transformers or an embedding API.
        """
        if not text:
            return [0.0] * self.dimension

        # Generate a deterministic seed vector using SHA-256 tokens
        words = text.lower().split()
        vector = [0.0] * self.dimension
        
        for i, word in enumerate(words):
            word_hash = int(hashlib.sha256(word.encode()).hexdigest(), 16)
            idx = word_hash % self.dimension
            weight = 1.0 / (1.0 + math.log1p(i + 1))
            vector[idx] += weight

        # Normalize vector to unit length (L2 norm)
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [round(x / norm, 6) for x in vector]
        else:
            vector[0] = 1.0

        return vector

    def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a batch of text chunks."""
        return [self.get_embedding(t) for t in texts]

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Computes cosine similarity between two unit-normalized vectors."""
        if len(v1) != len(v2):
            raise ValueError("Vectors must have the same dimension")
        dot_product = sum(a * b for a, b in zip(v1, v2))
        return round(max(0.0, min(1.0, dot_product)), 4)
