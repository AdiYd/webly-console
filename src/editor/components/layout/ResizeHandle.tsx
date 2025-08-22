'use client';

import { useState, useCallback, useEffect } from 'react';

interface ResizeHandleProps {
  onResize: (newSize: number) => void;
  direction: 'horizontal' | 'vertical';
  className?: string;
  minSize?: number;
  maxSize?: number;
}

export function ResizeHandle({
  onResize,
  direction,
  className = '',
  minSize = 200,
  maxSize = 800,
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();

      if (direction === 'horizontal') {
        const containerWidth = window.innerWidth;
        const newWidth = containerWidth - e.clientX;
        const clampedWidth = Math.max(minSize, Math.min(maxSize, newWidth));
        onResize(clampedWidth);
      } else {
        const containerHeight = window.innerHeight;
        const newHeight = containerHeight - e.clientY;
        const clampedHeight = Math.max(minSize, Math.min(maxSize, newHeight));
        onResize(clampedHeight);
      }
    },
    [isDragging, direction, onResize, minSize, maxSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  return (
    <div
      className={`select-none ${className} ${
        direction === 'horizontal' ? 'cursor-col-resize' : 'cursor-row-resize'
      } ${isDragging ? 'bg-primary' : ''}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
    >
      {/* Visual indicator */}
      <div
        className={`${
          direction === 'horizontal'
            ? 'w-full h-full flex items-center justify-center'
            : 'h-full w-full flex items-center justify-center'
        }`}
      >
        <div
          className={`${
            direction === 'horizontal'
              ? 'w-0.5 h-8 bg-base-content/20 rounded-full'
              : 'h-0.5 w-8 bg-base-content/20 rounded-full'
          }`}
        />
      </div>
    </div>
  );
}
