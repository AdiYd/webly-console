'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useBreakpoint } from '@/hooks/use-screen';

// Define the props for the ChatLayoutWrapper component
interface ChatLayoutWrapperProps {
  chatComponent: React.ReactNode; // Chat component to be rendered
  initialChatState?: {
    isFullscreen?: boolean;
    isMinimized?: boolean;
    isPinned?: boolean;
  };
  children: React.ReactNode; // Children to be rendered inside the wrapper
}

// Define the state interface for better organization
interface ChatUIState {
  dimensions: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  display: {
    isFullscreen: boolean;
    isMinimized: boolean;
    isPinned: boolean;
  };
  interaction: {
    isDragging: boolean;
    isResizing: boolean;
    startPos: {
      x: number;
      y: number;
    };
    startDimensions: {
      width: number;
      height: number;
    };
  };
}

// Default state values
const DEFAULT_UI_STATE: ChatUIState = {
  dimensions: { width: 350, height: 600 },
  position: { x: 20, y: 20 }, // Default position set to bottom right
  display: {
    isFullscreen: false,
    isMinimized: false,
    isPinned: true,
  },
  interaction: {
    isDragging: false,
    isResizing: false,
    startPos: { x: 0, y: 0 },
    startDimensions: { width: 350, height: 600 },
  },
};

