'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { AIMessage } from '@/lib/ai/service';
import { availableModels, AIProvider } from '@/lib/ai/config';

interface ChatInterfaceProps {
  initialMessages?: AIMessage[];
  initialProvider?: AIProvider;
  initialModel?: string;
}

export default function ChatInterface({
  initialMessages = [],
  initialProvider = 'openai',
  initialModel = 'gpt-4o',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>(initialProvider);
  const [model, setModel] = useState(initialModel);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to the chat
    const userMessage: AIMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
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
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">AI Chat</h2>
        <div className="flex items-center gap-2">
          <select
            className="select select-bordered select-sm"
            value={provider}
            onChange={(e) => {
              const newProvider = e.target.value as AIProvider;
              setProvider(newProvider);
              setModel(availableModels[newProvider][0]);
            }}
            disabled={isLoading}
          >
            {Object.keys(availableModels).map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered select-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isLoading}
          >
            {provider && availableModels[provider]?.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            Start a conversation with the AI
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat ${
              message.role === 'user' ? 'chat-end' : 'chat-start'
            }`}
          >
            <div className="chat-header">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div
              className={`chat-bubble ${
                message.role === 'user'
                  ? 'chat-bubble-primary'
                  : 'chat-bubble-secondary'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat chat-start">
            <div className="chat-header">AI Assistant</div>
            <div className="chat-bubble chat-bubble-secondary">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-2 rounded bg-error text-error-content text-sm">
            Error: {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}