import { useState, useEffect } from 'react';
import { openDB } from 'idb';

// Constants
const DB_NAME = 'cil-vault-db';
const DB_VERSION = 1;
const EQUIPMENT_STORE = 'equipment';

// Initialize the database
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object store for equipment if it doesn't exist
      if (!db.objectStoreNames.contains(EQUIPMENT_STORE)) {
        db.createObjectStore(EQUIPMENT_STORE, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// Hook to use IndexedDB for equipment
export function useIndexedDBEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load equipment from IndexedDB
  const loadEquipment = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(EQUIPMENT_STORE, 'readonly');
      const store = tx.objectStore(EQUIPMENT_STORE);
      const allItems = await store.getAll();
      setEquipmentList(allItems);
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
      const tx = db.transaction(EQUIPMENT_STORE, 'readwrite');
      const store = tx.objectStore(EQUIPMENT_STORE);
      await store.add(equip);
      await tx.done;
      // Reload to get updated list with IDs
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
      const tx = db.transaction(EQUIPMENT_STORE, 'readwrite');
      const store = tx.objectStore(EQUIPMENT_STORE);
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
      const tx = db.transaction(EQUIPMENT_STORE, 'readwrite');
      const store = tx.objectStore(EQUIPMENT_STORE);
      await store.delete(id);
      await tx.done;
      await loadEquipment();
    } catch (err) {
      console.error('Failed to delete equipment:', err);
      setError(err);
      throw err;
    }
  };

  // Load on initial mount
  useEffect(() => {
    loadEquipment();
  }, []);

  return {
    equipment: equipmentList,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  };
}