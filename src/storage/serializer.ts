export function serialize<T>(value: T): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function deserialize<T>(raw: string | null, fallback: T): T {
  if (raw === null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
