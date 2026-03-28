import { deserialize, serialize } from "./serializer";

export function createPersistedState<T extends Record<string, unknown>>(
  key: string,
  defaults: T,
): T {
  const stored = sessionStorage.getItem(key);
  const initial = deserialize(stored, defaults);

  const state = $state<T>({ ...defaults, ...initial });

  $effect(() => {
    const snapshot = { ...state };
    sessionStorage.setItem(key, serialize(snapshot));
  });

  return state;
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
