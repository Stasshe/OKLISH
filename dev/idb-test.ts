function getOutputEl() {
  return document.getElementById('idb-output');
}

function log(...args: any[]) {
  console.log(...args);
  const el = getOutputEl();
  if (!el) return;
  try {
    const text = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a, null, 2))).join(' ');
    el.textContent = `${new Date().toLocaleTimeString()} — ${text}\n` + el.textContent;
  } catch (e) {
    el.textContent = `${new Date().toLocaleTimeString()} — [Unserializable]\n` + el.textContent;
  }
}

const DB_NAME = 'oklish_test_db';
const STORE_NAME = 'testStore';
const DB_VERSION = 1;

function openDB(name = DB_NAME) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(name, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function createTestDB(name = DB_NAME) {
  try {
    const db = await openDB(name);
    db.close();
    log(`Created/opened DB "${name}"`);
  } catch (err) {
    log('createTestDB error', err);
    throw err;
  }
}

export async function addTestEntry(payload?: Record<string, any>) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const data = Object.assign({ createdAt: Date.now(), text: 'entry-' + Math.random().toString(36).slice(2, 8) }, payload || {});
    const req = store.add(data as any);
    return new Promise<any>((resolve, reject) => {
      req.onsuccess = () => {
        db.close();
        log('Added entry', req.result);
        resolve(req.result);
      };
      req.onerror = () => {
        db.close();
        log('addTestEntry error', req.error);
        reject(req.error);
      };
    });
  } catch (err) {
    log('addTestEntry error', err);
    throw err;
  }
}

export async function getAllEntries() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    return new Promise<any[]>((resolve, reject) => {
      req.onsuccess = () => {
        db.close();
        log('Entries', req.result);
        resolve(req.result as any[]);
      };
      req.onerror = () => {
        db.close();
        log('getAllEntries error', req.error);
        reject(req.error);
      };
    });
  } catch (err) {
    log('getAllEntries error', err);
    throw err;
  }
}

export async function deleteTestEntry(id?: number) {
  try {
    if (typeof id === 'undefined') {
      const s = prompt('Delete entry id? (numeric id)');
      if (s === null) return;
      id = Number(s);
      if (Number.isNaN(id)) {
        alert('Invalid id');
        return;
      }
    }
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id as any);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        log('Deleted entry', id);
        resolve();
      };
      tx.onerror = () => {
        db.close();
        log('deleteTestEntry error', tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    log('deleteTestEntry error', err);
    throw err;
  }
}

export async function clearTestStore() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        log('Cleared store');
        resolve();
      };
      tx.onerror = () => {
        db.close();
        log('clearTestStore error', tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    log('clearTestStore error', err);
    throw err;
  }
}

export async function deleteTestDB(name = DB_NAME) {
  try {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = () => {
        log('Deleted database', name);
        resolve();
      };
      req.onerror = () => {
        log('deleteTestDB error', req.error);
        reject(req.error);
      };
      req.onblocked = () => {
        log('deleteTestDB blocked (close other connections)');
      };
    });
  } catch (err) {
    log('deleteTestDB error', err);
    throw err;
  }
}

export async function populateMany(count = 100) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (let i = 0; i < count; i++) {
      store.add({ createdAt: Date.now(), index: i, text: `bulk-${i}` });
    }
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        log(`Populated ${count} entries`);
        resolve();
      };
      tx.onerror = () => {
        db.close();
        log('populateMany tx error', tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    log('populateMany error', err);
    throw err;
  }
}

// attach to window for simple HTML onclick hooks
(window as any).createTestDB = createTestDB;
(window as any).addTestEntry = addTestEntry;
(window as any).getAllEntries = getAllEntries;
(window as any).deleteTestEntry = deleteTestEntry;
(window as any).clearTestStore = clearTestStore;
(window as any).deleteTestDB = deleteTestDB;
(window as any).populateMany = populateMany;

// convenience: run basic create so the UI can operate immediately if desired
// (comment out if undesired)
// createTestDB().catch(()=>{});
