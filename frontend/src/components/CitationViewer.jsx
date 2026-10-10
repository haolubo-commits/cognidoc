import React, { useRef, useEffect } from 'react';
import { ConfidenceBadge } from './ConfidenceBadge';

const SAMPLE_QUERIES = [
  "How does Scaled Dot-Product Attention compute output?",
  "What are the benefits of HNSW indexing in pgvector?",
  "How do multi-head attention representation subspaces work?",
  "Why is vector normalization required for cosine distance?"
];

export function CitationViewer({
  selectedDoc,
  query,
  setQuery,
  results,
  isSearching,
  activeCitationId,
  setActiveCitationId,
  onSearch,
  topK,
  setTopK
}) {
  const chunkRefs = useRef({});

  // Auto-scroll to selected chunk in preview panel
  useEffect(() => {
    if (activeCitationId && chunkRefs.current[activeCitationId]) {
      chunkRefs.current[activeCitationId].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeCitationId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query, selectedDoc?.id, topK);
  };

  const handleChipClick = (q) => {
    setQuery(q);
    onSearch(q, selectedDoc?.id, topK);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search Input Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Ask a question to retrieve semantic citations across vector chunks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                style={{
                  padding: '0.8rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
                title="Top-K nearest neighbors"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={8}>Top 8</option>
              </select>

              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.5rem' }}
              >
                {isSearching ? 'Vector Matching...' : 'Retrieve Citations'}
              </button>
            </div>
          </div>

          {/* Quick Query Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Suggestions:
            </span>
            {SAMPLE_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(q)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Split-screen Citation Explorer & Source Document Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: '1.25rem' }}>
        {/* Left Pane: Ranked Citations */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Ranked Citations</h3>
              <span className="badge badge-low">{results.length} found</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click card to jump to chunk</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {results.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: '0.75rem' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>Run a query above or click a suggestion to view retrieved citations with pgvector similarity ranks.</p>
              </div>
            ) : (
              results.map((hit, idx) => {
                const isActive = activeCitationId === hit.chunk_id;
                return (
                  <div
                    key={hit.chunk_id}
                    onClick={() => setActiveCitationId(hit.chunk_id)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                      border: isActive ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                      boxShadow: isActive ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#c7d2fe'
                        }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          Chunk {hit.chunk_index + 1} (p. {hit.page_number})
                        </span>
                      </div>
                      <ConfidenceBadge score={hit.similarity_score} />
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      "{hit.content}"
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '0.4rem' }}>
                      <span>Doc: {hit.document_title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>score: {hit.similarity_score}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Source Document Reader */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Document Chunk Reader</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {selectedDoc?.title || 'No Document Selected'}
              </p>
            </div>
            <span className="badge badge-low">
              {selectedDoc?.chunks?.length || 0} sequential chunks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {!selectedDoc?.chunks || selectedDoc.chunks.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Select a document from the Knowledge Library to inspect its indexed chunks.
              </div>
            ) : (
              selectedDoc.chunks.map((chunk) => {
                const isHighlighted = activeCitationId === chunk.id;
                return (
                  <div
                    key={chunk.id}
                    ref={(el) => (chunkRefs.current[chunk.id] = el)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isHighlighted ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      border: isHighlighted ? '1.5px solid #818cf8' : '1px solid var(--border-subtle)',
                      boxShadow: isHighlighted ? '0 0 20px rgba(99, 102, 241, 0.35)' : 'none',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: isHighlighted ? '#a5b4fc' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        CHUNK #{chunk.chunk_index + 1} &bull; PAGE {chunk.page_number}
                      </span>
                      {isHighlighted && (
                        <span className="badge badge-high" style={{ animation: 'pulse 1.5s infinite' }}>
                          Active Citation
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {chunk.content}
                    </p>

                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      tokens: ~{chunk.token_count}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
