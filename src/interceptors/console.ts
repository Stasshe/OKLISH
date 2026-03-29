import type { CapturedLog, InterceptorHandle, LogLevel } from "./interceptor.types";
import { computeNextLogId } from "../storage/console.ts";

type LogCallback = (entry: CapturedLog) => void;

const LOG_LEVELS: LogLevel[] = ["log", "warn", "error", "info", "debug"];

// Initialize id counter from persisted entries to avoid id collisions after reload
let idCounter = computeNextLogId();

export function interceptConsole(callback: LogCallback): InterceptorHandle {
  const originals = new Map<LogLevel, (...args: unknown[]) => void>();

  for (const level of LOG_LEVELS) {
    const original = console[level].bind(console);
    originals.set(level, original);

    console[level] = (...args: unknown[]) => {
      const entry: CapturedLog = {
        id: `log_${idCounter++}`,
        level,
        args,
        timestamp: Date.now(),
        stack: new Error().stack?.split("\n").slice(2).join("\n"),
      };
      callback(entry);
      original(...args);
    };
  }

  return {
    restore() {
      for (const level of LOG_LEVELS) {
        const original = originals.get(level);
        if (original) {
          console[level] = original;
        }
      }
      originals.clear();
    },
  };
}
