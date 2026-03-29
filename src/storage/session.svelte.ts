import { deserialize, serialize } from "./serializer";

export function loadPersistedState<T extends Record<string, unknown>>(key: string, defaults: T): T {
  const stored = sessionStorage.getItem(key);
  return deserialize(stored, defaults);
}

export function savePersistedState<T extends Record<string, unknown>>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, serialize(value));
  } catch {
    /* ignore */
  }
}

export function clearPersistedState(key: string): void {
  sessionStorage.removeItem(key);
}

export function clearAllPersistedState(): void {
  const keys = Object.keys(sessionStorage);
  for (const key of keys) {
    if (key.startsWith("oklish:")) {
      sessionStorage.removeItem(key);
    }
  }
}
