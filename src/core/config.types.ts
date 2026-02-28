import type { WindowMode } from '../window/window.types';

export interface OKLISHConfig {
  theme: 'dark' | 'light';
  defaultPanel: string;
  windowMode: WindowMode;
  plugins: unknown[];
  persistState: boolean;
}
