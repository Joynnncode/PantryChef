const DB_NAME = "pantrychef";
const DB_VERSION = 1;
const STORE_NAME = "user-meal-preps";

export interface UserMealPrep {
  id: string;
  title: string;
  notes: string;
  tags: string[];
  fridgeDays: number | null;
  freezerDays: number | null;
  photo: Blob | null;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllUserMealPreps(): Promise<UserMealPrep[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const entries = (request.result as UserMealPrep[]).sort(
        (a, b) => b.createdAt - a.createdAt
      );
      resolve(entries);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function addUserMealPrep(
  entry: Omit<UserMealPrep, "id" | "createdAt">
): Promise<UserMealPrep> {
  const db = await openDB();
  const full: UserMealPrep = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(full);
    tx.oncomplete = () => resolve(full);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteUserMealPrep(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
