import type { StorageEntry, StorageType } from "./application.types";
import { loadPersistedState, savePersistedState } from "../../storage/session.svelte.ts";

const initial = loadPersistedState<{
  activeStorage: StorageType;
  searchQuery: string;
  showSW: boolean;
}>("oklish:application", { activeStorage: "localStorage", searchQuery: "", showSW: false });

const persisted = $state(initial);

// Persist changes explicitly from setters below. Using `$effect` here
// causes a runtime error because `$effect` can only run during
// component initialisation. Instead, call `savePersistedState` when the
// state is mutated via the exported setters.

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
    return persisted.activeStorage;
  },
  get searchQuery(): string {
    return persisted.searchQuery;
  },
  setStorage(type: StorageType): void {
    persisted.activeStorage = type;
    savePersistedState("oklish:application", { ...persisted });
  },
  setSearch(q: string): void {
    persisted.searchQuery = q;
    savePersistedState("oklish:application", { ...persisted });
  },
  get showSW(): boolean {
    return persisted.showSW;
  },
  setShowSW(v: boolean): void {
    persisted.showSW = v;
    savePersistedState("oklish:application", { ...persisted });
  },
  getEntries(): StorageEntry[] {
    const entries = getStorageEntries(persisted.activeStorage);
    if (persisted.searchQuery) {
      const q = persisted.searchQuery.toLowerCase();
      return entries.filter(
        (e) => e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q),
      );
    }
    return entries;
  },
  removeEntry(key: string): void {
    if (persisted.activeStorage === "cookies") {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    } else {
      const store = persisted.activeStorage === "localStorage" ? localStorage : sessionStorage;
      store.removeItem(key);
    }
  },
  clearStorage(): void {
    if (persisted.activeStorage === "cookies") {
      document.cookie.split(";").forEach((c) => {
        const key = c.trim().split("=")[0];
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    } else {
      const store = persisted.activeStorage === "localStorage" ? localStorage : sessionStorage;
      store.clear();
    }
  },
};
