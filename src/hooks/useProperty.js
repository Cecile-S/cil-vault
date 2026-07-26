import { createContext, useContext, useState, useEffect, createElement } from 'react';
import { initDB, STORES } from './useDB';

// Contexte partage : toutes les pages voient le meme etat des biens en temps reel
// (avant : chaque composant appelant useProperty() avait son propre etat independant,
// ce qui causait un blocage sur l'ecran de creation apres avoir cree un bien)
const PropertyContext = createContext(null);

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const addProperty = async (property) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.PROPERTIES, 'readwrite');
      const store = tx.objectStore(STORES.PROPERTIES);
      await store.add(property);
      await tx.done;
      await loadProperties();
    } catch (err) {
      console.error('Failed to add property:', err);
      setError(err);
      throw err;
    }
  };

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

  useEffect(() => {
    loadProperties();
  }, []);

  const value = {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    clearProperties,
  };

  return createElement(PropertyContext.Provider, { value }, children);
}

// Hook de consommation : toutes les pages qui appellent useProperty() lisent le MEME etat partage
export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}
