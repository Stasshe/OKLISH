import React from 'react';
import { Rnd } from 'react-rnd';

export interface ResizerOnlyProps {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  onResize?: (width: number, height: number) => void;
}

export const ResizerOnly: React.FC<ResizerOnlyProps> = ({
  minWidth = 100,
  minHeight = 60,
  maxWidth = window.innerWidth,
  maxHeight = window.innerHeight,
  defaultWidth = 200,
  defaultHeight = 100,
  onResize,
}) => {
  const [size, setSize] = React.useState({ width: defaultWidth, height: defaultHeight });

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      enableResizing={true}
      disableDragging={true}
      style={{
        background: 'rgba(0,0,0,0.1)',
        border: '2px dashed #888',
        borderRadius: 6,
        zIndex: 999999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontSize: 14,
        userSelect: 'none',
      }}
      onResizeStop={(_e, _direction, ref) => {
        const width = ref.offsetWidth;
        const height = ref.offsetHeight;
        setSize({ width, height });
        onResize?.(width, height);
      }}
    >
      <span>Resizer Only</span>
    </Rnd>
  );
};
