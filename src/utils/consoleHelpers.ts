export function formatArg(arg: unknown): string {
  if (typeof arg === "string") return arg;
  if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
  if (arg === null) return "null";
  if (arg === undefined) return "undefined";
  return "";
}

export function isObject(arg: unknown): arg is object {
  return arg !== null && typeof arg === "object";
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}
