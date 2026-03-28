import type { WindowMode } from "../window/window.types";

export interface PersistedWindowState {
  mode: WindowMode;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  dockedSize: number;
}

export interface PersistedState {
  window: PersistedWindowState;
  theme: string;
  activePanel: string;
}
