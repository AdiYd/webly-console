'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { AIMessage } from '@/lib/ai/service';
import { availableModels, AIProvider } from '@/lib/ai/config';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';

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
  initialMessages?: AIMessage[];
  initialProvider?: AIProvider;
  initialModel?: string;
}

interface Attachment {
  file: File;
  preview: string;
  type: 'image' | 'document';
}

const exampleChat: AIMessage[] = [
  {
    role: 'user',
    content: 'What is the capital of France?',
  },
  {
    role: 'assistant',
    content: 'The capital of France is Paris.',
  },
  {
    role: 'user',
    content: 'Can you show me a picture of the Eiffel Tower?',
  },
  {
    role: 'assistant',
    content: 'Sure! Here is a picture of the Eiffel Tower.',
  },
];

export default function ChatInterface({
  initialMessages = exampleChat,
  initialProvider = 'openai',
  initialModel = 'gpt-4o',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>(initialProvider);
  const [model, setModel] = useState(initialModel);
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

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

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
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
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
    setAttachments(prev => {
      const updated = [...prev];
      // Release object URL to prevent memory leaks
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  // Format message content for display, preserving whitespace and line breaks
  const formatMessageContent = (content: string) => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    // TODO: In a real implementation, handle file uploads here
    // For now, we'll just mention the attachments in the message
    let messageContent = input;
    if (attachments.length > 0) {
      const fileInfo = attachments.map(a => `[${a.type}: ${a.file.name}]`).join(', ');
      messageContent = input
        ? `${input}\n\nAttached files: ${fileInfo}`
        : `Attached files: ${fileInfo}`;
    }

    // Add user message to the chat
    const userMessage: AIMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setError(null);
    setIsLoading(true);

    try {
      // Make API request to our AI endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          provider,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a response');
      }

      const data = await response.json();

      // Add AI response to the chat
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: data.text,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center gap-2">
          <select
            className="select select-sm select-bordered"
            value={provider}
            onChange={e => {
              const newProvider = e.target.value as AIProvider;
              setProvider(newProvider);
              setModel(availableModels[newProvider][0]);
            }}
            disabled={isLoading}
          >
            {Object.keys(availableModels).map(p => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="select select-sm select-bordered"
            value={model}
            onChange={e => setModel(e.target.value)}
            disabled={isLoading}
          >
            {provider &&
              availableModels[provider]?.map(m => (
                <option key={m} value={m}>
                  {m}
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
            <p className="text-sm">You can also attach files or images</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar online">
                <div className="w-10 rounded-full bg-base-300">
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
                  message.role === 'user' ? 'chat-bubble-primary' : 'bg-base-200 text-base-content'
                }`}
              >
                {formatMessageContent(message.content)}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full bg-base-300">
                <Icon icon="carbon:bot" className="w-6 h-6 m-2" />
              </div>
            </div>
            <div className="chat-header mb-1">AI Assistant</div>
            <div className="chat-bubble bg-base-200">
              <span className="loading loading-dots"></span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg">
            <Icon icon="carbon:warning" className="w-6 h-6" />
            <span>Error: {error}</span>
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
        <div className="px-4 py-2 flex flex-wrap gap-2 border-transparent border-[0.9px] border-t-zinc-400/20 ">
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
                  <Icon icon="carbon:document" className="w-8 h-8" />
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
      <form onSubmit={handleSubmit} className="p-4 max-sm:p-2 pt-0 ">
        <div
          className={`card flex flex-col rounded-xl border ${
            isDragging ? 'border-primary border-dashed' : 'border-base-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={e => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex justify-between min-h-[60px] max-h-[200px] p-3 overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message or drop files here..."
              className="w-full resize-none bg-transparent focus:outline-none"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Icon icon="carbon:send" className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between px-3 py-2* ">
            <div className="flex gap-2 items-center">
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
                className="btn btn-sm btn-ghost btn-circle"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                title="Upload images (JPEG, PNG, GIF, WEBP)"
              >
                <Icon icon="carbon:image" className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost btn-circle"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Upload documents (PDF, Word)"
              >
                <Icon icon="iconamoon:attachment-light" className="w-5 h-5" />
              </button>
              <span className="text-xs text-base-content/60">
                Max file size for trial: {MAX_FILE_SIZE_MB}MB
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}