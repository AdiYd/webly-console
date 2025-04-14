'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react'; // Import useChat hook
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { useAI, AIProvider } from '@/context/AIContext';

// File validation constants
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

interface ChatInterfaceProps {
  initialMessages?: any[];
}

interface Attachment {
  file: File;
  preview: string;
  type: 'image' | 'document';
}

const exampleChat = [
  {
    role: 'assistant',
    content: 'Hello! How can I assist you today?',
    id: '1',
  },
  {
    role: 'user',
    content: 'What can you do?',
    id: '2',
  },
  {
    role: 'assistant',
    content:
      'I can help with a variety of tasks, including answering questions, providing information, and assisting with learning.',
    id: '3',
  },
]; // We'll use the useChat hook's messages instead

export default function ChatInterface({ initialMessages = exampleChat }: ChatInterfaceProps) {
  const {
    provider,
    model,
    icon,
    temperature,
    systemPrompt,
    availableProviders,
    setProvider,
    setModel,
  } = useAI();

  // Use the useChat hook for message handling
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    status,
    error: chatError,
    append, // Access append method to add messages programmatically
  } = useChat({
    api: '/api/ai/chat', // Our existing API endpoint
    initialMessages: initialMessages,
    // Pass additional params needed for our API
    body: {
      provider,
      model,
      temperature,
      systemPrompt,
    },
    onResponse: response => {
      // Optional callback when response starts
      if (!response.ok) {
        console.error('Chat API response error:', response.statusText);
      }
    },
  });

  // Maintain local error state for UI consistency with existing implementation
  const [error, setError] = useState<string | null>(null);
  // Update local error state when chat hook reports an error
  useEffect(() => {
    if (chatError) {
      console.error('Chat error:', chatError);
      setError(chatError.message || 'An error occurred');
    } else {
      setError(null);
    }
  }, [chatError]);

  // Maintain attachments functionality
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const { data: session } = useSession();
  const userImage = session?.user?.image || 'https://i.pravatar.cc/150?img=3';
  const userName = session?.user?.name || 'User';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === 'submitted' || status === 'streaming';
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear file error after 5 seconds
  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => {
        setFileError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [fileError]);

  const validateFile = (file: File): { valid: boolean; reason?: string } => {
    // ...existing code...
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        reason: `File type not supported. Allowed types: Images (JPEG, PNG, GIF, WEBP), Documents (PDF, Word)`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        reason: `File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`,
      };
    }

    return { valid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    // ...existing code...
    if (!e.target.files?.length) return;

    const newFiles: Attachment[] = [];
    let hasError = false;

    Array.from(e.target.files).forEach(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setFileError(validation.reason || 'Invalid file');
        hasError = true;
        return;
      }

      const fileType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'document';
      const preview = fileType === 'image' ? URL.createObjectURL(file) : '';

      newFiles.push({
        file,
        preview,
        type: fileType,
      });
    });

    if (!hasError && newFiles.length > 0) {
      setAttachments(prev => [...prev, ...newFiles]);
    }

    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    // ...existing code...
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // ...existing code...
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    // ...existing code...
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.files?.length) return;

    const newFiles: Attachment[] = [];
    let hasError = false;

    Array.from(e.dataTransfer.files).forEach(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setFileError(validation.reason || 'Invalid file');
        hasError = true;
        return;
      }

      const fileType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'document';
      const preview = fileType === 'image' ? URL.createObjectURL(file) : '';

      newFiles.push({
        file,
        preview,
        type: fileType,
      });
    });

    if (!hasError && newFiles.length > 0) {
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    // ...existing code...
    setAttachments(prev => {
      const updated = [...prev];
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  // Format message content for display, preserving whitespace and line breaks
  const formatMessageContent = (content: string) => {
    // ...existing code...
    // Split the message by common code block markers
    const parts = content.split(/(```[\s\S]*?```|`[\s\S]*?`)/g);

    return parts.map((part, i) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.substring(3, part.length - 3);
        const language = code.split('\n')[0].trim();
        const codeContent = language ? code.substring(language.length).trim() : code;

        return (
          <pre key={i} className="bg-base-300 rounded-md p-3 overflow-x-auto text-sm my-2">
            {language && <div className="text-xs opacity-70 mb-1">{language}</div>}
            <code>{codeContent}</code>
          </pre>
        );
      }
      // Check if this part is an inline code snippet
      else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-base-300 px-1 rounded">
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

  // Custom submit handler that integrates attachments with useChat
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    // Handle attachments
    let messageContent = input;
    if (attachments.length > 0) {
      const fileInfo = attachments.map(a => `[${a.type}: ${a.file.name}]`).join(', ');
      messageContent = input
        ? `${input}\n\nAttached files: ${fileInfo}`
        : `Attached files: ${fileInfo}`;
    }

    // Use append instead of handleChatSubmit to add customized message content
    append({
      role: 'user',
      content: messageContent,
    });

    // Clear attachments after sending
    setAttachments([]);

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with model selection */}
      <div className="flex items-center justify-between p-3 border-transparent border-[1px] border-b-zinc-400/20 ">
        {/* 3 circles for Apple browser reference */}
        <div className="flex items-center gap-1 z-10">
          <div className="w-3 h-3 rounded-full bg-red-500* btn min-h-2 btn-xs btn-primary btn-circle "></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500* btn min-h-2 btn-xs btn-secondary btn-circle "></div>
          <div className="w-3 h-3 rounded-full bg-green-500* btn min-h-2 btn-xs btn-accent btn-circle"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Icon icon={icon} className="w-5 h-5" />
            <select
              className="select w-max select-sm select-bordered"
              value={provider}
              onChange={e => {
                const newProvider = e.target.value as AIProvider;
                setProvider(newProvider);
              }}
              disabled={isLoading}
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
            disabled={isLoading}
          >
            {provider &&
              availableProviders[provider]?.models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto max-h-[350px] p-4 md:px-6 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/60">
            <Icon icon="carbon:chat" className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Start a conversation with the AI</p>
            <p className="text-sm">
              Using {model} from {provider}. You can also attach files.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar online">
                <div className="w-8 rounded-full bg-base-300">
                  {message.role === 'user' ? (
                    <img
                      className="rounded-full"
                      src={userImage}
                      alt={userName || 'User profile'}
                    />
                  ) : (
                    <Icon icon={'carbon:bot'} className="w-6 h-6 m-2" />
                  )}
                </div>
              </div>
              <div className="chat-header mb-1">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div
                className={`chat-bubble ${
                  message.role === 'user'
                    ? 'chat-bubble-primary text-primary-content'
                    : 'chat-bubble-accent text-accent-content'
                }`}
              >
                {/* Handle different message formats (string or parts array) */}
                {message.parts ? (
                  message.parts.map((part: any, i: number) => {
                    if (part.type === 'text') {
                      return formatMessageContent(part.text);
                    }
                    return null;
                  })
                ) : message.content ? (
                  formatMessageContent(message.content)
                ) : isLoading && message.role === 'assistant' && index === messages.length - 1 ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : null}
              </div>
            </div>
          ))
        )}

        {error && !isLoading && (
          <div className="alert alert-error shadow-lg mt-2">
            <Icon icon="carbon:warning" className="w-6 h-6" />
            <span>Error: {error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              Close
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File error alert */}
      {fileError && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-error">
            <Icon icon="carbon:warning" className="w-5 h-5" />
            <span>{fileError}</span>
          </div>
        </div>
      )}

      {/* Attachments preview area */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-3 border-transparent border-[0.9px] border-t-zinc-400/20 ">
          {/* ...existing attachments preview code... */}
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === 'image' ? (
                <div className="w-10 h-10 rounded border* overflow-hidden">
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded border* flex items-center justify-center bg-base-200">
                  <Icon icon="carbon:document" className="w-10 h-10" />
                </div>
              )}
              <button
                className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 opacity-90 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAttachment(index)}
              >
                <Icon icon="carbon:close" className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleChatSubmit} className="p-4 max-sm:p-2 pt-0 ">
        <div
          className={`card flex flex-col rounded-xl border ${
            isDragging ? 'border-primary border-dashed' : 'border-base-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={e => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex justify-between items-center min-h-[60px] max-h-[200px] p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message or drop files here..."
              className="w-full resize-none bg-transparent focus:outline-none mr-2 overflow-y-auto"
              rows={1}
              disabled={isLoading}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // handleSubmit(e as any);
                  handleChatSubmit(e as any); // Call the original handleSubmit from useChat
                }
              }}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary btn-square"
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Icon icon="carbon:send" className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 pb-1 border-base-300">
            {/* ...existing file input buttons... */}
            <div className="flex gap-1 items-center">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={imageInputRef}
                onChange={e => handleFileChange(e, 'image')}
                className="hidden"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                multiple
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => handleFileChange(e, 'document')}
                className="hidden"
                accept={ALLOWED_DOC_TYPES.join(',')}
                multiple
              />

              {/* File upload buttons */}
              <button
                type="button"
                className="btn btn-xs btn-ghost btn-circle"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                title="Upload images (JPEG, PNG, GIF, WEBP)"
              >
                <Icon icon="carbon:image" className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="btn btn-xs btn-ghost btn-circle"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Upload documents (PDF, Word)"
              >
                <Icon icon="iconamoon:attachment-light" className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-base-content/60">
              Max file size for trial: {MAX_FILE_SIZE_MB}MB
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}