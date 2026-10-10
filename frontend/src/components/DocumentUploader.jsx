import React, { useState } from 'react';

const PRESET_TEMPLATES = [
  {
    title: "KV-Cache Compression & PagedAttention Mechanics",
    filename: "vllm_paged_attention_paper.txt",
    content: "PagedAttention is an attention algorithm inspired by the classic virtual memory and paging techniques in operating systems.\n\nIn LLM serving, the memory for keys and values (KV cache) is dynamically allocated in contiguous memory, which leads to significant internal and external fragmentation.\n\nPagedAttention stores continuous keys and values in non-contiguous physical memory pages, enabling near-zero waste in KV cache memory and allowing dynamic batching with up to 4x throughput improvements."
  },
  {
    title: "RAG Triad Metrics: Groundedness, Relevance, and Completeness",
    filename: "rag_triad_evaluation_guide.md",
    content: "The RAG Triad evaluates the three fundamental legs of a retrieval-augmented generation pipeline:\n\n1. Context Relevance: Verifies that the retrieved chunks are relevant to the user query and exclude noisy background distractors.\n\n2. Groundedness: Measures whether the LLM's generated response is strictly supported by the retrieved context without hallucinations.\n\n3. Answer Relevance: Ensures the generated response directly addresses the user query rather than providing evasive or tangential statements."
  }
];

export function DocumentUploader({ isOpen, onClose, onUpload }) {
  const [title, setTitle] = useState('');
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setFilename(preset.filename);
    setContent(preset.content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpload({
        title: title.trim(),
        filename: filename.trim() || `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
        content: content.trim(),
        meta_info: { uploaded_at: new Date().toISOString() }
      });
      // reset and close
      setTitle('');
      setFilename('');
      setContent('');
      onClose();
    } catch (err) {
      alert('Ingestion failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Ingest Knowledge Document</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Runs semantic chunking pipeline & pgvector embeddings
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}>
            ✕
          </button>
        </div>

        {/* Preset quick buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.45rem', fontWeight: 500 }}>
            Load Sample Template:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PRESET_TEMPLATES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem' }}
              >
                + {p.title.split(' ')[0]} {p.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Document Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. FlashAttention-3 Fast Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Filename
            </label>
            <input
              type="text"
              placeholder="e.g. flash_attention_v3.pdf"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Raw Text Content
            </label>
            <textarea
              required
              rows={8}
              placeholder="Paste raw markdown, research paper excerpts, or documentation text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Chunking & Embedding...' : 'Ingest Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
