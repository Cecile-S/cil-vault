import { useState, useEffect, useCallback } from 'react';
import { initDB, STORES } from './useDB';

/**
 * Hook to manage maintenance history for equipment.
 * Each maintenance entry stores: date, type, cost, company, notes, equipmentId
 */
export function useMaintenanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecords = useCallback(async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.MAINTENANCE_HISTORY, 'readonly');
      const store = tx.objectStore(STORES.MAINTENANCE_HISTORY);
      const all = await store.getAll();
      setRecords(all);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load maintenance history:', err);
      setError(err);
      setLoading(false);
    }
  }, []);

  const addRecord = async (record) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.MAINTENANCE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORES.MAINTENANCE_HISTORY);
      const newRecord = {
        equipmentId: record.equipmentId,
        date: record.date || new Date().toISOString().split('T')[0],
        type: record.type || 'entretien',
        cost: record.cost || 0,
        company: record.company || '',
        notes: record.notes || '',
        createdAt: new Date().toISOString(),
      };
      await store.add(newRecord);
      await tx.done;
      await loadRecords();
      return newRecord;
    } catch (err) {
      console.error('Failed to add maintenance record:', err);
      setError(err);
      throw err;
    }
  };

  const deleteRecord = async (id) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORES.MAINTENANCE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORES.MAINTENANCE_HISTORY);
      await store.delete(id);
      await tx.done;
      await loadRecords();
    } catch (err) {
      console.error('Failed to delete maintenance record:', err);
      setError(err);
      throw err;
    }
  };

  const getRecordsByEquipment = (equipmentId) => {
    return records
      .filter(r => r.equipmentId === equipmentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return {
    records,
    loading,
    error,
    addRecord,
    deleteRecord,
    getRecordsByEquipment,
    loadRecords,
  };
}