export default function ChatLayoutWrapper({
  chatComponent,
  initialChatState,
  children,
}: ChatLayoutWrapperProps) {
  // Initialize chatUI state with default values merged with initialChatState
  const [chatUI, setChatUI] = useState<ChatUIState>(() => {
    if (initialChatState) {
      return {
        ...DEFAULT_UI_STATE,
        display: {
          ...DEFAULT_UI_STATE.display,
          ...initialChatState,
        },
      };
    }
    return DEFAULT_UI_STATE;
  });

  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 });
  const [isMounted, setIsMounted] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isMobile } = useBreakpoint();

  // Helper function to update specific parts of the chatUI state
  const updateChatUI = useCallback((updates: Partial<ChatUIState>) => {
    setChatUI(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Helper function to update nested properties
  const updateNestedState = useCallback(
    (category: keyof ChatUIState, updates: Partial<ChatUIState[keyof ChatUIState]>) => {
      setChatUI(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          ...updates,
        },
      }));
    },
    []
  );

  // Helper function to get viewport bounds
  const getViewportBounds = useCallback(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);

  // Helper function to constrain position within viewport
  const constrainToViewport = useCallback(
    (pos: { x: number; y: number }, size: { width: number; height: number }) => {
      const viewport = getViewportBounds();

      return {
        x: Math.max(0, Math.min(pos.x, viewport.width - size.width)),
        y: Math.max(0, Math.min(pos.y, viewport.height - size.height)),
      };
    },
    [getViewportBounds]
  );

  // Save preferences to localStorage
  const savePreferences = useCallback(() => {
    if (!preferencesLoaded || !isMounted) return;

    const preferences = {
      dimensions: chatUI.dimensions,
      position: chatUI.position,
      display: chatUI.display,
    };

    localStorage.setItem('chatPreferences', JSON.stringify(preferences));
  }, [chatUI.dimensions, chatUI.position, chatUI.display, preferencesLoaded, isMounted]);

  // Mark component as mounted and set initial window size
  useEffect(() => {
    setIsMounted(true);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      const newWindowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setWindowSize(newWindowSize);

      // Constrain chat position when window resizes
      setChatUI(prev => {
        const constrainedPosition = constrainToViewport(prev.position, prev.dimensions);
        return {
          ...prev,
          position: constrainedPosition,
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [constrainToViewport]);

  // Load saved preferences and initialize dimensions
  useEffect(() => {
    if (!isMounted) return;

    // First set container-based initial dimensions
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialDimensions = {
        width: Math.min(350, clientWidth - 40),
        height: Math.min(600, clientHeight - 40),
      };

      // Only update dimensions if preferences haven't been loaded yet
      if (!preferencesLoaded) {
        updateNestedState('dimensions', initialDimensions);
      }
    }

    // Then try to load saved preferences
    const savedPreferences = localStorage.getItem('chatPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);

        // Create a new object with just the data we want to restore
        const restoredState = {
          dimensions: parsedPreferences.dimensions || DEFAULT_UI_STATE.dimensions,
          position: parsedPreferences.position || DEFAULT_UI_STATE.position,
          display: parsedPreferences.display || DEFAULT_UI_STATE.display,
        };

        // Update the state with loaded preferences
        updateChatUI({
          dimensions: restoredState.dimensions,
          position: restoredState.position,
          display: restoredState.display,
        });

        setPreferencesLoaded(true);
      } catch (e) {
        console.error('Error parsing saved chat preferences:', e);
        setPreferencesLoaded(true); // Still mark as loaded so we can save new preferences
      }
    } else {
      // No saved preferences found
      setPreferencesLoaded(true);
    }
  }, [isMounted, updateNestedState, updateChatUI]);

  // Save preferences when component unmounts
  useEffect(() => {
    return () => {
      if (preferencesLoaded && isMounted) {
        savePreferences();
      }
    };
  }, [preferencesLoaded, isMounted, savePreferences]);

  // Save preferences to localStorage when relevant states change
  useEffect(() => {
    // Only save if preferences have been loaded
    if (preferencesLoaded && isMounted) {
      // Use a debounce to avoid excessive saves
      const timeoutId = setTimeout(() => {
        savePreferences();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    chatUI.display.isFullscreen,
    chatUI.display.isMinimized,
    chatUI.display.isPinned,
    chatUI.dimensions.width,
    chatUI.dimensions.height,
    chatUI.position.x,
    chatUI.position.y,
    preferencesLoaded,
    isMounted,
    savePreferences,
  ]);

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (chatUI.interaction.isDragging) {
        const newX = e.clientX - chatUI.interaction.startPos.x;
        const newY = e.clientY - chatUI.interaction.startPos.y;

        // For minimized state, use different dimension calculations
        const currentDimensions = chatUI.display.isMinimized
          ? { width: 280, height: 60 }
          : { width: chatUI.dimensions.width, height: chatUI.dimensions.height };

        // Constrain position to viewport bounds
        const constrainedPosition = constrainToViewport({ x: newX, y: newY }, currentDimensions);

        setChatUI(prev => ({
          ...prev,
          position: constrainedPosition,
        }));

        // Visual feedback during drag
        if (chatWindowRef.current) {
          chatWindowRef.current.style.boxShadow = '0 0 15px rgba(var(--color-primary), 0.4)';
        }

        // Clear any existing timeout
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }

        // Set timeout to remove visual feedback
        dragTimeoutRef.current = setTimeout(() => {
          if (chatWindowRef.current) {
            chatWindowRef.current.style.boxShadow = '';
          }
        }, 200);
      } else if (chatUI.interaction.isResizing) {
        const deltaWidth = e.clientX - chatUI.interaction.startPos.x;
        const deltaHeight = e.clientY - chatUI.interaction.startPos.y;

        const newWidth = Math.max(300, chatUI.interaction.startDimensions.width + deltaWidth);
        const newHeight = Math.max(300, chatUI.interaction.startDimensions.height + deltaHeight);

        // Constrain dimensions to viewport bounds
        const viewport = getViewportBounds();
        const maxWidth = Math.max(300, viewport.width - chatUI.position.x - 20);

        // For pinned mode, height should fill available space
        const maxHeight = chatUI.display.isPinned
          ? viewport.height - 40
          : Math.max(300, viewport.height - chatUI.position.y - 20);

        setChatUI(prev => ({
          ...prev,
          dimensions: {
            width: Math.min(newWidth, maxWidth),
            height: chatUI.display.isPinned ? maxHeight : Math.min(newHeight, maxHeight),
          },
        }));

        // Visual feedback during resize
        if (chatWindowRef.current) {
          chatWindowRef.current.style.boxShadow = '0 0 15px rgba(var(--color-primary), 0.4)';
        }

        // Clear any existing timeout
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }

        // Set timeout to remove visual feedback
        dragTimeoutRef.current = setTimeout(() => {
          if (chatWindowRef.current) {
            chatWindowRef.current.style.boxShadow = '';
          }
        }, 200);
      }
    };

    const handleMouseUp = () => {
      if (chatUI.interaction.isDragging || chatUI.interaction.isResizing) {
        // End drag/resize operations
        setChatUI(prev => ({
          ...prev,
          interaction: {
            ...prev.interaction,
            isDragging: false,
            isResizing: false,
          },
        }));

        document.body.classList.remove('select-none');

        // Remove visual feedback immediately on mouseup
        if (chatWindowRef.current) {
          chatWindowRef.current.style.boxShadow = '';
        }

        // Cancel any pending timeout
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }

        // Explicitly save preferences after drag/resize ends
        savePreferences();
      }
    };

    // Add global event listeners only when needed
    if (chatUI.interaction.isDragging || chatUI.interaction.isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.classList.add('select-none');

      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('select-none');

      // Reset text selection style
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [
    chatUI.interaction.isDragging,
    chatUI.interaction.isResizing,
    chatUI.interaction.startPos,
    chatUI.interaction.startDimensions,
    chatUI.dimensions,
    chatUI.position,
    chatUI.display.isPinned,
    chatUI.display.isMinimized,
    isMounted,
    savePreferences,
    constrainToViewport,
    getViewportBounds,
  ]);

  // Custom drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from header when not fullscreen and either unpinned OR minimized
    if (chatUI.display.isFullscreen) return;
    if (!chatUI.display.isMinimized && chatUI.display.isPinned) return;
    if (headerRef.current && !headerRef.current.contains(e.target as Node)) return;

    // Prevent default to avoid text selection
    e.preventDefault();
    e.stopPropagation();

    // Set dragging state
    setChatUI(prev => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        isDragging: true,
        startPos: {
          x: e.clientX - prev.position.x,
          y: e.clientY - prev.position.y,
        },
      },
    }));
  };

  // Custom resize handlers for bottom-right corner
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (chatUI.display.isFullscreen || chatUI.display.isMinimized) return;

      e.stopPropagation();
      e.preventDefault();

      setChatUI(prev => ({
        ...prev,
        interaction: {
          ...prev.interaction,
          isResizing: true,
          startPos: { x: e.clientX, y: e.clientY },
          startDimensions: {
            width: prev.dimensions.width,
            height: prev.dimensions.height,
          },
        },
      }));
    },
    [chatUI.display.isFullscreen, chatUI.display.isMinimized]
  );

  // Right edge resize handler
  const handleRightEdgeResize = useCallback(
    (e: React.MouseEvent) => {
      if (chatUI.display.isFullscreen || chatUI.display.isMinimized) return;

      e.stopPropagation();
      e.preventDefault();

      setChatUI(prev => ({
        ...prev,
        interaction: {
          ...prev.interaction,
          isResizing: true,
          startPos: { x: e.clientX, y: e.clientY },
          startDimensions: {
            width: prev.dimensions.width,
            height: prev.dimensions.height,
          },
        },
      }));
    },
    [chatUI.display.isFullscreen, chatUI.display.isMinimized]
  );

  // Toggle UI state functions with improved click handling
  const toggleFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const newIsFullscreen = !chatUI.display.isFullscreen;

      // Store position before changing state
      const currentPosition = { ...chatUI.position };

      // Update state with proper position retention
      setChatUI(prev => ({
        ...prev,
        display: {
          ...prev.display,
          isFullscreen: newIsFullscreen,
          isMinimized: false,
        },
        // Preserve position even when toggling fullscreen
        position: currentPosition,
      }));
    },
    [chatUI.display.isFullscreen, chatUI.position]
  );

  const toggleMinimize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      setChatUI(prev => {
        const isCurrentlyMinimized = prev.display.isMinimized;

        if (isCurrentlyMinimized) {
          // Expanding from minimized state - restore to valid position
          const restoredPosition = constrainToViewport(prev.position, prev.dimensions);

          return {
            ...prev,
            display: {
              ...prev.display,
              isFullscreen: false,
              isMinimized: false,
            },
            position: restoredPosition,
          };
        } else {
          // Minimizing - calculate safe minimized position
          const viewport = getViewportBounds();
          const minimizedWidth = 280;
          const minimizedHeight = 60; // Approximate minimized height

          // Try to keep current X position, but ensure it's within bounds
          const safeX = Math.max(0, Math.min(prev.position.x, viewport.width - minimizedWidth));
          const safeY = Math.max(0, Math.min(prev.position.y, viewport.height - minimizedHeight));

          return {
            ...prev,
            display: {
              ...prev.display,
              isFullscreen: false,
              isMinimized: true,
            },
            position: {
              x: safeX,
              y: safeY,
            },
          };
        }
      });
    },
    [constrainToViewport, getViewportBounds]
  );

  const togglePin = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // Store position before changing state
      const currentPosition = { ...chatUI.position };

      // Update state directly
      setChatUI(prev => ({
        ...prev,
        display: {
          ...prev.display,
          isPinned: !prev.display.isPinned,
        },
        position: currentPosition,
      }));
    },
    [chatUI.position]
  );

  const renderChatHeader = () => (
    <div
      ref={headerRef}
      className={`
      ${
        chatUI.display.isMinimized ? 'relative' : 'absolute'
      } gap-4 w-full backdrop-blur-lg flex items-center overflow-x-auto justify-between py-1 px-3 border-transparent border-[1px] border-b-zinc-400/20
      drag-handle ${
        chatUI.display.isFullscreen || (!chatUI.display.isMinimized && chatUI.display.isPinned)
          ? 'cursor-default'
          : 'cursor-move'
      } flex items-center justify-between px-3 z-50`}
      onMouseDown={handleMouseDown}
      role="region"
      aria-label="Chat controls"
    >
      {/* Window controls */}
      <div className="flex items-center gap-1 z-10">
        <div className="w-3 h-3 rounded-full bg-red-500* btn min-h-2 btn-xs btn-primary btn-circle"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500* btn min-h-2 btn-xs btn-secondary btn-circle"></div>
        <div className="w-3 h-3 rounded-full bg-green-500* btn min-h-2 btn-xs btn-accent btn-circle"></div>
        {chatUI.display.isFullscreen && <span className="text-sm ml-4 font-medium">Chat</span>}
      </div>

      {/* Window control buttons */}
      <div className="flex flex-row-reverse gap-2" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          title={chatUI.display.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          onClick={toggleFullscreen}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label={chatUI.display.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <Icon
            icon={chatUI.display.isFullscreen ? 'flowbite:minimize-outline' : 'mdi:fullscreen'}
            className="w-4 h-4"
          />
        </button>
        <button
          type="button"
          title={chatUI.display.isMinimized ? 'Expand' : 'Minimize'}
          onClick={toggleMinimize}
          className="btn btn-ghost btn-xs btn-circle hover:btn-secondary"
          aria-label={chatUI.display.isMinimized ? 'Expand chat' : 'Minimize chat'}
        >
          <Icon
            icon={chatUI.display.isMinimized ? 'ic:round-plus' : 'ic:round-minimize'}
            className="w-4 h-4"
          />
        </button>
        {!chatUI.display.isFullscreen && (
          <button
            type="button"
            title={chatUI.display.isPinned ? 'Unpin chat' : 'Pin chat'}
            onClick={togglePin}
            className="btn btn-ghost btn-xs btn-circle hover:btn-accent"
            aria-label={chatUI.display.isPinned ? 'Unpin chat' : 'Pin chat'}
          >
            <Icon
              icon={chatUI.display.isPinned ? 'mdi:pin-outline' : 'ri:unpin-line'}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>
    </div>
  );

  if (!isMounted) {
    // Return a placeholder until component mounts
    return (
      <div className="p-4 flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="card p-8 shadow-lg">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: isMobile ? '90vh' : '' }}
      className="flex py-1 w-full h-screen h-[calc(100vh-3rem)]* overflow-hidden transition-[width] relative"
    >
      {isMobile ? (
        <div className="flex-1 h-full overflow-auto py-1 backdrop-blur-sm">{chatComponent}</div>
      ) : (
        <>
          {/* Chat Container */}
          <div
            id="chat-container"
            className={`${
              chatUI.display.isMinimized
                ? 'h-fit flex-shrink-0'
                : isMobile
                ? 'overflow-hidden flex-shrink-0'
                : `h-auto overflow-hidden flex-shrink-0`
            } py-1 z-40 flex flex-col relative `}
            style={
              !chatUI.display.isFullscreen && !chatUI.display.isMinimized
                ? {
                    minWidth: chatUI.dimensions.width,
                    width: chatUI.dimensions.width,
                    position: chatUI.display.isPinned ? 'relative' : 'absolute',
                    transform: chatUI.display.isPinned
                      ? ''
                      : `translate(${chatUI.position.x}px, ${chatUI.position.y}px)`,
                  }
                : {}
            }
          >
            <div
              ref={chatWindowRef}
              className={`${
                chatUI.display.isFullscreen
                  ? 'fixed inset-4 h-[fill-available] z-50 mt-12* mb-16*'
                  : 'relative z-20 h-[fill-available]'
              } `}
              style={
                !chatUI.display.isFullscreen && !chatUI.display.isMinimized
                  ? {
                      width: '100%',
                      height: chatUI.display.isPinned ? '' : chatUI.dimensions.height,
                      transition:
                        chatUI.interaction.isDragging || chatUI.interaction.isResizing
                          ? 'none'
                          : 'box-shadow 0.3s ease',
                    }
                  : chatUI.display.isMinimized
                  ? {
                      width: '280px',
                      position: 'fixed',
                      zIndex: 500,
                      height: 'fit-content',
                      // Use absolute positioning for minimized state to enable dragging
                      left: `${chatUI.position.x}px`,
                      top: `${chatUI.position.y}px`,
                      bottom: 'auto',
                      right: 'auto',
                      transform: 'none',
                      transition:
                        chatUI.interaction.isDragging || chatUI.interaction.isResizing
                          ? 'none'
                          : 'box-shadow 0.3s ease',
                    }
                  : {}
              }
            >
              <div
                style={{ borderRadius: '0.5rem' }}
                className={`card 
                ${
                  chatUI.display.isMinimized
                    ? '!shadow-none hover:!shadow-lg  hover:!shadow-primary/30'
                    : ''
                }
                !bg-base-200 overflow-hidden border border-base-300 transition-shadow h-full relative`}
              >
                {renderChatHeader()}

                <div
                  style={{ display: !chatUI.display.isMinimized ? '' : 'none' }}
                  className="h-full overflow-hidden"
                >
                  {chatComponent}
                </div>

                {/* Right edge resize handle */}
                {!chatUI.display.isFullscreen && !chatUI.display.isMinimized && (
                  <div
                    className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:border-r transition-colors z-10"
                    onMouseDown={handleRightEdgeResize}
                    aria-label="Resize chat width"
                    title="Resize chat width"
                  />
                )}

                {/* Bottom-right corner resize handle */}
                {!chatUI.display.isFullscreen &&
                  !chatUI.display.isMinimized &&
                  !chatUI.display.isPinned && (
                    <div
                      className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center hover:bg-base-300* rounded-bl z-20 bg-base-200/50*"
                      onMouseDown={handleResizeMouseDown}
                      aria-label="Resize chat window"
                      title="Resize chat window"
                    >
                      <Icon
                        icon="mdi:resize-bottom-right"
                        className="w-4 h-4 text-base-content/50 hover:text-base-content"
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div
            id="main-content-container"
            className="flex-1 h-full overflow-auto px-0.5 py-1 backdrop-blur-sm"
            style={chatUI.display.isFullscreen || isMobile ? { display: 'none' } : {}}
          >
            <div className="card rounded-md h-full bg-base-100* z-20 overflow-auto">
              <div className="h-full">{children}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
