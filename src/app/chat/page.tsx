'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ai/ChatInterface';
import { useBreakpoint } from '@/hooks/use-screen';
import { useRouter } from 'next/navigation';
import ChatLayoutWrapper from '@/components/layout/ChatLayoutWrapper';
import PageParser from '@/components/pageParser/pageParser';
import { useWebsite } from '@/context/website-provider';
import { exampleTheme } from '@/components/pageParser/utils';
import { examplePage } from '@/types/mock';

export default function ChatPage() {
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useRouter();
  const { websites } = useWebsite();
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
      initialChatState={{
        isFullscreen: true,
        isMinimized: false,
        isPinned: true,
      }}
    >
      <div className="p-0 flex-1 overflow-hidden h-full">
        <PageParser />
      </div>
    </ChatLayoutWrapper>
  );
}
