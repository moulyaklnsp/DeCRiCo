import React, { createContext, useContext, useEffect } from 'react';

interface PersistentStorageContextType {
  saveData: (key: string, data: any) => void;
  loadData: (key: string) => any;
  removeData: (key: string) => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
}

const PersistentStorageContext = createContext<PersistentStorageContextType | undefined>(undefined);

export const usePersistentStorage = () => {
  const context = useContext(PersistentStorageContext);
  if (context === undefined) {
    throw new Error('usePersistentStorage must be used within a PersistentStorageProvider');
  }
  return context;
};

export const PersistentStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const saveData = (key: string, data: any) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      
      // Also save to IndexedDB for better persistence
      if ('indexedDB' in window) {
        const request = indexedDB.open('DeCRiCoStorage', 1);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['data'], 'readwrite');
          const store = transaction.objectStore('data');
          store.put({ key, data: serializedData });
        };
      }
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const loadData = (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  };

  const removeData = (key: string) => {
    try {
      localStorage.removeItem(key);
      
      // Also remove from IndexedDB
      if ('indexedDB' in window) {
        const request = indexedDB.open('DeCRiCoStorage', 1);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['data'], 'readwrite');
          const store = transaction.objectStore('data');
          store.delete(key);
        };
      }
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  };

  const clearAllData = () => {
    try {
      localStorage.clear();
      
      // Also clear IndexedDB
      if ('indexedDB' in window) {
        const request = indexedDB.open('DeCRiCoStorage', 1);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['data'], 'readwrite');
          const store = transaction.objectStore('data');
          store.clear();
        };
      }
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const exportData = (): string => {
    try {
      const allData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allData[key] = localStorage.getItem(key);
        }
      }
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  };

  const importData = (data: string): boolean => {
    try {
      const parsedData = JSON.parse(data);
      Object.entries(parsedData).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  };

  // Initialize IndexedDB
  useEffect(() => {
    if ('indexedDB' in window) {
      const request = indexedDB.open('DeCRiCoStorage', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' });
        }
      };
    }
  }, []);

  return (
    <PersistentStorageContext.Provider value={{
      saveData,
      loadData,
      removeData,
      clearAllData,
      exportData,
      importData
    }}>
      {children}
    </PersistentStorageContext.Provider>
  );
};