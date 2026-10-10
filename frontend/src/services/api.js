/**
 * CogniDoc API Service
 * Handles communication with the FastAPI backend, with graceful fallback to interactive mock mode
 * for offline demonstration and testing.
 */

const API_BASE = '/api/v1';

// Seed sample documents for initial experience
const SEED_DOCUMENTS = [
  {
    id: "doc-llm-arch-01",
    title: "Transformer Attention & Multi-Head Query Mechanisms",
    filename: "transformer_attention_mechanisms.pdf",
    content_type: "application/pdf",
    total_chunks: 4,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    meta_info: { domain: "Deep Learning", pages: 12, author: "Vaswani et al." },
    chunks: [
      {
        id: "chunk-01",
        document_id: "doc-llm-arch-01",
        chunk_index: 0,
        page_number: 1,
        token_count: 64,
        content: "The Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution.",
        created_at: new Date().toISOString()
      },
      {
        id: "chunk-02",
        document_id: "doc-llm-arch-01",
        chunk_index: 1,
        page_number: 3,
        token_count: 78,
        content: "An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. Scaled Dot-Product Attention divides queries and keys by sqrt(d_k).",
        created_at: new Date().toISOString()
      },
      {
        id: "chunk-03",
        document_id: "doc-llm-arch-01",
        chunk_index: 2,
        page_number: 5,
        token_count: 82,
        content: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With single attention head, averaging inhibits this capacity.",
        created_at: new Date().toISOString()
      },
      {
        id: "chunk-04",
        document_id: "doc-llm-arch-01",
        chunk_index: 3,
        page_number: 8,
        token_count: 54,
        content: "Positional encodings have the same dimension d_model as the embeddings, so that the two can be summed. We use sine and cosine functions of different frequencies.",
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: "doc-rag-vector-02",
    title: "pgvector Indexing and HNSW vs IVFFlat Benchmarks",
    filename: "pgvector_hnsw_performance.md",
    content_type: "text/markdown",
    total_chunks: 3,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    meta_info: { domain: "Databases & Vector Search", author: "Postgres Extensions Group" },
    chunks: [
      {
        id: "chunk-05",
        document_id: "doc-rag-vector-02",
        chunk_index: 0,
        page_number: 1,
        token_count: 58,
        content: "pgvector adds vector similarity search capabilities directly to PostgreSQL, supporting L2 distance, inner product, and cosine distance operators (<=>).",
        created_at: new Date().toISOString()
      },
      {
        id: "chunk-06",
        document_id: "doc-rag-vector-02",
        chunk_index: 1,
        page_number: 2,
        token_count: 72,
        content: "Hierarchical Navigable Small World (HNSW) graphs offer significantly higher queries per second (QPS) and recall than IVFFlat indexes, though requiring more memory during build time.",
        created_at: new Date().toISOString()
      },
      {
        id: "chunk-07",
        document_id: "doc-rag-vector-02",
        chunk_index: 2,
        page_number: 4,
        token_count: 60,
        content: "For cosine distance, vectors must be normalized to unit length or indexed using the vector_cosine_ops operator class to ensure accurate nearest neighbor rankings.",
        created_at: new Date().toISOString()
      }
    ]
  }
];

// Local state cache for mock fallback
let mockDocuments = [...SEED_DOCUMENTS];

export const api = {
  /**
   * Health check
   */
  async checkHealth() {
    try {
      const res = await fetch('/health', { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch (e) {
      // Return local simulated status
    }
    return {
      status: "connected (client mode)",
      service: "CogniDoc Visual Explorer",
      version: "0.1.0",
      pgvector_dimension: 384
    };
  },

  /**
   * Fetch list of documents
   */
  async getDocuments() {
    try {
      const res = await fetch(`${API_BASE}/documents/`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }
    return mockDocuments;
  },

  /**
   * Ingest a new document
   */
  async createDocument({ title, filename, content, meta_info = {} }) {
    try {
      const res = await fetch(`${API_BASE}/documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, filename, content, meta_info }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback chunking generator
    }

    // Client-side semantic chunking simulation
    const rawParagraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const generatedChunks = (rawParagraphs.length > 0 ? rawParagraphs : [content]).map((text, idx) => ({
      id: `chunk-local-${Date.now()}-${idx}`,
      document_id: `doc-${Date.now()}`,
      chunk_index: idx,
      page_number: Math.floor(idx / 2) + 1,
      token_count: text.split(/\s+/).length,
      content: text.trim(),
      created_at: new Date().toISOString()
    }));

    const newDoc = {
      id: `doc-${Date.now()}`,
      title,
      filename,
      content_type: "text/plain",
      meta_info,
      total_chunks: generatedChunks.length,
      chunks: generatedChunks,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockDocuments = [newDoc, ...mockDocuments];
    return newDoc;
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId) {
    try {
      const res = await fetch(`${API_BASE}/documents/${documentId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) return true;
    } catch (e) {
      // Fallback
    }

    mockDocuments = mockDocuments.filter(d => d.id !== documentId);
    return true;
  },

  /**
   * Vector similarity search
   */
  async searchCitations({ query, top_k = 5, document_id = null }) {
    try {
      const res = await fetch(`${API_BASE}/search/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k, document_id }),
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback simulated ranking
    }

    // Client-side keyword and similarity ranking calculation
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const candidates = [];

    const docsToSearch = document_id 
      ? mockDocuments.filter(d => d.id === document_id)
      : mockDocuments;

    for (const doc of docsToSearch) {
      for (const chunk of (doc.chunks || [])) {
        const text = chunk.content.toLowerCase();
        let matches = 0;
        for (const token of queryTokens) {
          if (text.includes(token)) matches += 1;
        }
        
        // Compute pseudo cosine similarity score
        const baseScore = queryTokens.length > 0 ? (matches / queryTokens.length) * 0.55 : 0.2;
        const lengthFactor = Math.min(0.2, text.length / 500);
        const randomVariance = ((chunk.chunk_index * 13) % 17) * 0.01;
        const similarity = Math.min(0.97, Math.max(0.42, baseScore + lengthFactor + randomVariance));

        candidates.push({
          chunk_id: chunk.id,
          document_id: doc.id,
          document_title: doc.title,
          chunk_index: chunk.chunk_index,
          page_number: chunk.page_number,
          content: chunk.content,
          similarity_score: Math.round(similarity * 1000) / 1000
        });
      }
    }

    candidates.sort((a, b) => b.similarity_score - a.similarity_score);
    return candidates.slice(0, top_k);
  }
};
