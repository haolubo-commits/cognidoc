import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCitationId, setActiveCitationId] = useState(null);

  const executeSearch = useCallback(async (searchQuery, targetDocId = null, topK = 5) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const hits = await api.searchCitations({
        query: searchQuery.trim(),
        document_id: targetDocId,
        top_k: topK
      });
      setResults(hits);
      if (hits.length > 0) {
        setActiveCitationId(hits[0].chunk_id);
      } else {
        setActiveCitationId(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    setResults,
    isSearching,
    activeCitationId,
    setActiveCitationId,
    executeSearch
  };
}
