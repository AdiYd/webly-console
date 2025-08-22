'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

export function ChatInterface() {
  const { state, actions } = useEditor();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm your AI assistant. I can help you edit your website, suggest improvements, or answer questions about web design. What would you like to work on?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickActions = [
    {
      label: 'Improve hero section',
      icon: 'mdi:rocket',
      action: () => setInputValue('Can you help me improve the hero section of my website?'),
    },
    {
      label: 'Change color scheme',
      icon: 'mdi:palette',
      action: () => setInputValue('I want to change the color scheme of my website'),
    },
    {
      label: 'Add new section',
      icon: 'mdi:plus-box',
      action: () => setInputValue('How can I add a new section to my page?'),
    },
    {
      label: 'Optimize for mobile',
      icon: 'mdi:cellphone',
      action: () => setInputValue('Help me optimize my website for mobile devices'),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-base-100/20 backdrop-blur-lg">
      {/* Header */}
      <div className="p-4 border-b border-zinc-400/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon icon="mdi:robot" className="text-primary-content text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">AI Assistant</h3>
              <p className="text-xs text-base-content/60">{isTyping ? 'Typing...' : 'Online'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="btn btn-ghost btn-sm btn-circle"
              title="Clear chat"
            >
              <Icon icon="mdi:broom" className="text-lg" />
            </button>
            <button
              onClick={() => actions.setChatVisible(false)}
              className="btn btn-ghost btn-sm btn-circle"
              title="Close chat"
            >
              <Icon icon="mdi:close" className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                  <div
                    className={`chat-bubble ${
                      message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'
                    } text-sm`}
                  >
                    {message.content}
                  </div>
                  <div className="chat-footer opacity-50 text-xs">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-secondary">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-base-300">
          <p className="text-xs text-base-content/60 mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="badge badge-sm justify-center h-fit text-left gap-2"
              >
                <Icon icon={action.icon} className="text-base" />
                <span className="text-xs truncate text-wrap">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-base-300">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your website..."
              className="textarea textarea-bordered w-full resize-none text-sm"
              rows={2}
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="btn btn-primary btn-square btn-sm"
          >
            <Icon icon="mdi:send" className="text-sm" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-base-content/60">
            Press Enter to send, Shift+Enter for new line
          </p>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                state.hasUnsavedChanges ? 'bg-warning' : 'bg-success'
              }`}
            ></div>
            <span className="text-xs text-base-content/60">
              {state.hasUnsavedChanges ? 'Unsaved' : 'Saved'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple AI response generator (replace with actual AI integration)
function generateAIResponse(userInput: string): string {
  const input = userInput.toLowerCase();

  if (input.includes('hero') || input.includes('header')) {
    return 'I can help you improve your hero section! Here are some suggestions:\n\n1. Make your headline more compelling\n2. Add a clear call-to-action\n3. Use high-quality images\n4. Include social proof or testimonials\n\nWould you like me to help you implement any of these changes?';
  }

  if (input.includes('color') || input.includes('theme')) {
    return "Great choice! I can help you update your color scheme. I notice you're using a green and blue theme. Would you like to:\n\n1. Try a different color palette\n2. Adjust the current colors\n3. Switch to dark mode\n4. Create a custom brand palette\n\nWhat style are you going for?";
  }

  if (input.includes('section') || input.includes('add')) {
    return 'I can help you add new sections! Here are some popular options:\n\n• Testimonials section\n• Features showcase\n• About us section\n• Contact form\n• Pricing table\n• Portfolio gallery\n\nWhich type of section would work best for your website?';
  }

  if (input.includes('mobile') || input.includes('responsive')) {
    return 'Mobile optimization is crucial! I can help you:\n\n1. Check responsive breakpoints\n2. Optimize images for mobile\n3. Improve touch interactions\n4. Enhance mobile navigation\n5. Test loading speeds\n\nLet me analyze your current mobile experience and suggest improvements.';
  }

  return "I understand you'd like help with your website. I can assist with:\n\n• Content editing and improvement\n• Design and layout changes\n• Color scheme adjustments\n• Adding new sections\n• Mobile optimization\n• SEO improvements\n\nWhat specific aspect would you like to work on first?";
}
