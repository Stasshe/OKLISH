import { STORAGE_KEYS } from "../core/constants";
import type { ConsoleEntry } from "../panels/console/console.types";
import { clearPersistedState, loadPersistedState, savePersistedState } from "./session.svelte.ts";

const STORAGE_KEY = STORAGE_KEYS.CONSOLE_LOGS;

export function loadConsoleData(): { entries: ConsoleEntry[] } {
  if (typeof window === "undefined") return { entries: [] };
  return loadPersistedState<{ entries: ConsoleEntry[] }>(STORAGE_KEY, { entries: [] });
}

function serializeValue(val: unknown): unknown {
  if (val === null) return null;
  const t = typeof val;
  if (t === "string" || t === "number" || t === "boolean") return val;
  if (t === "undefined") return { __type: "undefined" };
  if (t === "function") return { __type: "function", name: (val as Function).name || "anonymous" };
  if (val instanceof Error)
    return { __type: "Error", name: val.name, message: val.message, stack: val.stack };
  if (val instanceof Date) return { __type: "Date", value: val.toISOString() };

  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    const seen = new WeakSet();
    try {
      const s = JSON.stringify(val, (_k, v) => {
        if (typeof v === "function") return `[Function: ${(v as Function).name || "anonymous"}]`;
        if (typeof v === "object" && v !== null) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        if (v instanceof Error)
          return { __type: "Error", name: v.name, message: v.message, stack: v.stack };
        if (v instanceof Date) return { __type: "Date", value: v.toISOString() };
        return v;
      });
      return { __type: "unserializable", value: s };
    } catch {
      return { __type: "unserializable", value: String(val) };
    }
  }
}

function serializeEntries(entries: ConsoleEntry[]): ConsoleEntry[] {
  return entries.map((e) => ({ ...e, args: e.args.map(serializeValue) }));
}

export function saveConsoleData(entries: ConsoleEntry[]): void {
  if (typeof window === "undefined") return;
  savePersistedState(STORAGE_KEY, { entries: serializeEntries(entries) });
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
export function saveConsoleDataDebounced(entries: ConsoleEntry[], delay = 200): void {
  if (typeof window === "undefined") return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveConsoleData(entries);
    debounceTimer = null;
  }, delay);
}

export function clearConsoleData(): void {
  if (typeof window === "undefined") return;
  clearPersistedState(STORAGE_KEY);
}
