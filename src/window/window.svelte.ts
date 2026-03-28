import type { WindowMode } from './window.types';
import { WINDOW_DEFAULTS } from '../core/constants';

const WINDOW_KEY = 'oklish:window';

interface WindowState {
  mode: WindowMode;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  dockedSize: number;
}

function loadState(): WindowState {
  try {
    const raw = sessionStorage.getItem(WINDOW_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return {
    mode: 'floating',
    x: WINDOW_DEFAULTS.DEFAULT_X,
    y: WINDOW_DEFAULTS.DEFAULT_Y,
    width: WINDOW_DEFAULTS.DEFAULT_WIDTH,
    height: WINDOW_DEFAULTS.DEFAULT_HEIGHT,
    minimized: false,
    dockedSize: WINDOW_DEFAULTS.DEFAULT_DOCKED_SIZE,
  };
}

const initial = loadState();

let mode = $state<WindowMode>(initial.mode);
let x = $state(initial.x);
let y = $state(initial.y);
let width = $state(initial.width);
let height = $state(initial.height);
let minimized = $state(initial.minimized);
let dockedSize = $state(initial.dockedSize);

function saveState(): void {
  const snapshot = { mode, x, y, width, height, minimized, dockedSize };
  try {
    sessionStorage.setItem(WINDOW_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore */
  }
}

export const windowState = {
  get mode() { return mode; },
  set mode(v: WindowMode) { mode = v; saveState(); },
  get x() { return x; },
  set x(v: number) { x = v; saveState(); },
  get y() { return y; },
  set y(v: number) { y = v; saveState(); },
  get width() { return width; },
  set width(v: number) { width = v; saveState(); },
  get height() { return height; },
  set height(v: number) { height = v; saveState(); },
  get minimized() { return minimized; },
  set minimized(v: boolean) { minimized = v; saveState(); },
  get dockedSize() { return dockedSize; },
  set dockedSize(v: number) { dockedSize = v; saveState(); },
  get isFloating() { return mode === 'floating'; },
  get isDocked() { return mode !== 'floating'; },
  cycleMode(): void {
    const modes: WindowMode[] = ['floating', 'docked-bottom', 'docked-right', 'docked-left'];
    const idx = modes.indexOf(mode);
    mode = modes[(idx + 1) % modes.length];
    saveState();
  },
};
