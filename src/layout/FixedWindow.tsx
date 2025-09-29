import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Rnd } from 'react-rnd';

export interface FixedWindowProps {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  onResize?: (width: number, height: number) => void;
  children?: React.ReactNode;
  title?: string;
}

const iconStyle = (color: string) => ({
  width: 16,
  height: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: color,
  marginRight: 6,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)',
});

export const FixedWindow: React.FC<FixedWindowProps> = ({
  minWidth = 200,
  minHeight = 100,
  maxWidth = typeof window !== 'undefined' ? window.innerWidth : 1200,
  maxHeight = typeof window !== 'undefined' ? window.innerHeight : 900,
  defaultWidth = 400,
  defaultHeight = 200,
  onResize,
  children,
  title = 'Fixed Window',
}) => {
  const { theme } = useTheme();
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [hover, setHover] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);

  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          left: 40,
          top: 40,
          zIndex: 99999,
          background: theme.header,
          color: theme.headerText,
          borderRadius: 10,
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
        <span style={{ marginRight: 8 }}>🗗</span> Restore
      </div>
    );
  }

  return (
    <Rnd
      size={
        maximized ? { width: '100vw', height: '100vh' } : { width: size.width, height: size.height }
      }
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      enableResizing={!maximized}
      disableDragging={maximized}
      bounds={'window'}
      style={{
        zIndex: 99999,
        borderRadius: 16,
        boxShadow: hover ? '0 12px 40px 0 rgba(0,0,0,0.22)' : theme.shadow,
        transition: 'box-shadow 0.2s',
        overflow: 'hidden',
        border: `1.5px solid ${theme.border}`,
        background: theme.background,
        display: 'flex',
        flexDirection: 'column',
      }}
      onResizeStop={(_e, _direction, ref) => {
        const width = ref.offsetWidth;
        const height = ref.offsetHeight;
        setSize({ width, height });
        onResize?.(width, height);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Header / Title Bar */}
      <div
        style={{
          background: theme.header,
          color: theme.headerText,
          padding: '0.6rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1.5px solid ${theme.border}`,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          userSelect: 'none',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: 0.1,
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        }}
      >
        {/* Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 10 }}>
          <span
            title="Minimize"
            style={iconStyle(theme.accent)}
            onClick={() => setMinimized(true)}
            onMouseDown={e => e.stopPropagation()}
          >
            <svg
              width="9"
              height="9"
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
                width="9"
                height="9"
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
                width="9"
                height="9"
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
              width="9"
              height="9"
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
          style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 15, letterSpacing: 0.1 }}
        >
          {title}
        </span>
      </div>
      {/* Content */}
      <div
        style={{
          flex: 1,
          background: theme.background,
          color: theme.foreground,
          padding: '1.1rem',
          overflow: 'auto',
          fontSize: 15,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          transition: 'background 0.2s',
        }}
      >
        {children}
      </div>
    </Rnd>
  );
};
