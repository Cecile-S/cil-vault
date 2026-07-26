import { createContext, useContext, useState, useEffect, createElement } from 'react';
import { initDB, STORES } from './useDB';

// Contexte partage : evite que chaque composant ait son propre etat independant
const DocumentsContext = createContext(null);

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = async (propertyId) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readonly');
      const store = tx.objectStore(STORES.DOCUMENTS);
      let allDocuments;
      if (propertyId) {
        const index = store.index('by-property');
        allDocuments = await index.getAll(propertyId);
      } else {
        allDocuments = await store.getAll();
      }
      setDocuments(allDocuments || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err);
      setLoading(false);
    }
  };

  const addDocument = async (doc) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORES.DOCUMENTS);
      await store.add(doc);
      await tx.done;
      await loadDocuments();
    } catch (err) {
      console.error('Failed to add document:', err);
      setError(err);
      throw err;
    }
  };

  const updateDocument = async (id, updates) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORES.DOCUMENTS);
      const doc = await store.get(id);
      if (!doc) throw new Error('Document not found');
      const updatedDoc = { ...doc, ...updates };
      await store.put(updatedDoc);
      await tx.done;
      await loadDocuments();
    } catch (err) {
      console.error('Failed to update document:', err);
      setError(err);
      throw err;
    }
  };

  const deleteDocument = async (id) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORES.DOCUMENTS);
      await store.delete(id);
      await tx.done;
      await loadDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError(err);
      throw err;
    }
  };

  const clearDocuments = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORES.DOCUMENTS);
      await store.clear();
      await tx.done;
      await loadDocuments();
    } catch (err) {
      console.error('Failed to clear documents:', err);
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const getDocumentsByProperty = (propertyId) => {
    if (!propertyId) return documents;
    return documents.filter(doc => doc.propertyId === propertyId);
  };

  const value = {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    clearDocuments,
    loadDocuments,
    getDocumentsByProperty,
  };

  return createElement(DocumentsContext.Provider, { value }, children);
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
