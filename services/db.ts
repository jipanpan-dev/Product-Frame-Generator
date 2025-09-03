const DB_NAME = 'ProductFrameDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const addImage = async (data: string): Promise<string> => {
  const db = await initDB();
  const id = crypto.randomUUID();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.add({ id, data });
    request.onsuccess = () => resolve(id);
    request.onerror = () => {
      console.error('Error adding image to DB:', request.error);
      reject('Error adding image');
    };
  });
};

export const getImage = async (id: string): Promise<string | null> => {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      resolve(request.result ? request.result.data : null);
    };
    request.onerror = () => {
      console.error('Error getting image from DB:', request.error);
      reject('Error getting image');
    };
  });
};

export const deleteImage = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error deleting image from DB:', request.error);
      reject('Error deleting image');
    };
  });
};

export const getImages = async (ids: string[]): Promise<Record<string, string>> => {
  if (ids.length === 0) return {};
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  const promises = ids.map(id => {
    return new Promise<{ id: string, data: string | null }>((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve({ id, data: request.result ? request.result.data : null });
      request.onerror = () => {
          console.error(`Error getting image ${id} from DB:`, request.error);
          resolve({ id, data: null }); // Resolve with null on error to not fail the whole batch
      };
    });
  });

  const results = await Promise.all(promises);
  const imageMap: Record<string, string> = {};
  for (const result of results) {
    if (result.data) {
      imageMap[result.id] = result.data;
    }
  }
  return imageMap;
};
