import type { ConsoleEntry, ConsoleFilter } from "./console.types";

let entries = $state<ConsoleEntry[]>([]);
let filter = $state<ConsoleFilter>("all");
let searchQuery = $state("");

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
    entries = [...entries, entry];
  },
  setFilter(f: ConsoleFilter): void {
    filter = f;
  },
  setSearch(q: string): void {
    searchQuery = q;
  },
  clear(): void {
    entries = [];
  },
  get counts() {
    const all = entries;
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
