'use client';

import React, { useEffect, useState, useRef } from 'react';

type Placement = 'top' | 'right' | 'bottom' | 'left';

export default function ImageTooltip({
  src,
  alt,
  caption,
  maxWidth = 360,
  placement = 'top',
  children,
  className = '',
}: {
  src: string;
  alt?: string;
  caption?: React.ReactNode;
  maxWidth?: number;
  placement?: Placement;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Close on outside click (useful for mobile tap toggles)
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [open]);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  const toggle = () => setOpen(o => !o);

  // position classes
  const placementClasses: Record<Placement, string> = {
    top: 'left-1/2 -translate-x-1/2 bottom-full mb-2',
    bottom: 'left-1/2 -translate-x-1/2 top-full mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
      // mouse + keyboard handlers
      onMouseEnter={() => !isTouch && show()}
      onMouseLeave={() => !isTouch && hide()}
      onFocus={() => !isTouch && show()}
      onBlur={() => !isTouch && hide()}
      // click toggles on touch devices so users can tap to open
      onClick={e => {
        if (isTouch) {
          e.stopPropagation();
          toggle();
        }
      }}
    >
      {/* children (target element) */}
      <div tabIndex={0} aria-haspopup="true" aria-expanded={open}>
        {children}
      </div>

      {/* tooltip */}
      <div
        className={`pointer-events-none z-50 absolute ${placementClasses[placement]}`}
        style={{ width: maxWidth }}
        aria-hidden={!open}
      >
        <div
          className={`transition-all duration-150 ease-out transform origin-bottom ${
            open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95'
          }`}
        >
          <div className="bg-base-100/95 rounded-md shadow-lg border border-base-300 overflow-hidden">
            <img
              src={src}
              alt={alt ?? 'preview'}
              className="w-full h-auto block object-cover"
              style={{ display: 'block' }}
            />
            {caption && <div className="text-xs text-base-content/60 p-2">{caption}</div>}
          </div>
          {/* caret */}
          <div
            className="w-3 h-3 rotate-45 bg-base-100/95 border-t border-l border-base-300 transform translate-y-1 -translate-x-0.5 mx-auto"
            style={{
              marginLeft:
                placement === 'left' ? undefined : placement === 'right' ? undefined : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
