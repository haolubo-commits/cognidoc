#!/usr/bin/env python3
"""
seed_demo_data.py — Sample dataset generator for CogniDoc Visual RAG.
Seeds realistic AI engineering documents into PostgreSQL or exports demo fixtures.
"""

import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

DEMO_DOCUMENTS = [
    {
        "title": "Attention Is All You Need — Core Architecture & Math",
        "filename": "vaswani_transformer_core.pdf",
        "content_type": "application/pdf",
        "meta_info": {
            "field": "Machine Learning",
            "year": 2017,
            "citations": 110000,
            "tags": ["Attention", "Transformer", "Deep Learning"]
        },
        "content": (
            "The Transformer is the first transduction model relying entirely on self-attention to compute representations "
            "of its input and output without using sequence-aligned RNNs or convolution.\n\n"
            "An attention function can be described as mapping a query and a set of key-value pairs to an output, "
            "where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, "
            "where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.\n\n"
            "Scaled Dot-Product Attention divides queries and keys by sqrt(d_k) before applying the softmax operator to prevent "
            "pushing the softmax function into regions that have extremely small gradients in high dimensions.\n\n"
            "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. "
            "With a single attention head, averaging inhibits this representation capacity."
        )
    },
    {
        "title": "pgvector Architecture: HNSW Graphs vs IVFFlat Indexes",
        "filename": "pgvector_indexing_internals.md",
        "content_type": "text/markdown",
        "meta_info": {
            "field": "Databases",
            "engine": "PostgreSQL 16",
            "tags": ["pgvector", "HNSW", "Vector Search", "ANN"]
        },
        "content": (
            "pgvector adds vector similarity search capabilities directly to PostgreSQL, supporting L2 distance, "
            "inner product, and cosine distance operators (<=>).\n\n"
            "Hierarchical Navigable Small World (HNSW) graphs offer significantly higher queries per second (QPS) and recall "
            "than IVFFlat indexes, though requiring more memory and build time during indexing.\n\n"
            "In HNSW, search begins at the top hierarchical layer where vertices have long-range edges, quickly zooming into the target cluster "
            "before descending to the bottom greedy local search layer.\n\n"
            "For cosine distance, vectors must either be normalized to unit length or indexed using the vector_cosine_ops operator class "
            "to ensure accurate nearest neighbor rankings across large multi-tenant knowledge bases."
        )
    },
    {
        "title": "Context Compression & KV-Cache PagedAttention Dynamics",
        "filename": "vllm_paged_attention_study.txt",
        "content_type": "text/plain",
        "meta_info": {
            "field": "LLM Inference Systems",
            "tags": ["KV Cache", "vLLM", "Memory Optimization"]
        },
        "content": (
            "During autoregressive LLM generation, keys and values of previous tokens are cached in GPU high-bandwidth memory (HBM). "
            "Standard contiguous allocation causes up to 60-80% memory waste due to internal and external fragmentation.\n\n"
            "PagedAttention manages KV cache blocks similarly to virtual memory pages in operating systems, storing non-contiguous physical pages.\n\n"
            "This near-zero memory waste enables larger batch sizes, boosting overall system throughput by 2x to 4x while strictly preserving generation accuracy."
        )
    }
]


def seed_database_or_export(export_only: bool = False):
    fixtures_path = BACKEND_DIR / "scripts" / "demo_fixtures.json"
    with open(fixtures_path, "w") as f:
        json.dump(DEMO_DOCUMENTS, f, indent=2)
    print(f"✓ Exported {len(DEMO_DOCUMENTS)} seed documents to {fixtures_path}")

    if export_only:
        return

    try:
        from app.db.session import SessionLocal
        from app.services.document_service import DocumentService
        from app.schemas.document import DocumentCreate

        db = SessionLocal()
        service = DocumentService(db)
        print("Connecting to database and seeding documents...")
        for doc_data in DEMO_DOCUMENTS:
            doc_in = DocumentCreate(**doc_data)
            created = service.ingest_document(doc_in)
            print(f"  • Seeded: '{created.title}' (ID: {created.id}, Chunks: {created.total_chunks})")
        db.close()
        print("✓ All demo documents successfully seeded into database.")
    except Exception as e:
        print(f"Notice: Database direct seed skipped ({e}). Fixtures file is ready for import.")


if __name__ == "__main__":
    export_flag = "--export-only" in sys.argv
    seed_database_or_export(export_only=export_flag)
