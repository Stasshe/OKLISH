import React from 'react';

export interface FloatingWindowDimensions {
  minWidth: number; // 400px
  minHeight: number; // 300px
  maxWidth: number; // 90vw
  maxHeight: number; // 90vh
  defaultWidth: number; // 800px
  defaultHeight: number; // 600px
}

export interface FloatingWindowPositioning {
  draggable: boolean;
  resizable: boolean;
  snapToEdges: boolean;
  constrainToViewport: boolean;
}

export interface FloatingWindowState {
  minimized: boolean;
  maximized: boolean;
  docked: boolean;
  opacity: number;
}

export interface FloatingWindowProps {
  dimensions: FloatingWindowDimensions;
  positioning: FloatingWindowPositioning;
  windowState: FloatingWindowState;
  children?: React.ReactNode;
}
