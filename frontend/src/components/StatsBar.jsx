import React from 'react';

export function StatsBar({ documents = [], totalResults = 0 }) {
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.total_chunks || (doc.chunks ? doc.chunks.length : 0)), 0);

  return (
    <div className="stats-grid">
      <div className="glass-panel stat-card">
        <div className="stat-icon indigo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div>
          <div className="stat-label">Indexed Documents</div>
          <div className="stat-value">{documents.length}</div>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div>
          <div className="stat-label">Vector Chunks</div>
          <div className="stat-value">{totalChunks}</div>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon emerald">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <div className="stat-label">pgvector Embeddings</div>
          <div className="stat-value">384-D Cosine</div>
        </div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div>
          <div className="stat-label">Active Citations</div>
          <div className="stat-value">{totalResults}</div>
        </div>
      </div>
    </div>
  );
}
