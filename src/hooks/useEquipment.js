import { useState, useEffect } from 'react';
import { initDB, STORES } from './useDB';

// Hook to use IndexedDB for equipment
export function useEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load equipment from IndexedDB
  const loadEquipment = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.EQUIPMENT, 'readonly');
      const store = tx.objectStore(STORES.EQUIPMENT);
      const allEquipment = await store.getAll();
      setEquipment(allEquipment);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load equipment:', err);
      setError(err);
      setLoading(false);
    }
  };

  // Add an equipment
  const addEquipment = async (equip) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.EQUIPMENT, 'readwrite');
      const store = tx.objectStore(STORES.EQUIPMENT);
      await store.add(equip);
      await tx.done;
      // Reload equipment to get the updated list with the new ID
      await loadEquipment();
    } catch (err) {
      console.error('Failed to add equipment:', err);
      setError(err);
      throw err;
    }
  };

  // Update an equipment
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

  // Delete an equipment
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

  // Clear all equipment (for testing)
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

  // Load equipment on initial mount
  useEffect(() => {
    loadEquipment();
  }, []);

  return {
    equipment,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    clearEquipment,
  };
}