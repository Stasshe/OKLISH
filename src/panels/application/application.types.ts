export interface StorageEntry {
  key: string;
  value: string;
}

export type StorageType = 'localStorage' | 'sessionStorage' | 'cookies' | 'indexedDB';

export interface IDBDatabaseInfo {
  name: string;
  version?: number;
}

export interface IDBEntry {
  key: any;
  value: any;
}
