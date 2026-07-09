import type { AnalysisResult } from '@/lib/llm';

export const ANALYSIS_CACHE_DB_NAME = 'jobfit-ai-analysis-cache';
export const ANALYSIS_CACHE_DB_VERSION = 1;
export const ANALYSIS_CACHE_STORE = 'past-analyses';
export const ANALYSIS_CACHE_LIMIT = 3;
export const ANALYSIS_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type CachedAnalysisRecord = {
  id: string;
  createdAt: number;
  expiresAt: number;
  resumeText: string;
  resumeLabel: string;
  resumeMimeType: string;
  resumeSize: number;
  jobDescription: string;
  result: AnalysisResult & { keywordScore: number };
};

export type CachedAnalysisInput = {
  resumeText: string;
  resumeLabel: string;
  resumeMimeType: string;
  resumeSize: number;
  jobDescription: string;
  result: AnalysisResult & { keywordScore: number };
  createdAt?: number;
};

type MaybeCachedAnalysisRecord = CachedAnalysisRecord | null;

function isBrowser() {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `cache_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(ANALYSIS_CACHE_DB_NAME, ANALYSIS_CACHE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ANALYSIS_CACHE_STORE)) {
        db.createObjectStore(ANALYSIS_CACHE_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open analysis cache database.'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>
): Promise<T> {
  const db = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(ANALYSIS_CACHE_STORE, mode);
    const store = tx.objectStore(ANALYSIS_CACHE_STORE);

    Promise.resolve(handler(store))
      .then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error('Analysis cache transaction failed.'));
      })
      .catch((error) => {
        reject(error);
        try {
          tx.abort();
        } catch {}
      });
  }).finally(() => {
    db.close();
  });
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function normalizeRecord(record: CachedAnalysisRecord): CachedAnalysisRecord {
  return {
    ...record,
    resumeText: record.resumeText.trim(),
    jobDescription: record.jobDescription.trim(),
  };
}

function isExpired(record: CachedAnalysisRecord) {
  return record.expiresAt <= Date.now();
}

async function readAllRecords() {
  const db = await openDatabase();

  try {
    return await new Promise<CachedAnalysisRecord[]>((resolve, reject) => {
      const tx = db.transaction(ANALYSIS_CACHE_STORE, 'readonly');
      const store = tx.objectStore(ANALYSIS_CACHE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as CachedAnalysisRecord[]);
      request.onerror = () => reject(request.error ?? new Error('Failed to read cached analyses.'));
    });
  } finally {
    db.close();
  }
}

export function isAnalysisCacheAvailable() {
  return isBrowser();
}

export async function pruneAnalysisCache() {
  if (!isBrowser()) {
    return [];
  }

  const records = (await readAllRecords()).map(normalizeRecord);
  const validRecords = records.filter((record) => !isExpired(record));
  const expiredIds = records.filter(isExpired).map((record) => record.id);

  await Promise.all(
    expiredIds.map((id) =>
      withStore('readwrite', (store) => store.delete(id))
    )
  );

  const sorted = validRecords.sort((a, b) => b.createdAt - a.createdAt);
  const overflow = sorted.slice(ANALYSIS_CACHE_LIMIT);

  await Promise.all(
    overflow.map((record) =>
      withStore('readwrite', (store) => store.delete(record.id))
    )
  );

  return sorted.slice(0, ANALYSIS_CACHE_LIMIT);
}

export async function saveAnalysisCache(input: CachedAnalysisInput) {
  if (!isBrowser()) {
    throw new Error('IndexedDB is not available in this environment.');
  }

  const now = input.createdAt ?? Date.now();
  const record: CachedAnalysisRecord = normalizeRecord({
    id: createId(),
    createdAt: now,
    expiresAt: now + ANALYSIS_CACHE_TTL_MS,
    resumeText: input.resumeText,
    resumeLabel: input.resumeLabel,
    resumeMimeType: input.resumeMimeType,
    resumeSize: input.resumeSize,
    jobDescription: input.jobDescription,
    result: input.result,
  });

  await withStore('readwrite', (store) => requestToPromise(store.put(record)));
  await pruneAnalysisCache();

  return record;
}

export async function listAnalysisCache() {
  if (!isBrowser()) {
    return [];
  }

  const records = await pruneAnalysisCache();
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAnalysisCacheEntry(id: string): Promise<MaybeCachedAnalysisRecord> {
  if (!isBrowser()) {
    return null;
  }

  const record = await withStore('readonly', (store) => requestToPromise(store.get(id))) as CachedAnalysisRecord | undefined;
  if (!record || isExpired(record)) {
    if (record?.id) {
      await deleteAnalysisCacheEntry(record.id);
    }
    return null;
  }

  return normalizeRecord(record);
}

export async function deleteAnalysisCacheEntry(id: string) {
  if (!isBrowser()) {
    return;
  }

  await withStore('readwrite', (store) => requestToPromise(store.delete(id)));
}

export async function clearAnalysisCache() {
  if (!isBrowser()) {
    return;
  }

  await withStore('readwrite', (store) => requestToPromise(store.clear()));
}
