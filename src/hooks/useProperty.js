import { useState, useEffect } from 'react';
import { initDB, STORES } from './useDB';

// Hook to use IndexedDB for properties
export function useProperty() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load properties from IndexedDB
  const loadProperties = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.PROPERTIES, 'readonly');
      const store = tx.objectStore(STORES.PROPERTIES);
      const allProps = await store.getAll();
      setProperties(allProps);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError(err);
      setLoading(false);
    }
  };

  // Add a property
  const addProperty = async (property) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.PROPERTIES, 'readwrite');
      const store = tx.objectStore(STORES.PROPERTIES);
      await store.add(property);
      await tx.done;
      // Reload properties to get the updated list with the new ID
      await loadProperties();
    } catch (err) {
      console.error('Failed to add property:', err);
      setError(err);
      throw err;
    }
  };

  // Update a property
  const updateProperty = async (id, updates) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.PROPERTIES, 'readwrite');
      const store = tx.objectStore(STORES.PROPERTIES);
      const prop = await store.get(id);
      if (!prop) throw new Error('Property not found');
      const updatedProp = { ...prop, ...updates };
      await store.put(updatedProp);
      await tx.done;
      await loadProperties();
    } catch (err) {
      console.error('Failed to update property:', err);
      setError(err);
      throw err;
    }
  };

  // Delete a property
  const deleteProperty = async (id) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.PROPERTIES, 'readwrite');
      const store = tx.objectStore(STORES.PROPERTIES);
      await store.delete(id);
      await tx.done;
      await loadProperties();
    } catch (err) {
      console.error('Failed to delete property:', err);
      setError(err);
      throw err;
    }
  };

  // Clear all properties (for testing)
  const clearProperties = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.PROPERTIES, 'readwrite');
      const store = tx.objectStore(STORES.PROPERTIES);
      await store.clear();
      await tx.done;
      await loadProperties();
    } catch (err) {
      console.error('Failed to clear properties:', err);
      setError(err);
      throw err;
    }
  };

  // Load properties on initial mount
  useEffect(() => {
    loadProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    clearProperties,
  };
}