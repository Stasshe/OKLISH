const MAX_DEPTH = 10;
const MAX_KEYS = 100;

export function safeClone(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[Max depth reached]";
  if (value === null || value === undefined) return value;

  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") return value;
  if (type === "function") return `[Function: ${(value as Function).name || "anonymous"}]`;
  if (type === "symbol") return value.toString();

  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }

  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.toString();

  if (value instanceof HTMLElement) {
    const tag = value.tagName.toLowerCase();
    const id = value.id ? `#${value.id}` : "";
    const cls = value.className ? `.${String(value.className).split(" ").join(".")}` : "";
    return `<${tag}${id}${cls}>`;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_KEYS).map((item) => safeClone(item, depth + 1));
  }

  if (type === "object") {
    const result: Record<string, unknown> = {};
    const keys = Object.keys(value as object).slice(0, MAX_KEYS);
    for (const key of keys) {
      result[key] = safeClone((value as Record<string, unknown>)[key], depth + 1);
    }
    return result;
  }

  return String(value);
}
