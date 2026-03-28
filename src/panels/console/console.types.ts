export type LogLevel = "log" | "warn" | "error" | "info" | "debug";

export interface ConsoleEntry {
  id: string;
  level: LogLevel;
  args: unknown[];
  timestamp: number;
  stack?: string;
}

export type ConsoleFilter = LogLevel | "all";
