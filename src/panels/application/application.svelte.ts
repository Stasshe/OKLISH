import type { StorageEntry, StorageType } from "./application.types";

let activeStorage = $state<StorageType>("localStorage");
let searchQuery = $state("");

function getStorageEntries(type: StorageType): StorageEntry[] {
  if (type === "cookies") {
    return document.cookie
      .split(";")
      .filter(Boolean)
      .map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return { key, value: rest.join("=") };
      });
  }
  const store = type === "localStorage" ? localStorage : sessionStorage;
  const entries: StorageEntry[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key) entries.push({ key, value: store.getItem(key) ?? "" });
  }
  return entries;
}

export const applicationState = {
  get activeStorage(): StorageType {
    return activeStorage;
  },
  get searchQuery(): string {
    return searchQuery;
  },
  setStorage(type: StorageType): void {
    activeStorage = type;
  },
  setSearch(q: string): void {
    searchQuery = q;
  },
  getEntries(): StorageEntry[] {
    const entries = getStorageEntries(activeStorage);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return entries.filter(
        (e) => e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q),
      );
    }
    return entries;
  },
  removeEntry(key: string): void {
    if (activeStorage === "cookies") {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    } else {
      const store = activeStorage === "localStorage" ? localStorage : sessionStorage;
      store.removeItem(key);
    }
  },
  clearStorage(): void {
    if (activeStorage === "cookies") {
      document.cookie.split(";").forEach((c) => {
        const key = c.trim().split("=")[0];
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    } else {
      const store = activeStorage === "localStorage" ? localStorage : sessionStorage;
      store.clear();
    }
  },
};
