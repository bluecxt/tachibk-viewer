export type StoredBackupFileMeta = {
  id: string;
  name: string;
  size: number;
  lastModified: number;
  importedAt: number;
};

type StoredBackupFile = StoredBackupFileMeta & {
  buffer: ArrayBuffer;
};

const DB_NAME = "tachibk-viewer-db";
const STORE_NAME = "backup-files";
const DB_VERSION = 1;
const MAX_STORED_FILES = 10;

function buildId(name: string, size: number, lastModified: number): string {
  return `${name}::${size}::${lastModified}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB error"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);

    run(store)
      .then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error("Transaction error"));
      })
      .catch(reject);
  }).finally(() => db.close());
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Request error"));
  });
}

export async function listStoredBackupFiles(): Promise<StoredBackupFileMeta[]> {
  try {
    return withStore("readonly", async (store) => {
      const all = await requestToPromise(store.getAll() as IDBRequest<StoredBackupFile[]>);
      return all
        .map(({ id, name, size, lastModified, importedAt }) => ({
          id,
          name,
          size,
          lastModified,
          importedAt,
        }))
        .sort((a, b) => b.importedAt - a.importedAt);
    });
  } catch {
    return [];
  }
}

export async function saveBackupFile(file: File, buffer: ArrayBuffer): Promise<void> {
  try {
    await withStore("readwrite", async (store) => {
      const id = buildId(file.name, file.size, file.lastModified);
      const payload: StoredBackupFile = {
        id,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        importedAt: Date.now(),
        buffer,
      };
      await requestToPromise(store.put(payload));

      const all = await requestToPromise(store.getAll() as IDBRequest<StoredBackupFile[]>);
      const sorted = all.sort((a, b) => b.importedAt - a.importedAt);
      const toDelete = sorted.slice(MAX_STORED_FILES);
      await Promise.all(toDelete.map((item) => requestToPromise(store.delete(item.id))));
    });
  } catch {
    // silent fallback
  }
}

export async function getStoredBackupFileBuffer(id: string): Promise<ArrayBuffer | null> {
  try {
    return withStore("readonly", async (store) => {
      const item = await requestToPromise(store.get(id) as IDBRequest<StoredBackupFile | undefined>);
      return item?.buffer ?? null;
    });
  } catch {
    return null;
  }
}

export async function deleteStoredBackupFile(id: string): Promise<void> {
  try {
    await withStore("readwrite", async (store) => {
      await requestToPromise(store.delete(id));
    });
  } catch {
    // silent fallback
  }
}
