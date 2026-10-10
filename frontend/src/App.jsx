import React, { useState } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DocumentList } from './components/DocumentList';
import { CitationViewer } from './components/CitationViewer';
import { DocumentUploader } from './components/DocumentUploader';
import { useDocuments } from './hooks/useDocuments';
import { useSearch } from './hooks/useSearch';

export function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [topK, setTopK] = useState(5);

  const {
    documents,
    selectedDoc,
    setSelectedDoc,
    isLoading: isDocsLoading,
    addDocument,
    removeDocument
  } = useDocuments();

  const {
    query,
    setQuery,
    results,
    isSearching,
    activeCitationId,
    setActiveCitationId,
    executeSearch
  } = useSearch();

  return (
    <div className="app-container">
      <Header onOpenUpload={() => setIsUploadOpen(true)} />

      <main className="main-content">
        <StatsBar documents={documents} totalResults={results.length} />

        <div className="dashboard-grid">
          <aside>
            <DocumentList
              documents={documents}
              selectedDoc={selectedDoc}
              onSelectDoc={(doc) => {
                setSelectedDoc(doc);
                // Optionally re-execute search filtered to this doc
                if (query.trim()) {
                  executeSearch(query, doc.id, topK);
                }
              }}
              onDeleteDoc={removeDocument}
            />
          </aside>

          <section>
            <CitationViewer
              selectedDoc={selectedDoc}
              query={query}
              setQuery={setQuery}
              results={results}
              isSearching={isSearching}
              activeCitationId={activeCitationId}
              setActiveCitationId={setActiveCitationId}
              onSearch={executeSearch}
              topK={topK}
              setTopK={setTopK}
            />
          </section>
        </div>
      </main>

      <DocumentUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={addDocument}
      />
    </div>
  );
}

export default App;
