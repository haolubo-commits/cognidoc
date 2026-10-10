import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export function Header({ onOpenUpload }) {
  const [healthStatus, setHealthStatus] = useState('checking...');

  useEffect(() => {
    api.checkHealth().then((res) => {
      setHealthStatus(res.status || 'online');
    });
  }, []);

  return (
    <header className="header-wrapper">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">CogniDoc</h1>
            <p className="brand-tagline">Visual RAG & Citation Explorer</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="status-pill">
            <span className="status-dot"></span>
            <span>API: {healthStatus}</span>
          </div>

          <button className="btn btn-primary" onClick={onOpenUpload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ingest Document
          </button>
        </div>
      </div>
    </header>
  );
}
