import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { FloatingWindow } from './core/FloatingWindow';
import type {
  FloatingWindowDimensions,
  FloatingWindowPositioning,
  FloatingWindowState,
} from './types/floatingWindow';

// Default config for FloatingWindow
const defaultDimensions: FloatingWindowDimensions = {
  minWidth: 400,
  minHeight: 300,
  maxWidth: window.innerWidth * 0.9,
  maxHeight: window.innerHeight * 0.9,
  defaultWidth: 800,
  defaultHeight: 600,
};
const defaultPositioning: FloatingWindowPositioning = {
  draggable: true,
  resizable: true,
  snapToEdges: true,
  constrainToViewport: true,
};
const defaultWindowState: FloatingWindowState = {
  minimized: false,
  maximized: false,
  docked: false,
  opacity: 1,
};

function renderFloatingWindow(config: Partial<{ theme: string }>) {
  const rootEl = document.getElementById('oklish-root');
  if (!rootEl) return;
  const root = createRoot(rootEl);
  root.render(
    React.createElement(FloatingWindow, {
      dimensions: defaultDimensions,
      positioning: defaultPositioning,
      windowState: defaultWindowState,
      children: null,
    })
  );
}

// グローバルAPI
declare global {
  interface Window {
    OKLISH: { init: (config?: any) => void };
  }
}

window.OKLISH = {
  init: (config = {}) => {
    renderFloatingWindow(config);
  },
};
