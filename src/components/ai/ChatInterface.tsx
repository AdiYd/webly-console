'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { useOrganization } from '@/context/OrganizationContext';
import { clientLogger } from '@/utils/logger';
import { StreamedMessage } from './streamedMessage';

// File handling constants
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES: string[] = [
  // 'application/pdf',
];
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES];

// Type definitions
interface ChatInterfaceProps {
  initialMessages?: any[];
  isMinimized?: boolean;
}

// Attachment interface - must match server expectations
interface Attachment {
  type: string;
  name?: string;
  contentType?: string;
  url?: string;
  image?: string;
  _metadata?: {
    type: string;
    size: number;
  };
}

// Example chat data for initial state
const exampleChat = [
  {
    role: 'assistant',
    content: 'Hello! How can I assist you today?',
    id: '1',
  },
  // ... other example messages can be shortened to save space
];

export default function ChatInterface({
  initialMessages = exampleChat,
  isMinimized = false,
}: ChatInterfaceProps) {
  // UI state management
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Context and session data
  const { provider, model, icon, temperature, organizationPrompt, agents } = useOrganization();
  const { data: session } = useSession();

  // User information
  const userImage = session?.user?.image || 'https://i.pravatar.cc/150?img=3';
  const userName = session?.user?.name || 'User';

  // Initialize chat with the useChat hook - simplified for cleaner streaming
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    status,
    error: chatError,
  } = useChat({
    api: '/api/ai/chat',
    initialMessages: initialMessages,
    body: {
      provider,
      model,
      temperature,
      systemPrompt: organizationPrompt || '',
      agents,
      attachments: pendingAttachments,
    },
    onResponse: async response => {
      // Clear pending attachments after a successful response
      setPendingAttachments([]);
    },
    onError: async error => {
      clientLogger.error('ChatInterface', 'Chat error', error);
    },
  });

  // Track loading state but only for the input area, not for message rendering
  const isLoading = status === 'submitted' || status === 'streaming';
  // Effect: Focus on input when ready
  useEffect(() => {
    if (['ready', 'error'].includes(status) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [status]);

  // useEffect(() => {
  //   reload().then((res: any) => {
  //     clientLogger.info('Reloaded chat history', res);
  //   });
  // }, [reload]);

  // Effect: Handle chat errors
  useEffect(() => {
    if (chatError) {
      clientLogger.error('ChatInterface', 'Chat error from hook', chatError);
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
        reason: `File too large. Maximum size: ${MAX_FILE_SIZE_MB}`,
      };
    }

    return { valid: true };
  };

  /**
   * Processes files and adds valid ones to attachments
   */
  const processFiles = async (files: FileList | File[]): Promise<void> => {
    clientLogger.debug('ChatInterface', 'Processing files', { count: files.length });
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
      clientLogger.debug('ChatInterface', 'File validated', {
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        mapped_type: fileType,
      });

      try {
        // Create data URL from file
        const dataUrl = await createDataUrl(file);
        clientLogger.debug('ChatInterface', 'Data URL created', {
          name: file.name,
          preview: dataUrl.substring(0, 50) + '...',
        });

        // Create attachment in the format expected by Vercel AI SDK
        const attachment: Attachment = {
          type: fileType, // 'image' or 'document'
          name: file.name,
          contentType: file.type,
          url: dataUrl,
          image: fileType === 'image' ? dataUrl : undefined, // Only set image URL for image types
          _metadata: {
            type: fileType,
            size: file.size,
          },
        };

        // Validate the attachment object
        if (fileType === 'image' && !attachment.image) {
          clientLogger.error('ChatInterface', 'Image attachment missing image URL', {
            name: file.name,
          });
        }

        clientLogger.debug('ChatInterface', 'Created attachment', {
          name: attachment.name,
          type: attachment.type,
          size: attachment._metadata?.size,
          hasImageProp: !!attachment.image,
        });

        newFiles.push(attachment);
      } catch (error) {
        clientLogger.error('ChatInterface', 'Error processing file', error);
        setFileError('Error preparing file. Please try again.');
        hasError = true;
      }
    }

    if (!hasError && newFiles.length > 0) {
      setAttachments(prev => [...prev, ...newFiles]);
      clientLogger.info('ChatInterface', 'Added attachments', { count: newFiles.length });
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
    clientLogger.debug('ChatInterface', `Handling ${type} file selection`, {
      count: e.target.files.length,
    });
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
    clientLogger.debug('ChatInterface', 'Files dropped', { count: e.dataTransfer.files.length });
    processFiles(e.dataTransfer.files);
  };

  /**
   * Removes an attachment from the list
   */
  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev];
      const removed = updated.splice(index, 1);
      clientLogger.debug('ChatInterface', 'Removed attachment', { name: removed[0]?.name });
      return updated;
    });
  };

  /**
   * Custom submit handler for sending messages with attachments
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    try {
      // Show loading toast if attachments exist
      if (attachments.length > 0) {
        showAttachmentToast(attachments.length);
        setPendingAttachments(attachments);
      }

      // Use the built-in submit handler which will send the message
      handleChatSubmit(e);

      // Clear attachments after sending
      setAttachments([]);
    } catch (error) {
      clientLogger.error('ChatInterface', 'Error sending message', error);
      setError('Failed to send message. Please try again.');
    }
  };

  /**
   * Shows a toast notification for processing attachments
   */
  const showAttachmentToast = (count: number) => {
    const toastElement = document.createElement('div');
    toastElement.innerHTML = `
      <div class="toast toast-top toast-end z-50">
        <div class="alert alert-info">
          <Icon icon="carbon:cloud-upload" class="w-5 h-5" />
          <span>Processing ${count} file(s)...</span>
        </div>
      </div>
    `;
    document.body.appendChild(toastElement);
    setTimeout(() => toastElement.remove(), 3000);
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
   * Simplified message rendering - no special handling for streaming
   * Let the useChat hook handle streaming updates naturally
   */
  const renderMessage = (message: any, index: number) => {
    const isUserMessage = message.role === 'user';
    const isFirstMessage = index === 0;

    return (
      <div
        key={message.id || index}
        className={`chat ${isFirstMessage ? 'mt-12' : ''} ${
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
          {typeof message.content === 'string' ? formatMessageContent(message.content) : null}
        </div>
      </div>
    );
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
      {/* <input
        type="file"
        ref={fileInputRef}
        onChange={e => handleFileChange(e, 'document')}
        className="hidden"
        accept={ALLOWED_DOC_TYPES.join(',')}
        multiple
      /> */}

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
      {/* <button
        type="button"
        className="btn btn-xs btn-ghost btn-circle"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        title="Upload documents (PDF, Word)"
      >
        <Icon icon="iconamoon:attachment-light" className="w-4 h-4" />
      </button> */}
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
          : messages.map((message: any, index) => {
              // --- MODIFIED CONTENT EXTRACTION ---
              // Handle both string content and the AI SDK's array format
              let messageContent = '';
              if (typeof message.content === 'string') {
                messageContent = message.content;
              } else if (Array.isArray(message.content)) {
                // Find all text parts in the array and join them
                messageContent = message.content
                  .filter((part: any) => part.type === 'text')
                  .map((part: any) => part.text)
                  .join('\n');
              } else if (typeof message === 'string') {
                // Handle cases where the message itself might just be a string
                messageContent = message;
              }
              // --- END MODIFIED CONTENT EXTRACTION ---

              // --- DEBUG LOGGING ---
              clientLogger.debug('ChatInterface: Preparing to render StreamedMessage', 'data', {
                messageId: message.id || `msg-${index}`,
                role: message.role,
                contentLength: messageContent?.length || 0,
                isStreaming: status === 'streaming',
                messageIndex: index,
                isLastMessage: index === messages.length - 1,
              });
              // --- END DEBUG LOGGING ---

              // Ensure role is valid before passing
              const validRole =
                message.role === 'user' || message.role === 'assistant'
                  ? message.role
                  : 'assistant'; // Default to assistant if role is invalid/missing

              return (
                // Use message.id for the key if available, otherwise index
                <div
                  style={{ marginTop: index === 0 ? '3rem' : '0' }}
                  key={message.id || `msg-${index}`}
                >
                  {/* Pass the extracted string content */}
                  <StreamedMessage
                    key={message.id || `streamed-${index}`}
                    role={validRole} // Pass the validated role
                    content={messageContent || ''} // Ensure content is always a string, even if empty
                  />
                </div>
              );
            })}

        {error && !isLoading && (
          <div className="alert alert-error shadow-lg mt-2">
            <Icon icon="carbon:warning" className="w-6 h-6" />
            <span>Error: {error}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
              <Icon icon="carbon:close" className="w-4 h-4 mr-2*" />
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
            <button className="btn btn-sm btn-ghost" onClick={() => setFileError(null)}>
              <Icon icon="carbon:close" className="w-4 h-4 mx-2" />
              Close
            </button>
          </div>
        </div>
      )}

      {/* Attachments preview area */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-3 border-t border-base-300/20">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === 'image' ? (
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
        onSubmit={handleSubmit}
        className={`${isMinimized ? 'p-2' : 'p-4'} max-sm:p-2 pt-0 max-w-[1200px] w-full mx-auto `}
      >
        <div
          className={`card hover:!border-base-content/50 border-[0.9px] !bg-base-300 flex flex-col my-4 mx-2 max-sm:m-0 rounded-xl ${
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
                  handleSubmit(e as any);
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

/**
 * Formats a file size from bytes to a human-readable string
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};