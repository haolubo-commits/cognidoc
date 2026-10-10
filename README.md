# 📄 CogniDoc — Interactive Visual RAG & Citation Explorer

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pgvector-336791.svg?style=flat&logo=postgresql)](https://github.com/pgvector/pgvector)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?style=flat&logo=python)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **CogniDoc** is a production-grade, lightweight RAG (Retrieval-Augmented Generation) engine designed for visual transparency. Rather than returning black-box answers, CogniDoc indexes documents with `pgvector` and matches answers to verifiable source chunks with confidence scoring.

---

## 🏗️ Architecture

```mermaid
graph TD
    User([User / Client]) -->|Upload PDF/Doc| IngestionAPI[FastAPI Ingestion]
    IngestionAPI -->|Semantic Sliding Chunker| Chunker[Chunking Service]
    Chunker -->|Vector Embeddings| Embedder[Vector Engine]
    Embedder -->|Store Vector + Metadata| PG[(PostgreSQL + pgvector)]
    
    User -->|Query + Context Request| SearchAPI[Hybrid Search Engine]
    SearchAPI -->|Cosine Similarity| PG
    SearchAPI -->|Ranked Chunks with Page/Score| User
```

---

## 🌟 Key Features (4-Day Roadmap)

- [x] **Day 1: Scaffolding & Vector Schema**: SQLAlchemy 2.0 models with `pgvector` integration, semantic sliding chunker service, and Pydantic v2 schemas.
- [x] **Day 2: Core Retrieval & Search API**: Ingestion service, embedding normalization, document CRUD and vector similarity search endpoints.
- [x] **Day 3: Interactive React Citation Explorer**: Split-screen document reader with glowing chunk highlights and similarity confidence badges.
- [ ] **Day 4: Benchmarks & Polish**: Pytest integration tests, synthetic retrieval benchmarks, and Docker compose environment.

---

## 🚀 Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ with `pgvector` extension enabled

### Backend Setup
```bash
cd cognidoc/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd cognidoc/frontend

# Install dependencies and start Vite dev server
npm install
npm run dev
```
Open `http://localhost:5173` to launch the Interactive Citation Explorer.


---

## 📑 API Endpoints Preview

- `GET /health` — Service health and database connection status.
- `POST /api/v1/documents/` — Upload document and run semantic chunking pipeline.
- `POST /api/v1/search/` — Hybrid vector similarity search returning ranked source citations.
