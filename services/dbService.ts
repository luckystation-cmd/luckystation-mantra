
import { GeneratedImage } from "../types";

const DB_NAME = 'LuckystationDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        reject("Could not open database");
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create object store with 'id' as keyPath
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveImage(image: GeneratedImage): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");
      
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(image);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllImages(): Promise<GeneratedImage[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      // Get all images (can be optimized with cursors/indexes later if needed)
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by timestamp desc (newest first)
        const results = request.result as GeneratedImage[];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject("Database not initialized");

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DBService();
