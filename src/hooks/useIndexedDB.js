import { useState, useEffect } from 'react';
import { openDB, deleteDB } from 'idb';

// Constants
const DB_NAME = 'cil-vault-db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

// Initialize the database
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// Hook to use IndexedDB for documents
export function useIndexedDB() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load documents from IndexedDB
  const loadDocuments = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const allDocs = await store.getAll();
      setDocuments(allDocs);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err);
      setLoading(false);
    }
  };

  // Add a document
  const addDocument = async (doc) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.add(doc);
      await tx.done;
      // Reload documents to get the updated list with the new ID
      await loadDocuments();
    } catch (err) {
      console.error('Failed to add document:', err);
      setError(err);
      throw err;
    }
  };

  // Update a document
  const updateDocument = async (id, updates) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
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

  // Delete a document
  const deleteDocument = async (id) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.delete(id);
      await tx.done;
      await loadDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError(err);
      throw err;
    }
  };

  // Clear all documents (for testing)
  const clearDocuments = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.clear();
      await tx.done;
      await loadDocuments();
    } catch (err) {
      console.error('Failed to clear documents:', err);
      setError(err);
      throw err;
    }
  };

  // Load documents on initial mount
  useEffect(() => {
    loadDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    clearDocuments,
  };
}