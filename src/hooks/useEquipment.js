import { createContext, useContext, useState, useEffect, createElement } from 'react';
import { initDB, STORES } from './useDB';

// Contexte partage : evite que chaque composant ait son propre etat independant
const EquipmentContext = createContext(null);

export function EquipmentProvider({ children }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEquipment = async (propertyId) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.EQUIPMENT, 'readonly');
      const store = tx.objectStore(STORES.EQUIPMENT);
      let allEquipment;
      if (propertyId) {
        const index = store.index('by-property');
        allEquipment = await index.getAll(propertyId);
      } else {
        allEquipment = await store.getAll();
      }
      setEquipment(allEquipment || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load equipment:', err);
      setError(err);
      setLoading(false);
    }
  };

  const addEquipment = async (equip) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.EQUIPMENT, 'readwrite');
      const store = tx.objectStore(STORES.EQUIPMENT);
      await store.add(equip);
      await tx.done;
      await loadEquipment();
    } catch (err) {
      console.error('Failed to add equipment:', err);
      setError(err);
      throw err;
    }
  };

  const updateEquipment = async (id, updates) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.EQUIPMENT, 'readwrite');
      const store = tx.objectStore(STORES.EQUIPMENT);
      const equip = await store.get(id);
      if (!equip) throw new Error('Equipment not found');
      const updatedEquip = { ...equip, ...updates };
      await store.put(updatedEquip);
      await tx.done;
      await loadEquipment();
    } catch (err) {
      console.error('Failed to update equipment:', err);
      setError(err);
      throw err;
    }
  };

  const deleteEquipment = async (id) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.EQUIPMENT, 'readwrite');
      const store = tx.objectStore(STORES.EQUIPMENT);
      await store.delete(id);
      await tx.done;
      await loadEquipment();
    } catch (err) {
      console.error('Failed to delete equipment:', err);
      setError(err);
      throw err;
    }
  };

  const clearEquipment = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.EQUIPMENT, 'readwrite');
      const store = tx.objectStore(STORES.EQUIPMENT);
      await store.clear();
      await tx.done;
      await loadEquipment();
    } catch (err) {
      console.error('Failed to clear equipment:', err);
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const getEquipmentByProperty = (propertyId) => {
    if (!propertyId) return equipment;
    return equipment.filter(eq => eq.propertyId === propertyId);
  };

  const value = {
    equipment,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    clearEquipment,
    loadEquipment,
    getEquipmentByProperty,
  };

  return createElement(EquipmentContext.Provider, { value }, children);
}

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
}
