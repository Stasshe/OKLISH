import type { ConsoleEntry, ConsoleFilter } from "./console.types";
import {
  loadConsoleData,
  saveConsoleDataDebounced,
  clearConsoleData,
} from "../../storage/console.ts";

let initialEntries: ConsoleEntry[] = [];
if (typeof window !== "undefined") {
  const data = loadConsoleData();
  const raw = (data.entries as ConsoleEntry[]) || [];
  const seen = new Set<string>();
  let sanitizeCounter = 0;
  initialEntries = raw.map((e) => {
    const copy = { ...e } as ConsoleEntry;
    if (!copy.id || seen.has(copy.id)) {
      copy.id = `sanitized_${Date.now()}_${sanitizeCounter++}`;
    }
    seen.add(copy.id);
    return copy;
  });
}

let entries = $state<ConsoleEntry[]>(initialEntries);
let filter = $state<ConsoleFilter>("all");
let searchQuery = $state<string>("");

const filteredEntries = $derived(
  entries.filter((entry) => {
    if (filter !== "all" && entry.level !== filter) return false;
    if (searchQuery) {
      const text = entry.args
        .map((a) => String(a))
        .join(" ")
        .toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  }),
);

export const consoleState = {
  get entries(): ConsoleEntry[] {
    return filteredEntries;
  },
  get allEntries(): ConsoleEntry[] {
    return entries;
  },
  get filter(): ConsoleFilter {
    return filter;
  },
  get searchQuery(): string {
    return searchQuery;
  },
  addEntry(entry: ConsoleEntry): void {
    // Ensure incoming entry has a unique id to avoid keyed each collisions
    const existingIds = new Set(entries.map((e) => e.id));
    if (!entry.id || existingIds.has(entry.id)) {
      let suffix = 0;
      const base = entry.id ? String(entry.id) : "log";
      let newId: string;
      do {
        newId = `${base}_${Date.now()}_${suffix++}`;
      } while (existingIds.has(newId));
      entry.id = newId;
    }

    entries = [...entries, entry];
    saveConsoleDataDebounced(entries);
  },
  setFilter(f: ConsoleFilter): void {
    filter = f;
  },
  setSearch(q: string): void {
    searchQuery = q;
  },
  clear(): void {
    entries = [];
    if (typeof window !== "undefined") {
      clearConsoleData();
    }
  },
  get counts() {
    const all = filteredEntries;
    return {
      all: all.length,
      log: all.filter((e) => e.level === "log").length,
      warn: all.filter((e) => e.level === "warn").length,
      error: all.filter((e) => e.level === "error").length,
      info: all.filter((e) => e.level === "info").length,
      debug: all.filter((e) => e.level === "debug").length,
    };
  },
};

// Persistence and serialization handled in storage/console.ts
