'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useChat } from 'ai/react';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { clientLogger } from '@/utils/logger';
import { useOrganization } from '@/context/OrganizationContext';
import React from 'react'; // Added explicit React import for the dynamic component
import { StreamedMessage } from './streamedMessage';
import { Message } from 'ai';

const exampleMessages = [
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
  {
    id: '3',
    role: 'assistant',
    content: `
      Sure! Here's a summary of your order:

  [[[
  {
    "jsxString": "<div className='card w-full max-w-lg bg-success text-success-content shadow-md p-6 mb-6'> \
      <h2 className='text-2xl font-bold mb-2'>Order Summary</h2> \
      <p className='text-base'>Product: Wireless Headphones</p> \
      <p className='text-base'>Price: $199.99</p> \
      <p className='text-base'>Shipping: Free</p> \
    </div>",
    "logic": {}
  }
  ]]]

  Now, please confirm your shipping address:

  [[[
  {
    "jsxString": "<div className='card w-full max-w-md bg-base-100 shadow-xl p-6'> \
      <h2 className='text-xl font-semibold mb-4'>Shipping Address</h2> \
      <input id='fullName' type='text' placeholder='Full Name' className='input input-bordered w-full mb-3' /> \
      <input id='address' type='text' placeholder='Street Address' className='input input-bordered w-full mb-3' /> \
      <input id='city' type='text' placeholder='City' className='input input-bordered w-full mb-3' /> \
      <button id='confirmShipping' className='btn btn-primary w-full'>Confirm Address</button> \
    </div>",
    "logic": {
      "states": {
        "fullName": "",
        "address": "",
        "city": ""
      },
      "actions": {
        "submitShipping": {
          "targetId": "confirmShipping",
          "collectFrom": ["fullName", "address", "city"],
          "actionType": "submitForm"
        }
      }
    }
  }
  ]]]

  Thank you! Once you confirm, we'll finalize your order.

      `,
  },
];

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
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: chatHandleSubmit,
    status,
    error,
  } = useChat({
    api: '/api/firestore', // Point to our new API endpoint
    body: {
      agents: agents,
    },
    initialMessages: exampleMessages as Message[],
    onResponse: response => {
      console.log('FirestoreChat: Received response from API', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
    },
    onFinish: message => {
      console.log('FirestoreChat: Message stream finished', {
        id: message.id,
        role: message.role,
        contentLength: message.content.length,
      });
    },
  });

  // Track loading state
  useEffect(() => {
    console.log('FirestoreChat: Status changed', { status });
    setIsLoading(status === 'streaming');
  }, [status]);

  // Scroll to bottom when messages change
  useEffect(() => {
    console.log('FirestoreChat: Messages updated', { count: messages.length });
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

    console.log('FirestoreChat: Submitting message', { input });
    try {
      showSuccessToast('Processing your request...');
      await handleSubmit(e);
    } catch (error) {
      clientLogger.error('FirestoreChat', 'Error submitting message', error);
      console.error('FirestoreChat: Error in onSubmit', error);
      setToastMessage('An error occurred while sending your message. Please try again.');
      setToastType('error');
      setShowToast(true);

      setTimeout(() => setShowToast(false), 5000);
    }
  };

  // Add a custom handleSubmit function to allow programmatic submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, customMessage?: string) => {
    e.preventDefault();
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    console.log('FirestoreChat: Handling submit', { messageToSend, isCustom: !!customMessage });

    // If using a custom message, we need to create a synthetic event to pass to the useChat hook
    if (customMessage) {
      const syntheticEvent = {
        preventDefault: () => {},
        target: {
          elements: {
            message: { value: messageToSend },
          },
        },
      } as unknown as React.FormEvent<HTMLFormElement>;

      chatHandleSubmit(syntheticEvent);
    } else {
      chatHandleSubmit(e);
    }
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
              <p className="text-base-content/50 text-center mb-6">
                Start a conversation about your Firestore database
              </p>

              <div className="collapse collapse-arrow w-full bg-base-200 mb-2">
                <input type="checkbox" />
                <div className="collapse-title font-medium flex items-center">
                  <Icon icon="carbon:information" className="w-5 h-5 mr-2 text-info" />
                  What can the Firestore Assistant do?
                </div>
                <div className="collapse-content">
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4 text-sm">
                      <p className="mb-2">The Firestore Assistant can help you:</p>
                      <ul className="list-disc pl-5 space-y-1 mb-3">
                        <li>Add, get, query, update, and delete documents</li>
                        <li>List available collections</li>
                        <li>Present data in a clean, readable format</li>
                        <li>Perform complex database operations</li>
                      </ul>
                      <p className="mb-2">When working with the database:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          The assistant will verify operations before performing destructive actions
                        </li>
                        <li>It will ask for clarification if a request is ambiguous</li>
                        <li>
                          For add/update operations, use the 'data' parameter to specify document
                          content
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card w-full bg-base-200">
                <div className="card-body p-4">
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <Icon icon="carbon:code" className="w-5 h-5 mr-2 text-secondary" />
                    Example Commands
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-base-300 rounded-md">
                      "List all collections in my database"
                    </div>
                    <div className="p-2 bg-base-300 rounded-md">
                      "Add a new document to the 'users' collection with name 'John' and age 30"
                    </div>
                    <div className="p-2 bg-base-300 rounded-md">
                      "Get all documents from 'products' collection where price 50"
                    </div>
                    <div className="p-2 bg-base-300 rounded-md">
                      "Update the document with ID 'abc123' in 'orders' collection to set status to
                      'shipped'"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message: any, index) => {
              console.log('FirestoreChat: Rendering message', {
                id: message.id,
                role: message.role,
                index,
                contentExcerpt:
                  message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
              });
              return (
                <StreamedMessage key={message.id} role={message.role} content={message.content} />
              );
            })
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
