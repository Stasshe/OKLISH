let counter = 0;

export function uid(): string {
  return `ok_${Date.now().toString(36)}_${(counter++).toString(36)}`;
}
