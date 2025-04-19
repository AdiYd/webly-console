'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { useAI, AIProvider } from '@/context/AIContext';
import { useOrganization } from '@/context/OrganizationContext';

// File handling constants
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

// Type definitions
interface ChatInterfaceProps {
  initialMessages?: any[];
  isMinimized?: boolean;
}

interface Attachment {
  /**
   * The name of the attachment, usually the file name.
   */
  name?: string;
  /**
   * A string indicating the [media type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type).
   * By default, it's extracted from the pathname's extension.
   */
  contentType?: string;
  /**
   * The URL of the attachment. It can either be a URL to a hosted file or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs).
   */
  url: string;
  /**
   * Metadata about the attachment, such as size and type.
   */
  _metadata?: {
    /**
     * The size of the attachment in bytes.
     */
    size?: number;
    /**
     * The type of the attachment (e.g., image, document).
     */
    type?: string;
    /**
     * The actual file object if it's a local file.
     */
    localFile?: File;
  };
}

// Example chat data for initial state
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
  {
    role: 'user',
    content: 'Can you show me an example?',
    id: '4',
  },
  {
    role: 'assistant',
    content:
      'Sure! I can provide examples of code, explanations, or even help with specific topics. Just let me know what you need!',
    id: '5',
  },
  {
    role: 'user',
    content: "Great! Let's start with a coding question.",
    id: '6',
  },
  {
    role: 'assistant',
    content: "Sounds good! Please provide your coding question, and I'll do my best to assist you.",
    id: '7',
  },
  {
    role: 'user',
    content: 'Can you explain how to use React hooks?',
    id: '8',
  },
  {
    role: 'assistant',
    content:
      'React hooks are functions that let you use state and other React features without writing a class. Some common hooks include useState, useEffect, and useContext. Would you like to see an example?',
    id: '9',
  },
  {
    role: 'user',
    content: 'Yes, please!',
    id: '10',
  },
  {
    role: 'assistant',
    content:
      "Here is a simple example using the useState hook:\n\n```javascript\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>Click me</button>\n    </div>\n  );\n}\n```\n\nThis code creates a button that increments the count each time it is clicked.",
    id: '11',
  },
];

