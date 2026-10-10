# ⚛️ CogniDoc Frontend — Interactive Citation Explorer

[![React](https://img.shields.io/badge/Frontend-React%2018-61dafb.svg?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-646cff.svg?style=flat&logo=vite)](https://vitejs.dev)
[![Architecture](https://img.shields.io/badge/Design-Glassmorphic%20UI-indigo.svg)](https://github.com/haolubo-commits/cognidoc)

Interactive React client for **CogniDoc (Visual RAG & Citation Explorer)**. Allows users to query ingested documents, inspect similarity ranking scores calculated via `pgvector`, and visually highlight cited chunks within source documents.

---

## 🎨 Features & Capabilities

- **Split-Screen Citation Explorer**: Dual-pane interface comparing ranked query matches directly against the sequential document stream.
- **Glowing Citation Synchronization**: Clicking any citation card smoothly scrolls and activates a high-contrast glowing highlight on the exact chunk.
- **Confidence Scoring Badges**: Color-coded badges indicating cosine similarity confidence (High >= 80%, Moderate 60-80%, Low < 60%).
- **Interactive Document Ingestion**: Modal form supporting raw text ingestion with built-in presets (PagedAttention, RAG Triad).
- **Graceful Client Fallback**: Interactive demo mode when running decoupled from the backend with instant local similarity computation.

---

## 🏗️ Directory Architecture

```text
frontend/
├── index.html               # HTML5 shell with Plus Jakarta Sans & JetBrains Mono
├── package.json             # React 18 & Vite dependencies
├── vite.config.js           # Proxy configuration for /api/v1 FastAPI backend
└── src/
    ├── index.css            # Dark-mode design system & glassmorphism variables
    ├── main.jsx             # React entrypoint
    ├── App.jsx              # Main dashboard view & layout coordinator
    ├── services/
    │   └── api.js           # REST API client with local simulation fallback
    ├── hooks/
    │   ├── useDocuments.js  # Document library state & CRUD actions
    │   └── useSearch.js     # Semantic similarity query hook
    └── components/
        ├── Header.jsx       # Brand banner, live API status pill & action trigger
        ├── StatsBar.jsx     # Live metrics (docs, chunks, pgvector dims, matches)
        ├── DocumentList.jsx # Knowledge library sidebar
        ├── CitationViewer.jsx # Split-screen citation explorer & chunk reader
        ├── ConfidenceBadge.jsx # Color-coded similarity pill
        └── DocumentUploader.jsx # Document ingestion modal with templates
```

---

## 🚀 Running Locally

```bash
cd projects/cognidoc/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application runs at `http://localhost:5173`.
