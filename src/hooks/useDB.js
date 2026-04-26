import { openDB } from 'idb';

// Constants
const DB_NAME = 'cil-vault-db-v2';
const DB_VERSION = 2;
const STORES = {
  PROPERTIES: 'properties',
  EQUIPMENT: 'equipment',
  DOCUMENTS: 'documents',
  ALERTS: 'alerts', // for future use
};

// Initialize the database
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      });
    },
  });
};

export { initDB, STORES };