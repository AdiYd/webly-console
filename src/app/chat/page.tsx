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
  const [isPinned, setIsPinned] = useState(true);
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

  // Get initial dimensions based on container size and saved preferences
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: Math.min(800, clientWidth - 20), // Subtract padding
        height: Math.min(600, clientHeight - 20),
      });
    }
    const savedPreferences = localStorage.getItem('chatPreferences');
    if (savedPreferences) {
      const {
        isFullscreen: savedFullscreen,
        position: savedPosition,
        dimensions: savedDimensions,
        isPinned: savedPinned,
        isMinimized: savedMinimized,
      } = JSON.parse(savedPreferences);
      setIsFullscreen(savedFullscreen);
      setPosition(savedPosition);
      setDimensions(savedDimensions);
      setIsPinned(savedPinned);
      setIsMinimized(savedMinimized);
    }
    return () => {
      savePreferences(); // Save preferences on unmount
    };
  }, []);

  // Reset position when toggling fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);

  // Save preferences to localStorage
  useEffect(() => {
    savePreferences();
  }, [isFullscreen, position, dimensions, isPinned, isMinimized]);

  const savePreferences = () => {
    const preferences = {
      isFullscreen,
      position,
      dimensions,
      isPinned,
      isMinimized,
    };
    localStorage.setItem('chatPreferences', JSON.stringify(preferences));
  };

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

          if (chatRect && !isPinned) {
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

        // Boundary check - allow more space for width
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const parentWidth = containerRect.width + dimensions.width; // Include current width in calculation
          const maxWidth = parentWidth - position.x - 20; // Leave some margin
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
      // Save preferences to localStorage
      savePreferences();
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
    if (!isFullscreen && isMinimized) {
      setIsMinimized(false);
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleMinimize = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
    }
    setIsMinimized(!isMinimized);
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
      style={{ height: isMobile ? '90vh' : '' }}
      className="flex pt-2 w-full h-[calc(100vh-8rem)] transition-[width] relative"
    >
      {!isMobile ? (
        <>
          <div
            id="chat-container"
            className={`${
              isMinimized
                ? 'h-fit flex-shrink-0'
                : isMobile
                ? 'overflow-hidden flex-shrink-0'
                : 'h-full overflow-hidden flex-shrink-0'
            } py-1 z-10 flex flex-col relative`}
            style={
              !isFullscreen && !isMinimized
                ? {
                    minWidth: dimensions.width,
                    width: dimensions.width,
                    position: isPinned ? 'relative' : 'absolute',
                    transform: isPinned ? '' : `translate(${position.x}px, ${position.y}px)`,
                  }
                : {}
            }
          >
            <div
              ref={chatWindowRef}
              className={`${
                isFullscreen
                  ? 'fixed inset-4 z-50 mt-12 mb-16'
                  : 'relative z-20 max-h-[fill-available]'
              } `}
              style={
                !isFullscreen && !isMinimized
                  ? {
                      width: '100%',
                      height: dimensions.height,
                      transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease',
                    }
                  : isMinimized
                  ? {
                      width: '250px',
                      position: 'fixed',
                      zIndex: 500,
                      bottom: '5rem',
                      left: '0.5rem',
                      height: 'fit-content',
                      transform: isPinned ? '' : `translate(${position.x}px, ${position.y}px)`,
                      transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease',
                    }
                  : {}
              }
            >
              <div
                style={{ borderRadius: '0.5rem' }}
                className={`card 
              ${
                isMinimized
                  ? 'shadow-sm shadow-orange-500 hover:shadow-lg hover:shadow-amber-400'
                  : ''
              }
              !bg-base-100 overflow-hidden border border-base-300 transition-shadow h-full`}
              >
                <div
                  className={`drag-handle w-full h-8 bg-base-300 ${
                    isFullscreen || isPinned ? 'cursor-default' : 'cursor-move'
                  } flex items-center justify-between px-3`}
                  onMouseDown={handleMouseDown}
                >
                  <span className="text-sm font-medium">Webly AI Agent</span>
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
                      onClick={toggleMinimize}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      <Icon
                        icon={isMinimized ? 'ic:round-plus' : 'ic:round-minimize'}
                        className="w-4 h-4"
                      />
                    </button>
                    {!isFullscreen && (
                      <button
                        title={isPinned ? 'unpin element' : 'pin element'}
                        onClick={() => setIsPinned(!isPinned)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <Icon
                          icon={isPinned ? 'mdi:pin-outline' : 'ri:unpin-line'}
                          className="w-4 h-4"
                        />
                      </button>
                    )}
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
          </div>

          <div
            id="element-container"
            className="flex-1 h-full overflow-auto px-2 py-1  backdrop-blur-sm"
            style={isFullscreen || isMobile ? { display: 'none' } : {}}
          >
            <div style={{ borderRadius: '0.5rem' }} className="card rounded-md h-full bg-base-100">
              <div className="card-body">
                <h2 className="card-title">Content Area</h2>
                <p>This area will adapt to the remaining space as you resize the chat panel.</p>
                <div className="h-full flex items-center justify-center text-base-content/50">
                  <p>Drag the resize handle in the bottom-right corner of the chat panel.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 h-full overflow-auto py-1  backdrop-blur-sm">
          <ChatInterface isMinimized={true} />
        </div>
      )}
    </div>
  );
}
