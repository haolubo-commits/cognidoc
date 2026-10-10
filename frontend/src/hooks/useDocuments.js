import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        setSelectedDoc(docs[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDoc]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = async (docData) => {
    const newDoc = await api.createDocument(docData);
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    return newDoc;
  };

  const removeDocument = async (id) => {
    await api.deleteDocument(id);
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== id);
      if (selectedDoc?.id === id) {
        setSelectedDoc(updated[0] || null);
      }
      return updated;
    });
  };

  return {
    documents,
    selectedDoc,
    setSelectedDoc,
    isLoading,
    error,
    refreshDocuments: fetchDocuments,
    addDocument,
    removeDocument
  };
}
