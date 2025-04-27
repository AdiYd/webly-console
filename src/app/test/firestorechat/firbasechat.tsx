'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { clientLogger } from '@/utils/logger';
import { useOrganization } from '@/context/OrganizationContext';

export default function FirestoreChat() {
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session data
  const { data: session } = useSession();
  const userImage = session?.user?.image || 'https://i.pravatar.cc/150?img=3';
  const userName = session?.user?.name || 'User';

  // State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const { agents } = useOrganization();

  // Initialize chat with the useChat hook
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    api: '/api/firestore', // Point to our new API endpoint
    body: {
      agents: agents,
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          'Hello! I can help you work with your Firestore database. You can ask me to add, get, query, update, or delete documents. How can I assist you today?',
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Feel free to ask about any specific operations you need help with!',
      },
    ],
  });

  // Track loading state
  useEffect(() => {
    setIsLoading(status === 'streaming');
  }, [status]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Display toast notifications for errors
  useEffect(() => {
    if (error) {
      setToastMessage(error.message);
      setToastType('error');
      setShowToast(true);

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Display success toast
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);

    setTimeout(() => setShowToast(false), 3000);
  };

  // Custom submit handler with feedback
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === '') return;

    try {
      showSuccessToast('Processing your request...');
      await handleSubmit(e);
    } catch (error) {
      clientLogger.error('FirestoreChat', 'Error submitting message', error);
      setToastMessage('An error occurred while sending your message. Please try again.');
      setToastType('error');
      setShowToast(true);

      setTimeout(() => setShowToast(false), 5000);
    }
  };

  /**
   * Formats message content with proper handling of JSON and code blocks
   */
  const formatMessageContent = (content: string) => {
    if (!content) return null;

    // First check for JSON blocks
    try {
      // Try to find JSON pattern in the message
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const jsonContent = jsonMatch[1];
        const jsonData = JSON.parse(jsonContent);

        // Replace the JSON code block with our formatted component
        const parts = content.split(/```json\n[\s\S]*?\n```/);

        return (
          <>
            {parts[0] && <p className="whitespace-pre-wrap mb-2">{parts[0]}</p>}
            <div className="card bg-base-300 p-3 mb-2 overflow-x-auto">
              <pre className="text-sm">
                <code>{JSON.stringify(jsonData, null, 2)}</code>
              </pre>
            </div>
            {parts[1] && <p className="whitespace-pre-wrap">{parts[1]}</p>}
          </>
        );
      }
    } catch (e) {
      // If JSON parsing fails, proceed with regular formatting
    }

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
          <pre key={i} className="card bg-base-300 p-3 overflow-x-auto text-sm my-2">
            {language && <div className="text-xs opacity-70 mb-1">{language}</div>}
            <code>{codeContent}</code>
          </pre>
        );
      }
      // Check if this part is an inline code snippet
      else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="card bg-base-300 px-1 rounded">
            {part.substring(1, part.length - 1)}
          </code>
        );
      }
      // Regular text content
      else if (part.trim()) {
        // Preserve line breaks in normal text
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      }
      return null;
    });
  };

  return (
    <div className="card bg-base-100 shadow-xl h-full flex flex-col">
      <div className="card-body p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            <Icon icon="carbon:data-base" className="w-6 h-6 mr-2" />
            Firestore Assistant
          </h2>
          <div className="badge badge-primary badge-outline">AI Tools</div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 p-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Icon icon="carbon:chat" className="w-16 h-16 text-base-content/30 mb-4" />
              <p className="text-base-content/50 text-center">
                Start a conversation about your Firestore database
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'} mb-4`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    {message.role === 'user' ? (
                      <img src={userImage} alt={userName} />
                    ) : (
                      <div className="bg-accent flex items-center justify-center h-full">
                        <Icon icon="carbon:data-base" className="w-6 h-6 text-accent-content" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="chat-header">
                  {message.role === 'user' ? userName : 'Firestore Assistant'}
                </div>
                <div
                  className={`chat-bubble ${
                    message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'
                  }`}
                >
                  {typeof message.content === 'string'
                    ? formatMessageContent(message.content)
                    : message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={onSubmit} className="mt-2">
          <div className="join w-full">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about your Firestore data..."
              className="input input-bordered join-item flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary join-item"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Icon icon="carbon:send" className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        {showToast && (
          <div className="toast toast-top toast-end z-50">
            <div className={`alert alert-${toastType}`}>
              <Icon
                icon={
                  toastType === 'error'
                    ? 'carbon:warning'
                    : toastType === 'success'
                    ? 'carbon:checkmark-filled'
                    : 'carbon:information'
                }
                className="w-5 h-5"
              />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
