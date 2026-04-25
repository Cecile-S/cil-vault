import { useState, useEffect } from 'react';
import { openDB } from 'idb';

// Constants
const DB_NAME = 'cil-vault-db';
const DB_VERSION = 1;
const ALERTS_STORE = 'alerts';
const DISMISSED_ALERTS_STORE = 'dismissed_alerts';

// Initialize the database
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object store for alerts if it doesn't exist
      if (!db.objectStoreNames.contains(ALERTS_STORE)) {
        db.createObjectStore(ALERTS_STORE, { keyPath: 'id', autoIncrement: true });
      }
      // Create object store for dismissed alerts
      if (!db.objectStoreNames.contains(DISMISSED_ALERTS_STORE)) {
        db.createObjectStore(DISMISSED_ALERTS_STORE, { keyPath: 'id' });
      }
    },
  });
};

// Hook to use IndexedDB for alerts (system alerts are stored here)
export function useIndexedDBAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load alerts and dismissed alerts from IndexedDB
  const loadData = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction([ALERTS_STORE, DISMISSED_ALERTS_STORE], 'readonly');
      const alertsStore = tx.objectStore(ALERTS_STORE);
      const dismissedStore = tx.objectStore(DISMISSED_ALERTS_STORE);
      const [allAlerts, allDismissed] = await Promise.all([
        alertsStore.getAll(),
        dismissedStore.getAll(),
      ]);
      setAlerts(allAlerts);
      setDismissed(allDismissed.map(d => d.id));
      setLoading(false);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError(err);
      setLoading(false);
    }
  };

  // Add a system alert
  const addAlert = async (alert) => {
    try {
      const db = await initDB();
      const tx = db.transaction(ALERTS_STORE, 'readwrite');
      const store = tx.objectStore(ALERTS_STORE);
      await store.add(alert);
      await tx.done;
      // Reload to get updated list with IDs
      await loadData();
    } catch (err) {
      console.error('Failed to add alert:', err);
      setError(err);
      throw err;
    }
  };

  // Dismiss an alert (store its ID)
  const dismissAlert = async (alertId) => {
    try {
      const db = await initDB();
      const tx = db.transaction(DISMISSED_ALERTS_STORE, 'readwrite');
      const store = tx.objectStore(DISMISSED_ALERTS_STORE);
      await store.add({ id: alertId });
      await tx.done;
      await loadData();
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
      setError(err);
      throw err;
    }
  };

  // Clear all dismissed alerts
  const clearDismissed = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(DISMISSED_ALERTS_STORE, 'readwrite');
      const store = tx.objectStore(DISMISSED_ALERTS_STORE);
      await store.clear();
      await tx.done;
      await loadData();
    } catch (err) {
      console.error('Failed to clear dismissed alerts:', err);
      setError(err);
      throw err;
    }
  };

  // Load on initial mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    alerts,
    dismissed,
    loading,
    error,
    addAlert,
    dismissAlert,
    clearDismissed,
  };
}