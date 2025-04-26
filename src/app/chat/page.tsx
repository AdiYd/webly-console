'use client';

import { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/ai/ChatInterface';
import { Icon } from '@iconify/react';
import 'react-resizable/css/styles.css';
import { useBreakpoint } from '@/hooks/use-screen';
import { useSession } from 'next-auth/react';
import { AIProvider, useOrganization } from '@/context/OrganizationContext';
import { useRouter } from 'next/navigation';

// Define a unified state interface for better organization
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
  position: { x: 0, y: 0 },
  display: {
    isFullscreen: true,
    isMinimized: false,
    isPinned: true,
  },
  interaction: {
    isDragging: false,
    isResizing: false,
    startPos: { x: 0, y: 0 },
    startDimensions: { width: 800, height: 600 },
  },
};

export default function ChatPage() {
  const [chatUI, setChatUI] = useState<ChatUIState>(DEFAULT_UI_STATE);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 });
  const [isMounted, setIsMounted] = useState(false);
  const { agents, availableProviders, isAuth, model, provider, setProvider, setModel, icon } =
    useOrganization();

  const navigate = useRouter();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const { isMobile } = useBreakpoint();

  // Helper function to update specific parts of the chatUI state
  const updateChatUI = (updates: Partial<ChatUIState>) => {
    setChatUI(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Helper function to update nested properties
  const updateNestedState = (
    category: keyof ChatUIState,
    updates: Partial<ChatUIState[keyof ChatUIState]>
  ) => {
    setChatUI(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      },
    }));
  };

  // Save preferences to localStorage
  const savePreferences = () => {
    // Only save if preferences have been loaded (prevents saving defaults)
    if (!preferencesLoaded) return;

    const preferences = {
      dimensions: chatUI.dimensions,
      position: chatUI.position,
      display: chatUI.display,
    };

    localStorage.setItem('chatPreferences', JSON.stringify(preferences));
  };

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

  // Load saved preferences and initialize dimensions
  useEffect(() => {
    // First set container-based initial dimensions
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialDimensions = {
        width: Math.min(800, clientWidth - 20),
        height: Math.min(600, clientHeight - 20),
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
        // This prevents issues if the saved structure doesn't match current structure
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

        // Mark preferences as loaded to enable saving
        setPreferencesLoaded(true);
      } catch (e) {
        console.error('Error parsing saved chat preferences:', e);
        setPreferencesLoaded(true); // Still mark as loaded so we can save new preferences
      }
    } else {
      // No saved preferences found, mark as loaded so we can save current state
      setPreferencesLoaded(true);
    }

    // Save preferences when component unmounts
    return () => {
      if (preferencesLoaded) {
        savePreferences();
      }
    };
  }, []);

  // Reset position when toggling fullscreen
  useEffect(() => {
    if (chatUI.display.isFullscreen) {
      updateNestedState('position', { x: 0, y: 0 });
    }
  }, [chatUI.display.isFullscreen]);

  // Save preferences to localStorage when relevant states change
  useEffect(() => {
    // Only save if preferences have been loaded
    if (preferencesLoaded) {
      savePreferences();
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
  ]);

  // Custom drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (chatUI.display.isFullscreen) return;

    updateNestedState('interaction', {
      isDragging: true,
      startPos: {
        x: e.clientX - chatUI.position.x,
        y: e.clientY - chatUI.position.y,
      },
    });
  };

  // Custom resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (chatUI.display.isFullscreen) return;

    e.stopPropagation();
    e.preventDefault();

    updateNestedState('interaction', {
      isResizing: true,
      startPos: { x: e.clientX, y: e.clientY },
      startDimensions: {
        width: chatUI.dimensions.width,
        height: chatUI.dimensions.height,
      },
    });
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (chatUI.interaction.isDragging) {
        const newX = e.clientX - chatUI.interaction.startPos.x;
        const newY = e.clientY - chatUI.interaction.startPos.y;

        // Boundary check
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const chatRect = chatWindowRef.current?.getBoundingClientRect();

          if (chatRect && !chatUI.display.isPinned) {
            const maxX = containerRect.width - chatRect.width;
            const maxY = containerRect.height - chatRect.height;

            updateNestedState('position', {
              x: Math.max(0, Math.min(newX, maxX)),
              y: Math.max(0, Math.min(newY, maxY)),
            });
          }
        }
      } else if (chatUI.interaction.isResizing) {
        const deltaWidth = e.clientX - chatUI.interaction.startPos.x;
        const deltaHeight = e.clientY - chatUI.interaction.startPos.y;

        const newWidth = Math.max(300, chatUI.interaction.startDimensions.width + deltaWidth);
        const newHeight = Math.max(300, chatUI.interaction.startDimensions.height + deltaHeight);

        // Boundary check - allow more space for width
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const parentWidth = containerRect.width + chatUI.dimensions.width;
          const maxWidth = containerRect.width - chatUI.position.x - 20;
          const maxHeight = containerRect.height - chatUI.position.y - 0;

          updateNestedState('dimensions', {
            width: Math.min(newWidth, maxWidth),
            height: chatUI.display.isPinned ? maxHeight : Math.min(newHeight, maxHeight),
          });
        }
      }
    };

    const handleMouseUp = () => {
      updateNestedState('interaction', {
        isDragging: false,
        isResizing: false,
      });
    };

    if (chatUI.interaction.isDragging || chatUI.interaction.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    chatUI.interaction.isDragging,
    chatUI.interaction.isResizing,
    chatUI.interaction.startPos,
    chatUI.position,
    chatUI.interaction.startDimensions,
    chatUI.dimensions,
    chatUI.display.isPinned,
  ]);

  // Toggle UI state functions
  const toggleFullscreen = (e: React.MouseEvent) => {
    // Stop propagation to prevent the parent's onMouseDown from firing
    e.stopPropagation();

    const newIsFullscreen = !chatUI.display.isFullscreen;

    // If coming out of fullscreen while minimized, restore from minimized state
    if (!newIsFullscreen && chatUI.display.isMinimized) {
      updateNestedState('display', {
        isFullscreen: newIsFullscreen,
        isMinimized: false,
        isPinned: true,
      });
    } else {
      updateNestedState('display', {
        isFullscreen: newIsFullscreen,
        isMinimized: false,
        // isPinned: false,
      });
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    // Stop propagation to prevent the parent's onMouseDown from firing
    e.stopPropagation();

    // If fullscreen, exit fullscreen mode first
    if (chatUI.display.isFullscreen) {
      updateNestedState('display', {
        isFullscreen: false,
        isMinimized: !chatUI.display.isMinimized,
      });
    } else {
      updateNestedState('display', {
        isMinimized: !chatUI.display.isMinimized,
      });
    }
  };

  const togglePin = (e: React.MouseEvent) => {
    // Stop propagation to prevent the parent's onMouseDown from firing
    e.stopPropagation();

    updateNestedState('display', {
      isPinned: !chatUI.display.isPinned,
    });

    if (!chatUI.display.isPinned) {
      const maxHeight = windowSize.height - chatUI.position.y - 0;
      updateNestedState('dimensions', {
        height: maxHeight,
      });
    }
  };

  const renderModelSelector = () => (
    <div
      className={`
      ${
        chatUI.display.isMinimized ? 'relative' : 'absolute'
      } gap-4 w-full backdrop-blur-lg flex items-center overflow-x-auto justify-between py-1 px-3 border-transparent border-[1px] border-b-zinc-400/20
      drag-handle  ${
        chatUI.display.isFullscreen || chatUI.display.isPinned ? 'cursor-default' : 'cursor-move'
      } flex items-center justify-between px-3 z-50`}
      onMouseDown={handleMouseDown}
    >
      {/* 3 circles for Apple browser reference */}
      <div onClick={() => navigate.push('/')} className="flex items-center gap-1 z-10">
        <div className="w-3 h-3 rounded-full bg-red-500* btn min-h-2 btn-xs btn-primary btn-circle"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500* btn min-h-2 btn-xs btn-secondary btn-circle"></div>
        <div className="w-3 h-3 rounded-full bg-green-500* btn min-h-2 btn-xs btn-accent btn-circle"></div>
        {chatUI.display.isFullscreen && (
          <span className="text-sm ml-4 font-medium">Webly AI Organization</span>
        )}
      </div>
      {/* Show available agents */}
      {!chatUI.display.isMinimized && (
        <div className="flex items-center gap-3">
          {isAuth &&
            agents.map((agent, index) => (
              <div key={index} className="agent-item">
                {agent.name}
              </div>
            ))}
          <div className="flex items-center gap-3">
            <Icon icon={icon} className="w-5 h-5" />
            <select
              className="select w-max select-sm select-bordered"
              value={provider}
              onChange={e => {
                const newProvider = e.target.value as AIProvider;
                setProvider(newProvider);
              }}
              // disabled={isLoading}
            >
              {Object.keys(availableProviders).map(p => (
                <option key={p} value={p} className="flex items-center">
                  {availableProviders[p as AIProvider].name}
                </option>
              ))}
            </select>
          </div>
          <select
            className="select w-fit select-sm select-bordered"
            value={model}
            onChange={e => setModel(e.target.value)}
            // disabled={isLoading}
          >
            {provider &&
              availableProviders[provider]?.models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>
      )}
      {/* Resize icons */}
      <div className="flex flex-row-reverse gap-2">
        <button
          title={chatUI.display.isFullscreen ? 'minimize' : 'maximize'}
          onClick={toggleFullscreen}
          className="btn btn-ghost btn-xs btn-circle"
        >
          <Icon
            icon={chatUI.display.isFullscreen ? 'flowbite:minimize-outline' : 'mdi:fullscreen'}
            className="w-4 h-4"
          />
        </button>
        <button
          title={chatUI.display.isMinimized ? 'open' : 'close'}
          onClick={toggleMinimize}
          className="btn btn-ghost btn-xs btn-circle"
        >
          <Icon
            icon={chatUI.display.isMinimized ? 'ic:round-plus' : 'ic:round-minimize'}
            className="w-4 h-4"
          />
        </button>
        {!chatUI.display.isFullscreen && (
          <button
            title={chatUI.display.isPinned ? 'unpin element' : 'pin element'}
            onClick={togglePin}
            className="btn btn-ghost btn-xs btn-circle"
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
    // Return a placeholder or loading state until component mounts
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
      {!isMobile ? (
        <>
          <div
            id="chat-container"
            className={`${
              chatUI.display.isMinimized
                ? 'h-fit flex-shrink-0'
                : isMobile
                ? 'overflow-hidden flex-shrink-0'
                : 'h-[fill-available] overflow-hidden flex-shrink-0'
            } py-1 z-40 flex flex-col relative `}
            style={
              !chatUI.display.isFullscreen && !chatUI.display.isMinimized
                ? {
                    minWidth: chatUI.dimensions.width,
                    width: chatUI.dimensions.width,
                    position: chatUI.display.isPinned ? 'relative' : 'absolute',
                    transform: chatUI.display.isPinned
                      ? ''
                      : `translate(${chatUI.position.x - 10}px, ${chatUI.position.y - 10}px)`,
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
                      bottom: '2.5rem',
                      left: '0.5rem',
                      height: 'fit-content',
                      transform: chatUI.display.isPinned
                        ? ''
                        : `translate(${chatUI.position.x}px, ${chatUI.position.y}px)`,
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
                    ? 'shadow-sm shadow-orange-500 hover:shadow-lg hover:shadow-amber-400'
                    : ''
                }
                !bg-base-200 overflow-hidden border border-base-300 transition-shadow h-full`}
              >
                {renderModelSelector()}

                <div
                  style={{ display: !chatUI.display.isMinimized ? '' : 'none' }}
                  className="h-full overflow-hidden"
                >
                  <ChatInterface isMinimized={!chatUI.display.isFullscreen} />
                </div>

                {!chatUI.display.isFullscreen && !chatUI.display.isMinimized && (
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
            className="flex-1 h-full overflow-auto px-0.5 py-1 backdrop-blur-sm"
            style={chatUI.display.isFullscreen || isMobile ? { display: 'none' } : {}}
          >
            <div
              // data-theme="cupcake"
              style={{ borderRadius: '0.5rem' }}
              className="card rounded-md h-full bg-base-100* z-20"
            >
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
        <div className="flex-1 h-full overflow-auto py-1 backdrop-blur-sm">
          <ChatInterface isMinimized={true} />
        </div>
      )}
    </div>
  );
}
