import React, { useRef, useEffect, useState } from 'react';
import type { FloatingWindowProps } from '../types/floatingWindow';
import interact from 'interactjs';

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
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({
    width: dimensions.defaultWidth,
    height: dimensions.defaultHeight,
  });

  useEffect(() => {
    if (!windowRef.current) return;
    if (!positioning.draggable && !positioning.resizable) return;

    interact(windowRef.current)
      .draggable(
        positioning.draggable
          ? {
              listeners: {
                move(event) {
                  setPosition(pos => ({
                    x: pos.x + event.dx,
                    y: pos.y + event.dy,
                  }));
                },
              },
              modifiers: positioning.constrainToViewport
                ? [
                    interact.modifiers.restrictRect({
                      restriction: 'parent',
                      endOnly: true,
                    }),
                  ]
                : [],
            }
          : false
      )
      .resizable(
        positioning.resizable
          ? {
              edges: { left: true, right: true, bottom: true, top: true },
              listeners: {
                move(event) {
                  setSize(size => ({
                    width: Math.max(
                      dimensions.minWidth,
                      Math.min(dimensions.maxWidth, event.rect.width)
                    ),
                    height: Math.max(
                      dimensions.minHeight,
                      Math.min(dimensions.maxHeight, event.rect.height)
                    ),
                  }));
                  setPosition(pos => ({
                    x: pos.x + event.deltaRect.left,
                    y: pos.y + event.deltaRect.top,
                  }));
                },
              },
            }
          : false
      );
  }, [positioning, dimensions]);

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: dimensions.minWidth,
        minHeight: dimensions.minHeight,
        maxWidth: dimensions.maxWidth,
        maxHeight: dimensions.maxHeight,
        opacity: windowState.opacity,
        zIndex: 999999999999999999999,
        background: '#222',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: windowState.minimized ? 'none' : 'block',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* TODO: header, controls, etc. */}
      {children}
    </div>
  );
};
