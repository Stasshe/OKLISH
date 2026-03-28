import { elementsState } from './elements.svelte.ts';

let overlayContainer: HTMLDivElement | null = null;
let marginBox: HTMLDivElement | null = null;
let borderBox: HTMLDivElement | null = null;
let paddingBox: HTMLDivElement | null = null;
let contentBox: HTMLDivElement | null = null;
let tooltip: HTMLDivElement | null = null;
let enabled = false;
let currentEl: Element | null = null;

function createOverlay() {
  if (typeof document === 'undefined' || overlayContainer) return;
  overlayContainer = document.createElement('div');
  overlayContainer.style.position = 'fixed';
  overlayContainer.style.top = '0';
  overlayContainer.style.left = '0';
  overlayContainer.style.width = '100%';
  overlayContainer.style.height = '100%';
  overlayContainer.style.pointerEvents = 'none';
  overlayContainer.style.zIndex = '2147483647';
  overlayContainer.setAttribute('data-oklish-overlay', 'true');

  function makeBox(className: string, style: Partial<CSSStyleDeclaration> = {}) {
    const d = document.createElement('div');
    d.setAttribute('data-oklish-overlay', 'true');
    d.className = 'oklish-overlay ' + className;
    d.style.position = 'fixed';
    d.style.pointerEvents = 'none';
    d.style.boxSizing = 'border-box';
    Object.assign(d.style, style as any);
    overlayContainer!.appendChild(d);
    return d;
  }

  marginBox = makeBox('margin', { border: '2px dashed rgba(255,165,0,0.7)', background: 'transparent' });
  borderBox = makeBox('border', { border: '2px solid rgba(0,120,212,0.55)', background: 'transparent' });
  paddingBox = makeBox('padding', { border: '2px dashed rgba(0,200,120,0.35)', background: 'transparent' });
  contentBox = makeBox('content', { background: 'rgba(0,120,212,0.15)', borderRadius: '2px' });

  tooltip = document.createElement('div');
  tooltip.setAttribute('data-oklish-overlay', 'true');
  tooltip.className = 'oklish-overlay-tooltip';
  tooltip.style.position = 'fixed';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.padding = '6px 8px';
  tooltip.style.fontSize = '12px';
  tooltip.style.background = 'rgba(32,33,36,0.95)';
  tooltip.style.color = '#fff';
  tooltip.style.borderRadius = '4px';
  tooltip.style.zIndex = '2147483648';
  overlayContainer.appendChild(tooltip);

  document.body.appendChild(overlayContainer);
}

function removeOverlay() {
  if (!overlayContainer) return;
  overlayContainer.remove();
  overlayContainer = null;
  marginBox = borderBox = paddingBox = contentBox = null;
  tooltip = null;
}

function parsePx(v: string | null) {
  if (!v) return 0;
  return parseFloat(v) || 0;
}

function setBoxRect(el: Element | null) {
  if (!overlayContainer || !el) return;
  const rect = (el as Element).getBoundingClientRect();
  const cs = window.getComputedStyle(el as Element);
  const marginTop = parsePx(cs.marginTop);
  const marginRight = parsePx(cs.marginRight);
  const marginBottom = parsePx(cs.marginBottom);
  const marginLeft = parsePx(cs.marginLeft);
  const borderTop = parsePx(cs.borderTopWidth);
  const borderRight = parsePx(cs.borderRightWidth);
  const borderBottom = parsePx(cs.borderBottomWidth);
  const borderLeft = parsePx(cs.borderLeftWidth);
  const paddingTop = parsePx(cs.paddingTop);
  const paddingRight = parsePx(cs.paddingRight);
  const paddingBottom = parsePx(cs.paddingBottom);
  const paddingLeft = parsePx(cs.paddingLeft);

  // borderBox == rect
  if (borderBox) {
    borderBox.style.top = rect.top + 'px';
    borderBox.style.left = rect.left + 'px';
    borderBox.style.width = rect.width + 'px';
    borderBox.style.height = rect.height + 'px';
  }

  // padding box = rect minus border
  if (paddingBox) {
    paddingBox.style.top = rect.top + borderTop + 'px';
    paddingBox.style.left = rect.left + borderLeft + 'px';
    paddingBox.style.width = Math.max(0, rect.width - borderLeft - borderRight) + 'px';
    paddingBox.style.height = Math.max(0, rect.height - borderTop - borderBottom) + 'px';
    paddingBox.style.border = '2px dashed rgba(0,200,120,0.35)';
  }

  // content box = padding box minus padding
  if (contentBox) {
    const cTop = rect.top + borderTop + paddingTop;
    const cLeft = rect.left + borderLeft + paddingLeft;
    const cWidth = Math.max(0, rect.width - borderLeft - borderRight - paddingLeft - paddingRight);
    const cHeight = Math.max(0, rect.height - borderTop - borderBottom - paddingTop - paddingBottom);
    contentBox.style.top = cTop + 'px';
    contentBox.style.left = cLeft + 'px';
    contentBox.style.width = cWidth + 'px';
    contentBox.style.height = cHeight + 'px';
  }

  // margin box = rect expanded by margins
  if (marginBox) {
    marginBox.style.top = rect.top - marginTop + 'px';
    marginBox.style.left = rect.left - marginLeft + 'px';
    marginBox.style.width = rect.width + marginLeft + marginRight + 'px';
    marginBox.style.height = rect.height + marginTop + marginBottom + 'px';
  }

  // tooltip
  if (tooltip) {
    const tag = (el as Element).tagName.toLowerCase();
    const dims = Math.round(rect.width) + ' × ' + Math.round(rect.height);
    const info = tag + ' — ' + dims;
    tooltip.textContent = info;
    // place tooltip above element if possible
    const ttLeft = Math.max(4, rect.left);
    const ttTop = Math.max(4, rect.top - 28);
    tooltip.style.left = ttLeft + 'px';
    tooltip.style.top = ttTop + 'px';
  }
}

function pickElementFromPoint(x: number, y: number): Element | null {
  let el = document.elementFromPoint(x, y);
  // if overlay contains it, walk up until real element
  while (el && el.hasAttribute && el.hasAttribute('data-oklish-overlay')) {
    el = el.parentElement;
  }
  return el;
}

function onMouseMove(e: MouseEvent) {
  const el = pickElementFromPoint(e.clientX, e.clientY);
  if (!el || el === currentEl) return;
  currentEl = el;
  setBoxRect(el);
}

function onClick(e: MouseEvent) {
  const el = pickElementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
  if (!el) return;
  e.preventDefault();
  e.stopPropagation();
  elementsState.select(el);
  elementsState.setInspect(false);
}

function enable() {
  if (enabled) return;
  enabled = true;
  createOverlay();
  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
}

function disable() {
  if (!enabled) return;
  enabled = false;
  document.removeEventListener('mousemove', onMouseMove, true);
  document.removeEventListener('click', onClick, true);
  removeOverlay();
  currentEl = null;
}

// listen to global events dispatched from elementsState
if (typeof window !== 'undefined') {
  window.addEventListener('oklish:inspect-mode', (ev: Event) => {
    const detail = (ev as CustomEvent).detail as boolean;
    if (detail) enable(); else disable();
  });

  window.addEventListener('oklish:selected-element', (ev: Event) => {
    const el = (ev as CustomEvent).detail as Element | null;
    if (!el) return;
    // show overlay for selected element
    createOverlay();
    setBoxRect(el);
  });
}

export const inspectOverlay = {
  enable,
  disable,
  setElement(el: Element | null) {
    if (!el) return;
    createOverlay();
    setBoxRect(el);
  },
};
