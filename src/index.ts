import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider } from './context/ThemeContext';
import { FixedWindow } from './frame/FixedWindow';
import { FloatingWindow } from './frame/FloatingWindow';
import type {
  FloatingWindowDimensions,
  FloatingWindowPositioning,
  FloatingWindowState,
} from './types/floatingWindow';

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

type frameMode = 'floating' | 'fixed';

function renderOKLISH(mode: frameMode = 'floating'): void {
  const rootEl = document.getElementById('oklish-root');
  if (!rootEl) return;
  const root = createRoot(rootEl);
  root.render(
    React.createElement(ThemeProvider, {
      children: React.createElement(
        React.Fragment,
        {},
        mode === 'floating'
          ? React.createElement(FloatingWindow, {
              dimensions: defaultDimensions,
              positioning: defaultPositioning,
              windowState: defaultWindowState,
              children: React.createElement(
                'div',
                { style: { padding: 24 } },
                'Hello Floating Window'
              ),
            })
          : React.createElement(FixedWindow, {
              defaultWidth: 200,
              defaultHeight: 100,
            })
      ),
    })
  );
}

// グローバルAPIはUMDバンドルに任せる
const OKLISH = {
  /**
   * Initialize OKLISH UI
   * @param mode 'floating' (default) or 'fixed'
   */
  init: (mode: frameMode = 'floating'): void => {
    renderOKLISH(mode);
  },
};

// UMDバンドル時にwindowにOKLISHを登録
if (typeof window !== 'undefined') {
  // @ts-expect-error: Assigning to window for UMD global export
  window.OKLISH = OKLISH;
}

export default OKLISH;
