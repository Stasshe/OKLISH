export function getElementSelector(el: Element): string {
  if (el.id) return `#${el.id}`;
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList).join('.');
  return classes ? `${tag}.${classes}` : tag;
}

export function getElementPath(el: Element): string[] {
  const path: string[] = [];
  let current: Element | null = el;
  while (current && current !== document.documentElement) {
    path.unshift(getElementSelector(current));
    current = current.parentElement;
  }
  return path;
}

export function getAttributes(el: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const attr of el.attributes) {
    attrs[attr.name] = attr.value;
  }
  return attrs;
}

export function isVisible(el: Element): boolean {
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}
