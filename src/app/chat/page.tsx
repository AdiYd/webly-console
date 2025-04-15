'use client';

import { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/ai/ChatInterface';
import { Icon } from '@iconify/react';
import 'react-resizable/css/styles.css';
import { useBreakpoint } from '@/hooks/use-screen';

export default function ChatPage() {
  const [dimensions, setDimensions] = useState({ width: 350, height: 600 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 });
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [startDimensions, setStartDimensions] = useState({ width: 800, height: 600 });
  const { isMobile } = useBreakpoint();
  // Mark component as mounted and set initial window size
  useEffect(() => {
    setIsMounted(true);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Add window resize listener
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get initial dimensions based on container size
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: Math.min(800, clientWidth - 20), // Subtract padding
        height: Math.min(600, clientHeight - 20),
      });
    }
  }, []);

  // Reset position when toggling fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);

  // Custom drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Custom resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDimensions({ width: dimensions.width, height: dimensions.height });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;

        // Boundary check
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const chatRect = chatWindowRef.current?.getBoundingClientRect();

          if (chatRect) {
            const maxX = containerRect.width - chatRect.width;
            const maxY = containerRect.height - chatRect.height;

            setPosition({
              x: Math.max(0, Math.min(newX, maxX)),
              y: Math.max(0, Math.min(newY, maxY)),
            });
          }
        }
      } else if (isResizing) {
        const deltaWidth = e.clientX - startPos.x;
        const deltaHeight = e.clientY - startPos.y;

        const newWidth = Math.max(300, startDimensions.width + deltaWidth);
        const newHeight = Math.max(300, startDimensions.height + deltaHeight);

        // Boundary check
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const maxWidth = containerRect.width - position.x - 0;
          const maxHeight = containerRect.height - position.y - 0;

          setDimensions({
            width: Math.min(newWidth, maxWidth),
            height: Math.min(newHeight, maxHeight),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, startPos, position, startDimensions, dimensions, containerRef]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isMounted) {
    // Return a placeholder or loading state until component mounts
    return (
      <div className="p-4 flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="card !bg-base-100 p-8 shadow-lg">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`py-4 ${
        isMinimized
          ? 'h-fit'
          : isMobile
          ? 'overflow-hidden'
          : 'h-[calc(100vh-8rem)] overflow-hidden'
      } flex flex-col relative `}
    >
      {!isMobile ? (
        <div
          ref={chatWindowRef}
          className={`${
            isFullscreen
              ? 'fixed inset-4 z-50 mt-12 mb-16'
              : 'absolute left-0 max-h-[fill-available]'
          } `}
          style={
            !isFullscreen && !isMinimized
              ? {
                  width: dimensions.width,
                  height: dimensions.height,
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease',
                }
              : isMinimized
              ? {
                  width: '250px',
                  height: 'fit-content',
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease',
                }
              : {}
          }
        >
          <div
            className={`${
              isFullscreen ? 'card' : ''
            } !bg-base-100 shadow-lg overflow-hidden border border-base-300 transition-shadow hover:shadow-xl h-full`}
          >
            <div
              className={`drag-handle w-full h-8 bg-base-300  ${
                isFullscreen ? '' : 'cursor-move'
              } flex items-center justify-between px-3`}
              onMouseDown={handleMouseDown}
              // style={isMinimized ? { position: 'absolute', bottom: 0, left: 0 } : {}}
            >
              <span className="text-sm font-medium">AI Chat Assistant</span>
              <div className="flex flex-row-reverse gap-2">
                <button
                  title={isFullscreen ? 'minimize' : 'maximize'}
                  onClick={toggleFullscreen}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <Icon
                    icon={isFullscreen ? 'flowbite:minimize-outline' : 'mdi:fullscreen'}
                    className="w-4 h-4"
                  />
                </button>
                <button
                  title={isMinimized ? 'open' : 'close'}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <Icon
                    icon={isMinimized ? 'ic:round-plus' : 'ic:round-minimize'}
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
            {!isMinimized && (
              <div className="h-[calc(100%-2rem)] overflow-hidden">
                <ChatInterface isMinimized={!isFullscreen} />
              </div>
            )}
            {!isFullscreen && !isMinimized && (
              <div
                className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center"
                onMouseDown={handleResizeMouseDown}
              >
                <Icon icon="mdi:resize-bottom-right" className="w-4 h-4 text-base-content/30" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 h-full overflow-y-auto card* bg-base-100/80 backdrop-blur-xl">
          <ChatInterface isMinimized={true} />
        </div>
      )}
    </div>
  );
}
