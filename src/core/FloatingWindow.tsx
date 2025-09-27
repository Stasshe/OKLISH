import React, { useState } from 'react';
import type { FloatingWindowProps } from '../types/floatingWindow';
import { Rnd } from 'react-rnd';

const getDefaultDimensions = () => {
  if (typeof window !== 'undefined') {
    return {
      minWidth: 400,
      minHeight: 300,
      maxWidth: window.innerWidth * 0.9,
      maxHeight: window.innerHeight * 0.9,
      defaultWidth: 800,
      defaultHeight: 600,
    };
  }
  // fallback for SSR or build
  return {
    minWidth: 400,
    minHeight: 300,
    maxWidth: 1200,
    maxHeight: 900,
    defaultWidth: 800,
    defaultHeight: 600,
  };
};

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  dimensions = getDefaultDimensions(),
  positioning = {
    draggable: true,
    resizable: true,
    snapToEdges: true,
    constrainToViewport: true,
  },
  windowState = {
    minimized: false,
    maximized: false,
    docked: false,
    opacity: 1,
  },
  children,
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({
    width: dimensions.defaultWidth,
    height: dimensions.defaultHeight,
  });

  if (windowState.minimized) return null;

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      minWidth={dimensions.minWidth}
      minHeight={dimensions.minHeight}
      maxWidth={dimensions.maxWidth}
      maxHeight={dimensions.maxHeight}
      bounds={''}
      disableDragging={!positioning.draggable}
      enableResizing={positioning.resizable}
      dragHandleClassName="floating-window-header"
      onDragStop={(_e, d) => setPosition({ x: d.x, y: Math.max(0, d.y) })}
      onResizeStop={(_e, _direction, ref, _delta, pos) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
        setPosition(pos);
      }}
      resizeHandleStyles={{
        right: { width: 18, background: 'rgba(255,255,255,0.18)', cursor: 'ew-resize' },
        left: { width: 18, background: 'rgba(255,255,255,0.18)', cursor: 'ew-resize' },
        bottom: { height: 18, background: 'rgba(255,255,255,0.18)', cursor: 'ns-resize' },
        topRight: {
          width: 28,
          height: 28,
          background: 'rgba(255,255,255,0.28)',
          cursor: 'nesw-resize',
        },
        topLeft: {
          width: 28,
          height: 28,
          background: 'rgba(255,255,255,0.28)',
          cursor: 'nwse-resize',
        },
        bottomRight: {
          width: 32,
          height: 32,
          background: 'rgba(255,255,255,0.33)',
          cursor: 'nwse-resize',
        },
        bottomLeft: {
          width: 32,
          height: 32,
          background: 'rgba(255,255,255,0.33)',
          cursor: 'nesw-resize',
        },
      }}
      style={{
        opacity: windowState.opacity,
        zIndex: 999999999999999999999,
        background: '#222',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        border: '2px solid #fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="floating-window-header"
        style={{
          background: '#444',
          color: '#fff',
          padding: '12px 16px',
          fontWeight: 'bold',
          borderBottom: '1px solid #888',
          letterSpacing: 1,
          cursor: positioning.draggable ? 'move' : 'default',
          userSelect: 'none',
        }}
      >
        Floating Window
      </div>
      <div style={{ padding: 24, color: '#fff', flex: 1 }}>{children}</div>
    </Rnd>
  );
};
