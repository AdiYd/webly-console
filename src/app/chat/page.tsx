'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ai/ChatInterface';
import { useBreakpoint } from '@/hooks/use-screen';
import { useRouter } from 'next/navigation';
import ChatLayoutWrapper from '@/components/layout/ChatLayoutWrapper';

export default function ChatPage() {
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useRouter();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="p-4 flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="card p-8 shadow-lg">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <ChatLayoutWrapper
      chatComponent={<ChatInterface />}
      mainContent={
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Welcome to Webly AI Chat</h1>
          <p className="text-base-content/70">
            Use the chat interface to interact with AI. You can resize, move, minimize, and toggle
            fullscreen mode.
          </p>
        </div>
      }
      initialChatState={{
        isFullscreen: true,
        isMinimized: false,
        isPinned: true,
      }}
    />
  );
}