export default function ChatInterface({
  initialMessages = exampleChat,
  isMinimized = false,
}: ChatInterfaceProps) {
  // UI state management
  const [error, setError] = useState<string | null>(null);
  const [update, setUpdate] = useState(false); // State to trigger re-render
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Context and session data
  const {
    provider,
    model,
    icon,
    temperature,
    organizationPrompt,
    availableProviders,
    agents,
    isAuth,
    setProvider,
    setModel,
  } = useOrganization();
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
    append,
  } = useChat({
    api: '/api/ai/chat',
    initialMessages: initialMessages,
    body: {
      provider,
      model,
      temperature,
      systemPrompt: organizationPrompt || '',
      agents,
    },
    onResponse: async response => {},
    onError: async error => {},
  });
  console.log('Chat messages:', messages);
  console.log('Chat status:', status);
  // Track loading state
  const isLoading = status === 'submitted' || status === 'streaming';
  useEffect(() => {
    if (['ready', 'error'].includes(status) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [status]);

  // Effect: Update when isMinimized changes
  useEffect(() => {
    setUpdate(prev => !prev);
  }, [isMinimized]);

  // Effect: Handle chat errors
  useEffect(() => {
    if (chatError) {
      console.log('Chat error:', chatError.message);
      setError(JSON.parse(chatError.message).error || 'An error occurred');
    } else {
      setError(null);
    }
  }, [chatError]);

  // Effect: Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effect: Clear file error after timeout
  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => {
        setFileError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [fileError]);

  /**
   * Validates a file against size and type restrictions
   */
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

  /**
   * Processes files and adds valid ones to attachments
   */
  /**
   * Processes files and adds valid ones to attachments
   */
  const processFiles = async (files: FileList | File[]): Promise<void> => {
    const newFiles: Attachment[] = [];
    let hasError = false;
    let totalSize = 0;

    for (const file of Array.from(files)) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setFileError(validation.reason || 'Invalid file');
        hasError = true;
        continue;
      }

      totalSize += file.size;
      if (totalSize > MAX_FILE_SIZE_BYTES) {
        setFileError(`Combined file size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        hasError = true;
        continue;
      }

      const fileType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'document';

      try {
        // Create attachment in the format expected by Vercel AI SDK
        const attachment: Attachment = {
          name: file.name,
          contentType: file.type,
          url: await createDataUrl(file),
          _metadata: {
            type: fileType,
            size: file.size,
            localFile: file,
          },
        };

        newFiles.push(attachment);
      } catch (error) {
        console.error('Error processing file:', error);
        setFileError('Error preparing file. Please try again.');
        hasError = true;
      }
    }

    if (!hasError && newFiles.length > 0) {
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  /**
   * Creates a data URL from a file
   */
  const createDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result); // Return the full data URL
        } else {
          reject(new Error('Failed to convert file to data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handles file selection from input elements
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    if (!e.target.files?.length) return;
    processFiles(e.target.files);
    e.target.value = '';
  };

  /**
   * Drag and drop handlers
   */
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
    processFiles(e.dataTransfer.files);
  };

  /**
   * Removes an attachment from the list
   */
  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  /**
   * Formats message content with proper handling of code blocks
   */
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
          <pre
            key={i}
            className="text-neutral-content card !bg-zinc-800 p-3 overflow-x-auto text-sm my-2"
          >
            {language && <div className="text-xs opacity-70 mb-1">$ {language}</div>}
            <code>{codeContent}</code>
          </pre>
        );
      }
      // Check if this part is an inline code snippet
      else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="text-neutral-content card !bg-zinc-800 px-1 rounded">
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
   * Custom submit handler that integrates attachments with useChat
   */
  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();

  //   if ((!input.trim() && attachments.length === 0) || isLoading) return;

  //   // Create array to hold attachment promises
  //   const attachmentPromises = attachments.map(async attachment => {
  //     // Read file as base64
  //     const base64 = await readFileAsBase64(attachment.file);

  //     return {
  //       name: attachment.file.name,
  //       type: attachment.file.type,
  //       size: attachment.file.size,
  //       attachmentType: attachment.type,
  //       content: base64, // Include the actual file content as base64
  //     };
  //   });

  //   // Wait for all file reading operations to complete
  //   const attachmentData =
  //     attachments.length > 0 ? await Promise.all(attachmentPromises) : undefined;

  //   // Show a toast notification if files are being processed
  //   if (attachments.length > 0) {
  //     // You can use any toast library here or daisyUI's toast component
  //     const toastElement = document.createElement('div');
  //     toastElement.innerHTML = `
  //     <div class="toast toast-top toast-end z-50">
  //       <div class="alert alert-info">
  //         <Icon icon="carbon:cloud-upload" class="" />
  //         <span>Processing ${attachments.length} file(s)...</span>
  //       </div>
  //     </div>
  //   `;
  //     document.body.appendChild(toastElement);
  //     setTimeout(() => toastElement.remove(), 3000);
  //   }

  //   // Use append to send the message with text and attachment data
  //   await append({
  //     role: 'user',
  //     content: input,
  //     data: {
  //       attachments: attachmentData,
  //     },
  //   });

  //   // Clear attachments state
  //   setAttachments([]);

  //   // Focus back on textarea
  //   textareaRef.current?.focus();
  // };

  /**
   * Renders a message bubble based on role and content
   */
  const renderMessageOld = (message: any, index: number) => {
    const isUserMessage = message.role === 'user';
    const isFirstMessage = index === 0;

    return (
      <div
        key={message.id || index}
        className={`chat ${isFirstMessage ? 'mt-6' : ''} ${
          isUserMessage ? 'chat-end' : 'chat-start'
        }`}
      >
        {!isMinimized && (
          <>
            <div className="chat-image avatar online">
              <div className="w-8 rounded-full bg-base-300">
                {isUserMessage ? (
                  <img className="rounded-full" src={userImage} alt={userName || 'User profile'} />
                ) : (
                  <Icon icon={'carbon:bot'} className="w-6 h-6 m-2" />
                )}
              </div>
            </div>
            <div className="chat-header mb-1">{isUserMessage ? 'You' : 'AI Agent'}</div>
          </>
        )}
        <div
          className={`${
            isUserMessage
              ? 'chat-bubble-primary text-primary-content chat-bubble'
              : `${isMinimized ? 'text-base-content/90' : 'chat-bubble chat-bubble-accent'}`
          }`}
        >
          {renderMessageContent(message, index, isLoading)}
        </div>
      </div>
    );
  };

  const renderMessage = (message: any, index: number) => {
    const isUserMessage = message.role === 'user';
    const isFirstMessage = index === 0;
    const messageAttachments = message.data?.attachments;

    return (
      <div
        key={message.id || index}
        className={`chat ${isFirstMessage ? 'mt-6' : ''} ${
          isUserMessage ? 'chat-end' : 'chat-start'
        }`}
      >
        {!isMinimized && (
          <>
            <div className="chat-image avatar online">
              <div className="w-8 rounded-full bg-base-300">
                {isUserMessage ? (
                  <img className="rounded-full" src={userImage} alt={userName || 'User profile'} />
                ) : (
                  <Icon icon={'carbon:bot'} className="w-6 h-6 m-2" />
                )}
              </div>
            </div>
            <div className="chat-header mb-1">{isUserMessage ? 'You' : 'AI Agent'}</div>
          </>
        )}
        <div
          className={`${
            isUserMessage
              ? 'chat-bubble-primary text-primary-content chat-bubble'
              : `${isMinimized ? 'text-base-content/90' : 'chat-bubble chat-bubble-accent'}`
          }`}
        >
          {/* Render attachments if they exist */}
          {messageAttachments && messageAttachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {messageAttachments.map((att: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1">
                  {att.attachmentType === 'image' && att.content ? (
                    <div className="relative group">
                      <img
                        src={`data:${att.type};base64,${att.content}`}
                        alt={att.name}
                        className="w-16 h-16 object-cover rounded border border-base-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-base-300/80 text-xs p-1 truncate">
                        {att.name.length > 10 ? `${att.name.substring(0, 8)}...` : att.name}
                      </div>
                    </div>
                  ) : (
                    <div className="badge badge-outline gap-1 items-center">
                      <Icon
                        icon={att.attachmentType === 'image' ? 'carbon:image' : 'carbon:document'}
                        className="w-3 h-3"
                      />
                      <span className="text-xs">
                        {att.name.length > 15 ? `${att.name.substring(0, 12)}...` : att.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Render the main message content */}
          {renderMessageContent(message, index, isLoading)}
        </div>
      </div>
    );
  };

  /**
   * Renders message content based on its format (text, parts, or loading)
   */
  const renderMessageContent = (message: any, index: number, isLoading: boolean) => {
    // Message is still loading
    if (isLoading && message.role === 'assistant' && index === messages.length - 1) {
      return <span className="loading loading-dots loading-sm"></span>;
    }

    // Message has parts (for complex messages)
    if (message.parts) {
      return message.parts.map((part: any, i: number) => {
        if (part.type === 'text') {
          return formatMessageContent(part.text);
        }
        return null;
      });
    }

    // Regular text content
    if (message.content) {
      return formatMessageContent(message.content);
    }

    return null;
  };

  /**
   * Renders the empty state when no messages exist
   */
  const renderEmptyState = () => (
    <div className="flex flex-col pt-12 items-center justify-center text-base-content/60">
      <Icon icon="carbon:chat" className="w-16 h-16 mb-4" />
      <p className="text-lg font-medium">Start a conversation with the AI</p>
      <p className="text-sm">
        Using {model} from {provider}. You can also attach files.
      </p>
    </div>
  );

  /**
   * Renders file upload controls
   */
  const renderFileControls = () => (
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
  );

  /**
   * Renders the model selector UI
   */
  const renderModelSelector = () => (
    <div className="absolute gap-4 w-full z-30 backdrop-blur-lg flex items-center overflow-x-auto justify-between py-1 px-3 border-transparent border-[1px] border-b-zinc-400/20">
      {/* 3 circles for Apple browser reference */}
      <div className="flex items-center gap-1 z-10">
        <div className="w-3 h-3 rounded-full bg-red-500* btn min-h-2 btn-xs btn-primary btn-circle"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500* btn min-h-2 btn-xs btn-secondary btn-circle"></div>
        <div className="w-3 h-3 rounded-full bg-green-500* btn min-h-2 btn-xs btn-accent btn-circle"></div>
      </div>
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
  );

  return (
    <div className="flex flex-col justify-between h-full w-full">
      {/* Messages area */}
      <div
        className={`flex-1 mt-0 overflow-y-auto max-h-[fill-available] p-4 md:px-6 ${
          isMinimized ? '!px-3' : ''
        } space-y-2`}
      >
        {messages.length === 0
          ? renderEmptyState()
          : messages.map((message, index) => renderMessage(message, index))}

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
        <div className="px-4 py-2 flex flex-wrap gap-3 border-t border-base-300/20">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment._metadata?.type === 'image' ? (
                <div className="w-10 h-10 rounded overflow-hidden border border-base-200">
                  <img
                    src={attachment.url}
                    alt={attachment.name || 'Image attachment'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded flex items-center justify-center bg-base-200 border border-base-300">
                  <Icon icon="carbon:document" className="w-6 h-6 text-base-content/70" />
                </div>
              )}
              <button
                className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2 opacity-90 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAttachment(index)}
                aria-label="Remove attachment"
              >
                <Icon icon="carbon:close" className="" />
              </button>
              <div className="absolute -bottom-1 -right-1 text-xs bg-base-300/20 px-1 rounded">
                {formatFileSize(attachment._metadata?.size || 0)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={e => handleChatSubmit(e, { experimental_attachments: attachments })}
        className={`${isMinimized ? 'p-2' : 'p-4'} max-sm:p-2 pt-0 `}
      >
        <div
          className={`card hover:!border-base-content/50 border-[0.9px] !bg-base-200 flex flex-col rounded-xl ${
            isDragging ? 'border-primary border-dashed' : 'border-base-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={e => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="flex justify-between items-center min-h-[60px] max-h-[200px] p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message or drop files here..."
              className="w-full resize-none bg-transparent focus:outline-none mr-2 overflow-y-auto"
              maxLength={2000}
              disabled={isLoading}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSubmit(e as any);
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
            {renderFileControls()}
            <span className="text-xs text-base-content/60">
              Max size for trial: {MAX_FILE_SIZE_MB}MB, ({2000 - input.length} chars left)
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Get only the base64 part (remove prefix like "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};