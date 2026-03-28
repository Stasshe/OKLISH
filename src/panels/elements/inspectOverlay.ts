import { elementsState } from './elements.svelte.ts';
import { HOST_ELEMENT_ID } from '../../core/constants.ts';

let overlayContainer: HTMLDivElement | null = null;
let marginBox: HTMLDivElement | null = null;
let borderBox: HTMLDivElement | null = null;
let paddingBox: HTMLDivElement | null = null;
let contentBox: HTMLDivElement | null = null;
let tooltip: HTMLDivElement | null = null;
let enabled = false;
let currentEl: Element | null = null;

function getSelectorString(el: Element | null) {
  if (!el) return '';
  const tag = el.tagName.toLowerCase();
  const he = el as HTMLElement;
  const id = he?.id ? `#${he.id}` : '';
  const cls = he?.classList && he.classList.length ? '.' + Array.from(he.classList).slice(0,3).join('.') : '';
  const s = tag + id + cls;
  return s.length > 48 ? s.slice(0,45) + '...' : s;
}

function createOverlay() {
  if (typeof document === 'undefined' || overlayContainer) return;
  overlayContainer = document.createElement('div');
  overlayContainer.className = 'oklish-overlay-root';
  overlayContainer.style.position = 'fixed';
  overlayContainer.style.top = '0';
  overlayContainer.style.left = '0';
  overlayContainer.style.width = '100%';
  overlayContainer.style.height = '100%';
  overlayContainer.style.pointerEvents = 'none';
  // keep overlay below OKLISH host element
  overlayContainer.style.zIndex = '9999';
  overlayContainer.setAttribute('data-oklish-overlay', 'true');

  const styleEl = document.createElement('style');
  styleEl.textContent = `
.oklish-overlay { position: fixed; pointer-events: none; box-sizing: border-box; transition: top 120ms ease, left 120ms ease, width 120ms ease, height 120ms ease, opacity 140ms ease, transform 160ms ease; opacity: 0; transform: scale(0.995); }
.oklish-overlay.visible { opacity: 1; transform: scale(1); }
.oklish-overlay.margin { border: 2px dashed rgba(255,165,0,0.7); background: transparent; box-shadow: 0 6px 20px rgba(255,165,0,0.06); border-radius: 6px; }
.oklish-overlay.border { border: 2px solid rgba(0,120,212,0.55); background: transparent; box-shadow: 0 12px 30px rgba(0,120,212,0.08); border-radius: 8px; mix-blend-mode: screen; }
.oklish-overlay.padding { border: 2px dashed rgba(0,200,120,0.35); background: transparent; border-radius: 4px; }
.oklish-overlay.content { background: linear-gradient(90deg, rgba(0,120,212,0.06), rgba(0,120,212,0.14)); border-radius: 8px; box-shadow: 0 18px 40px rgba(0,120,212,0.06); animation: oklish-pulse 2.8s infinite; }
@keyframes oklish-pulse { 0% { box-shadow: 0 6px 20px rgba(0,120,212,0.04); } 50% { box-shadow: 0 18px 40px rgba(0,120,212,0.06); } 100% { box-shadow: 0 6px 20px rgba(0,120,212,0.04); } }
.oklish-overlay-tooltip { position: fixed; pointer-events: none; padding: 6px 8px; font-size: 12px; background: rgba(32,33,36,0.95); color: #fff; border-radius: 6px; z-index: 2147483646; box-shadow: 0 8px 24px rgba(0,0,0,0.45); opacity: 0; transform: translateY(-6px) scale(0.995); transition: opacity 140ms ease, transform 140ms ease; white-space: nowrap; }
.oklish-overlay-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
.oklish-overlay-tooltip:after { content: ''; position: absolute; left: 8px; bottom: -6px; width: 8px; height: 8px; background: rgba(32,33,36,0.95); transform: rotate(45deg); border-radius: 2px; }
`;
  overlayContainer.appendChild(styleEl);
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

  marginBox = makeBox('margin');
  borderBox = makeBox('border');
  paddingBox = makeBox('padding');
  contentBox = makeBox('content');

  tooltip = document.createElement('div');
  tooltip.setAttribute('data-oklish-overlay', 'true');
  tooltip.className = 'oklish-overlay-tooltip';
  overlayContainer.appendChild(tooltip);

  // Insert overlay before the OKLISH host element so the host (and its shadow UI) renders above it.
  const host = typeof document !== 'undefined' ? document.getElementById(HOST_ELEMENT_ID) : null;
  if (host && host.parentElement) {
    host.parentElement.insertBefore(overlayContainer, host);
  } else {
    document.body.appendChild(overlayContainer);
  }

  // simple root fade-in
  overlayContainer.style.transition = 'opacity 160ms cubic-bezier(0.2,0.8,0.2,1)';
  overlayContainer.style.opacity = '0';
  // allow initial layout to settle
  setTimeout(() => { if (overlayContainer) overlayContainer.style.opacity = '1'; }, 10);
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
    borderBox.classList.add('visible');
  }

  // padding box = rect minus border
  if (paddingBox) {
    paddingBox.style.top = rect.top + borderTop + 'px';
    paddingBox.style.left = rect.left + borderLeft + 'px';
    paddingBox.style.width = Math.max(0, rect.width - borderLeft - borderRight) + 'px';
    paddingBox.style.height = Math.max(0, rect.height - borderTop - borderBottom) + 'px';
    paddingBox.classList.add('visible');
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
    contentBox.classList.add('visible');
  }

  // margin box = rect expanded by margins
  if (marginBox) {
    marginBox.style.top = rect.top - marginTop + 'px';
    marginBox.style.left = rect.left - marginLeft + 'px';
    marginBox.style.width = rect.width + marginLeft + marginRight + 'px';
    marginBox.style.height = rect.height + marginTop + marginBottom + 'px';
    marginBox.classList.add('visible');
  }

  // tooltip
  if (tooltip) {
    const dims = Math.round(rect.width) + ' × ' + Math.round(rect.height);
    const selector = getSelectorString(el);
    tooltip.textContent = selector + ' — ' + dims;
    // place tooltip above element if possible
    const ttLeft = Math.max(6, rect.left);
    const ttTop = Math.max(6, rect.top - 34);
    tooltip.style.left = ttLeft + 'px';
    tooltip.style.top = ttTop + 'px';
    tooltip.classList.add('visible');
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
  // fade out root then remove
  if (overlayContainer) {
    overlayContainer.style.opacity = '0';
    setTimeout(() => removeOverlay(), 180);
  } else {
    removeOverlay();
  }
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
