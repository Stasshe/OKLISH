export interface IDBDatabaseInfo {
  name: string;
  version?: number;
}

export interface IDBEntry {
  key: any;
  value: any;
}

function safeClose(db?: IDBDatabase | null) {
  try {
    db?.close();
  } catch {
    // ignore
  }
}

export async function listDatabases(): Promise<IDBDatabaseInfo[]> {
  if (!("indexedDB" in window)) return [];
  const idbAny = indexedDB as unknown as any;
  if (typeof idbAny.databases === "function") {
    try {
      const dbs = await idbAny.databases();
      if (!dbs) return [];
      return (dbs as any[])
        .filter((d) => d && d.name)
        .map((d) => ({ name: d.name as string, version: d.version as number | undefined }));
    } catch {
      return [];
    }
  }
  // browsers without indexedDB.databases cannot enumerate databases reliably
  return [];
}

export function openDatabase(name: string, version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req =
        typeof version === "number" ? indexedDB.open(name, version) : indexedDB.open(name as any);
      let called = false;
      req.onerror = () => {
        if (!called) {
          called = true;
          reject(req.error ?? new Error("Failed to open database"));
        }
      };
      req.onblocked = () => {
        // noop
      };
      req.onsuccess = () => {
        if (!called) {
          called = true;
          resolve(req.result);
        }
      };
      req.onupgradeneeded = () => {
        // avoid creating/upgrading schema accidentally; close and reject
        try {
          const db = (req as any).result as IDBDatabase;
          safeClose(db);
        } catch {
          // ignore
        }
        if (!called) {
          called = true;
          reject(new Error("Database does not exist or requires upgrade"));
        }
      };
    } catch (err) {
      reject(err);
    }
  });
}

export async function getObjectStoreNames(dbName: string): Promise<string[]> {
  const dbs = await listDatabases();
  const info = dbs.find((d) => d.name === dbName);
  const db = await openDatabase(dbName, info?.version);
  try {
    return Array.from(db.objectStoreNames as any as Iterable<string>);
  } finally {
    safeClose(db);
  }
}

export async function getEntries(
  dbName: string,
  storeName: string,
  limit = 1000,
): Promise<IDBEntry[]> {
  const dbs = await listDatabases();
  const info = dbs.find((d) => d.name === dbName);
  const db = await openDatabase(dbName, info?.version);
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.openCursor();
      const results: IDBEntry[] = [];
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          results.push({ key: cursor.key, value: cursor.value });
          if (results.length >= limit) {
            safeClose(db);
            resolve(results);
          } else {
            cursor.continue();
          }
        } else {
          safeClose(db);
          resolve(results);
        }
      };
      req.onerror = () => {
        safeClose(db);
        reject(req.error ?? new Error("Cursor error"));
      };
    } catch (err) {
      safeClose(db);
      reject(err);
    }
  });
}

export async function deleteEntry(
  dbName: string,
  storeName: string,
  key: IDBValidKey | IDBKeyRange,
) {
  const dbs = await listDatabases();
  const info = dbs.find((d) => d.name === dbName);
  const db = await openDatabase(dbName, info?.version);
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => {
        safeClose(db);
        resolve();
      };
      tx.onerror = () => {
        safeClose(db);
        reject(tx.error ?? new Error("Transaction error"));
      };
    } catch (err) {
      safeClose(db);
      reject(err);
    }
  });
}

export async function clearObjectStore(dbName: string, storeName: string) {
  const dbs = await listDatabases();
  const info = dbs.find((d) => d.name === dbName);
  const db = await openDatabase(dbName, info?.version);
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.clear();
      tx.oncomplete = () => {
        safeClose(db);
        resolve();
      };
      tx.onerror = () => {
        safeClose(db);
        reject(tx.error ?? new Error("Transaction error"));
      };
      req.onerror = () => {
        // handled by tx.onerror
      };
    } catch (err) {
      safeClose(db);
      reject(err);
    }
  });
}

export async function updateEntry(
  dbName: string,
  storeName: string,
  key: IDBValidKey | undefined,
  newValue: any,
): Promise<void> {
  const dbs = await listDatabases();
  const info = dbs.find((d) => d.name === dbName);
  const db = await openDatabase(dbName, info?.version);
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      // If the object store uses an inline key (`keyPath` not null), do not pass the
      // key parameter to `put`. Passing an out-of-line key when the store uses
      // inline keys causes the DOMException seen by the user.
      if (store.keyPath === null) {
        if (typeof key === "undefined") {
          store.put(newValue);
        } else {
          store.put(newValue, key);
        }
      } else {
        store.put(newValue);
      }
      tx.oncomplete = () => {
        safeClose(db);
        resolve();
      };
      tx.onerror = () => {
        safeClose(db);
        reject(tx.error ?? new Error("Transaction error"));
      };
    } catch (err) {
      safeClose(db);
      reject(err);
    }
  });
}

export function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error("Failed to delete database"));
      req.onblocked = () => {
        // noop
      };
    } catch (err) {
      reject(err);
    }
  });
}
