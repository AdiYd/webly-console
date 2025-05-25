'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import '@/globals.css';

// Type definitions
interface ChatInterfaceProps {
  initialMessages?: any[];
  isMinimized?: boolean;
  projectId?: string;
  sessionId?: string;
}

// Example chat data for initial state
const exampleChat = [
  {
    role: 'assistant',
    content: 'Hello! How can I assist you today?',
    id: '1',
  },
];

export default function ChatInterface({ initialMessages = exampleChat, isMinimized = false }: ChatInterfaceProps) {
  // UI state management
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [tempInput, setTempInput] = useState<string>('');

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: session } = useSession();

  // User information
  const userImage = session?.user?.image || 'https://i.pravatar.cc/150?img=3';
  const userName = session?.user?.name || 'User';

  // Initialize chat with the useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    status,
    error: chatError,
    setInput,
  } = useChat({
    api: '/api/ai/chat',
    initialMessages: initialMessages,
    body: {
      provider,
      temperature: 0.7,
    },
  });

  // Track loading state
  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    // Event handler for history navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if textarea is focused
      if (document.activeElement !== textareaRef.current) return;

      if (
        (e.key === 'ArrowUp' && e.ctrlKey) ||
        (e.key === 'ArrowUp' &&
          textareaRef.current === document.activeElement &&
          (input === '' || inputHistory.includes(input)))
      ) {
        e.preventDefault();
        navigateHistory('up');
      } else if (
        (e.key === 'ArrowDown' && e.ctrlKey) ||
        (e.key === 'ArrowDown' &&
          textareaRef.current === document.activeElement &&
          (input === '' || inputHistory.includes(input)))
      ) {
        e.preventDefault();
        navigateHistory('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputHistory, historyIndex, input]);

  /**
   * Navigate through input history
   */
  const navigateHistory = (direction: 'up' | 'down') => {
    if (inputHistory.length === 0) return;
    if (direction === 'up') {
      if (historyIndex === -1) {
        // Starting history navigation, save current input
        setTempInput(input);
        const newIndex = inputHistory.length - 1;
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      } else if (historyIndex > 0) {
        // Navigate to previous item
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      }
    } else if (direction === 'down') {
      if (historyIndex === -1) return; // No history navigation active

      if (historyIndex < inputHistory.length - 1) {
        // Navigate to next item
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
      } else {
        // Return to current input
        setHistoryIndex(-1);
        setInput(tempInput);
      }
    }
  };

  // Effect: Focus on input when ready
  useEffect(() => {
    if (['ready', 'error'].includes(status) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [status]);

  // Effect: Handle chat errors
  useEffect(() => {
    if (chatError) {
      console.error('Chat error from hook:', chatError);
      try {
        setError(JSON.parse(chatError.message).error || 'An error occurred');
      } catch (e) {
        setError(chatError.message || 'An error occurred');
      }
    } else {
      setError(null);
    }
  }, [chatError]);

  // Effect: Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Custom submit handler for sending messages
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add to history only if it's different from the last entry and not empty
    if (
      input.trim() &&
      (inputHistory.length === 0 || inputHistory[inputHistory.length - 1] !== input.trim())
    ) {
      setInputHistory(prev => {
        const newHistory = [...prev, input.trim()];
        // Keep only last 8 entries
        return newHistory.slice(-8);
      });
    }

    // Reset history navigation state
    setHistoryIndex(-1);
    setTempInput('');

    handleChatSubmit(e);
  };

  /**
   * Formats message content with proper handling of code blocks
   */
  const formatMessageContent = (content: string) => {
    if (!content) return null;

    // Split the message by common code block markers
    const parts = content.split(/(```[\s\S]*?```|`[\s\S]*?`)/g);

    return parts.map((part, i) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.substring(3, part.length - 3);
        const languageMatch = code.match(/^[a-zA-Z0-9_+-]+/);
        const language = languageMatch ? languageMatch[0].trim() : '';
        const codeContent = language ? code.substring(language.length).trim() : code;

        return (
          <pre
            key={i}
            className="text-neutral-content card !bg-zinc-800 p-3 overflow-x-auto text-sm my-2 w-fit"
          >
            {language && <div className="text-xs opacity-70 mb-1">$ {language}</div>}
            <code>{codeContent}</code>
          </pre>
        );
      }
      // Check if this part is an inline code snippet
      else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="text-neutral-content card !bg-zinc-800 px-1 rounded w-fit">
            {part.substring(1, part.length - 1)}
          </code>
        );
      }
      // Regular text content
      else if (part.trim()) {
        // Preserve line breaks in normal text
        const lines = part.split('\n');
        return (
          <span key={i} className="whitespace-pre-wrap">
            {lines.map((line, j) => (
              <span key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </span>
        );
      }
      return null;
    });
  };

  /**
   * Renders the empty state when no messages exist
   */
  const renderEmptyState = () => (
    <div className="flex flex-col pt-12 items-center justify-center text-base-content/60">
      <Icon icon="carbon:chat" className="w-16 h-16 mb-4" />
      <p className="text-lg font-medium">Start a conversation with the AI</p>
    </div>
  );

  /**
   * Renders a message bubble
   */
  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user';
    let content = '';

    // Handle different message content formats
    if (typeof message.content === 'string') {
      content = message.content;
    } else if (Array.isArray(message.content)) {
      content = message.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('\n');
    } else if (typeof message === 'string') {
      content = message;
    }

    return (
      <div
        key={message.id || `msg-${index}`}
        className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}
      >
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            {isUser ? (
              <img src={userImage} />
            ) : (
              <div className="bg-primary flex items-center justify-center h-full">
                <div className="circle-bg" />
              </div>
              // <div
              //   style={{ animationDuration: '10s' }}
              //   id="animated-blur-radial-gradient"
              //   className="w-10 h-10 rounded-full animate-spin"
              // >
              //   <div
              //     style={{
              //       animationDuration: '2s',
              //       animationDirection: 'alternate-reverse',
              //       animationDelay: '0s',
              //     }}
              //     className="w-10 h-10 rounded-full blur-[4px] bg-primary bg-gradient-to-r from-primary from-[10%] via-accent to-secondary animate-pulse* "
              //   />
              // </div>
            )}
          </div>
        </div>
        <div className="chat-header">{isUser ? userName : 'AI Assistant'}</div>
        <div className={`chat-bubble ${isUser ? 'chat-bubble-primary' : ''}`}>
          {formatMessageContent(content)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-base-100 justify-between h-full w-full">
      {/* Messages area */}
      <div
        className={`flex-1 mt-8 overflow-y-auto max-h-[fill-available] p-4 md:px-6 ${
          isMinimized ? '!px-3' : ''
        } space-y-4`}
      >
        {messages.length === 0
          ? renderEmptyState()
          : messages.map((message, index) => renderMessage(message, index))}

        {error && !isLoading && (
          <div className="alert alert-error w-fit ml-12 shadow-lg mt-2">
            <Icon icon="carbon:warning" className="w-6 h-6" />
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              <Icon icon="carbon:close" className="w-4 h-4" />
              Close
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className={`${isMinimized ? 'p-2' : 'p-4'} max-sm:p-2 pt-0 max-w-[1200px] w-full mx-auto`}
      >
        <div
          className="card hover:!border-base-content/50 border-[0.9px] border-base-content/30 !bg-base-300 flex flex-col my-4 mx-2 max-sm:m-0 rounded-xl"
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="flex justify-between items-center min-h-[60px] max-h-[200px] p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here... (Ctrl+↑/↓ for history)"
              className="w-full resize-none bg-transparent focus:outline-none mr-2 overflow-y-auto"
              maxLength={2000}
              disabled={isLoading}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary btn-square"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Icon icon="carbon:send" className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center px-3 pb-1 border-base-300">
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/60">
                {2000 - input.length} characters remaining
              </span>
              {inputHistory.length > 0 && (
                <span className="text-xs text-base-content/40">
                  • {inputHistory.length}/8 history
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 space-x-2">
              <div
                onClick={() => setProvider('openai')}
                title="Openai"
                className={`cursor-pointer hover:bg-zinc-400/40 rounded-md p-[2px] ${
                  provider === 'openai' ? 'bg-primary/20' : ''
                }`}
              >
                <Icon className="" icon="ri:openai-fill" width="1em" height="1em" />
              </div>
              <div
                onClick={() => setProvider('anthropic')}
                title="Anthropic"
                className={`cursor-pointer hover:bg-zinc-400/40 rounded-md p-[2px] ${
                  provider === 'anthropic' ? 'bg-primary/20' : ''
                }`}
              >
                <Icon className="" icon="bi:anthropic" width="1em" height="1em" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}