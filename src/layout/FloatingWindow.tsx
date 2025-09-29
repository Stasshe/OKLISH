import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  return {
    minWidth: 400,
    minHeight: 300,
    maxWidth: 1200,
    maxHeight: 900,
    defaultWidth: 800,
    defaultHeight: 600,
  };
};

const iconStyle = (color: string) => ({
  width: 18,
  height: 18,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: color,
  marginRight: 8,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)',
});

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
  const { theme } = useTheme();
  const [position, setPosition] = useState({ x: 120, y: 120 });
  const [size, setSize] = useState({
    width: dimensions.defaultWidth,
    height: dimensions.defaultHeight,
  });
  const [minimized, setMinimized] = useState(windowState.minimized);
  const [maximized, setMaximized] = useState(windowState.maximized);
  const [hover, setHover] = useState(false);

  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 99999,
          background: theme.header,
          color: theme.headerText,
          borderRadius: 12,
          boxShadow: theme.shadow,
          padding: '6px 18px',
          cursor: 'pointer',
          opacity: 0.85,
          fontWeight: 500,
          fontSize: 15,
          border: `1.5px solid ${theme.border}`,
        }}
        onClick={() => setMinimized(false)}
      >
        <span style={{ marginRight: 8 }}>🗗</span> Restore Window
      </div>
    );
  }

  return (
    <Rnd
      size={
        maximized ? { width: '100vw', height: '100vh' } : { width: size.width, height: size.height }
      }
      position={maximized ? { x: 0, y: 0 } : { x: position.x, y: position.y }}
      minWidth={dimensions.minWidth}
      minHeight={dimensions.minHeight}
      maxWidth={dimensions.maxWidth}
      maxHeight={dimensions.maxHeight}
      enableResizing={positioning.resizable && !maximized}
      disableDragging={!positioning.draggable || maximized}
      bounds={''}
      dragHandleClassName="floating-window-handle"
      style={{
        zIndex: 99999,
        borderRadius: 18,
        boxShadow: hover ? '0 12px 40px 0 rgba(0,0,0,0.22)' : theme.shadow,
        opacity: windowState.opacity,
        transition: 'box-shadow 0.2s, opacity 0.2s',
        overflow: 'hidden',
        border: `1.5px solid ${theme.border}`,
        background: theme.background,
        display: 'flex',
        flexDirection: 'column',
      }}
      onDragStop={(_e, d) => setPosition({ x: d.x, y: Math.max(0, d.y) })}
      onResizeStop={(_e, _dir, ref) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Header / Title Bar */}
      <div
        className="floating-window-handle"
        style={{
          background: theme.header,
          color: theme.headerText,
          padding: '0.7rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1.5px solid ${theme.border}`,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          userSelect: 'none',
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: 0.2,
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        }}
      >
        {/* Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 12 }}>
          <span
            title="Minimize"
            style={iconStyle(theme.accent)}
            onClick={() => setMinimized(true)}
            onMouseDown={e => e.stopPropagation()}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
            >
              <rect
                y="4.5"
                width="10"
                height="1"
                rx="0.5"
                fill="#fff"
              />
            </svg>
          </span>
          <span
            title={maximized ? 'Restore' : 'Maximize'}
            style={iconStyle(theme.accent)}
            onClick={() => setMaximized(m => !m)}
            onMouseDown={e => e.stopPropagation()}
          >
            {maximized ? (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
              >
                <rect
                  x="2"
                  y="2"
                  width="6"
                  height="6"
                  rx="1"
                  fill="#fff"
                />
              </svg>
            ) : (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
              >
                <rect
                  x="1"
                  y="1"
                  width="8"
                  height="8"
                  rx="1"
                  fill="#fff"
                />
              </svg>
            )}
          </span>
          <span
            title="Close"
            style={iconStyle('linear-gradient(135deg,#ff5f6d 0%,#ffc371 100%)')}
            onClick={() => setMinimized(true)}
            onMouseDown={e => e.stopPropagation()}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
            >
              <line
                x1="2"
                y1="2"
                x2="8"
                y2="8"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <line
                x1="8"
                y1="2"
                x2="2"
                y2="8"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </span>
        </div>
        <span
          style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 17, letterSpacing: 0.2 }}
        >
          Floating Window
        </span>
      </div>
      {/* Content */}
      <div
        style={{
          flex: 1,
          background: theme.background,
          color: theme.foreground,
          padding: '1.2rem',
          overflow: 'auto',
          fontSize: 16,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          transition: 'background 0.2s',
        }}
      >
        {children}
      </div>
    </Rnd>
  );
};
