import React from 'react';

export function DocumentList({ documents, selectedDoc, onSelectDoc, onDeleteDoc }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Knowledge Library
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
          {documents.length} docs
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {documents.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No documents indexed yet. Ingest your first document to begin citation exploration.
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                  boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? '#a5b4fc' : 'var(--text-primary)', lineHeight: 1.3 }}>
                    {doc.title}
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    title="Delete document"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${doc.title}" and its indexed vector embeddings?`)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    style={{ padding: '0.2rem 0.4rem', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{doc.filename}</span>
                  <span className="badge badge-low">
                    {doc.total_chunks || (doc.chunks ? doc.chunks.length : 0)} chunks
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
