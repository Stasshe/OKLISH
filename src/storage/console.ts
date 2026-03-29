import type { ConsoleEntry } from "../panels/console/console.types";
import { loadPersistedState, savePersistedState, clearPersistedState } from "./session.svelte.ts";

const STORAGE_KEY = "oklish:console.v1";

export function loadConsoleData(): { entries: ConsoleEntry[] } {
  if (typeof window === "undefined") return { entries: [] };
  return loadPersistedState<{ entries: ConsoleEntry[] }>(STORAGE_KEY, { entries: [] });
}

export function saveConsoleData(entries: ConsoleEntry[]): void {
  if (typeof window === "undefined") return;
  savePersistedState(STORAGE_KEY, { entries });
}

export function clearConsoleData(): void {
  if (typeof window === "undefined") return;
  clearPersistedState(STORAGE_KEY);
}

export function computeNextLogId(): number {
  if (typeof window === "undefined") return 0;
  try {
    const data = loadConsoleData();
    const arr = Array.isArray(data.entries) ? data.entries : [];
    let max = -1;
    for (const e of arr) {
      if (e && typeof e === "object" && typeof (e as any).id === "string" && (e as any).id.startsWith("log_")) {
        const n = parseInt((e as any).id.slice(4), 10);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }
    return max + 1;
  } catch {
    return 0;
  }
}
