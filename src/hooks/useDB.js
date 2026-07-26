import { openDB } from 'idb';

// Constants
const DB_NAME = 'cil-vault-db-v2';
const DB_VERSION = 4;
const STORES = {
  PROPERTIES: 'properties',
  EQUIPMENT: 'equipment',
  DOCUMENTS: 'documents',
  ALERTS: 'alerts', // for future use
  MAINTENANCE_HISTORY: 'maintenance_history',
};

// Initialize the database
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create object stores if they don't exist
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      });

      // Add propertyId index to equipment store for version 4+
      if (oldVersion < 4 && db.objectStoreNames.contains(STORES.EQUIPMENT)) {
        const equipStore = transaction.objectStore(STORES.EQUIPMENT);
        if (!equipStore.indexNames.contains('by-property')) {
          equipStore.createIndex('by-property', 'propertyId', { unique: false });
        }
      }
    },
  });
};

export { initDB, STORES };