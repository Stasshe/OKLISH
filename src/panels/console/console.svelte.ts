import type { ConsoleEntry, ConsoleFilter } from "./console.types";
import { loadConsoleData, saveConsoleData, clearConsoleData } from "../../storage/console.ts";

let initialEntries: ConsoleEntry[] = [];
if (typeof window !== "undefined") {
  const data = loadConsoleData();
  initialEntries = (data.entries as ConsoleEntry[]) || [];
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
    entries = [...entries, entry];
    persistEntries(entries);
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

function safeStringify(value: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(value, function (_key, val) {
    if (typeof val === "function") {
      return `[Function: ${val.name || "anonymous"}]`;
    }
    if (typeof val === "object" && val !== null) {
      if (seen.has(val)) return "[Circular]";
      seen.add(val);
    }
    if (val instanceof Error) {
      return { __type: "Error", name: val.name, message: val.message, stack: val.stack };
    }
    if (val instanceof Date) {
      return { __type: "Date", value: val.toISOString() };
    }
    return val;
  });
}

function makeSerializable(arg: unknown): unknown {
  if (arg === null) return null;
  const t = typeof arg;
  if (t === "string" || t === "number" || t === "boolean") return arg;
  if (t === "undefined") return { __type: "undefined" };
  if (t === "function") return { __type: "function", name: (arg as Function).name || "anonymous" };
  if (arg instanceof Error) return { __type: "Error", name: arg.name, message: arg.message, stack: arg.stack };
  if (arg instanceof Date) return { __type: "Date", value: arg.toISOString() };
  try {
    const s = JSON.stringify(arg);
    return JSON.parse(s);
  } catch {
    try {
      return { __type: "unserializable", value: safeStringify(arg) };
    } catch {
      return { __type: "unserializable", value: String(arg) };
    }
  }
}

function persistEntries(list: ConsoleEntry[]): void {
  if (typeof window === "undefined") return;
  const serializable = list.map((e) => ({ ...e, args: e.args.map(makeSerializable) }));
  saveConsoleData(serializable);
}
