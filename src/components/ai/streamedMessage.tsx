'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveStreamParser } from '@/hooks/use-parser';
import { ComponentRenderer } from './componentRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { useOrganization } from '@/context/OrganizationContext';
import { clientLogger } from '@/utils/logger';

interface StreamedMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function StreamedMessage({ content, role }: StreamedMessageProps) {
  const { chunks, processToken, finalize, reset } = useLiveStreamParser();
  const previousContentRef = useRef<string>('');
  const processingRef = useRef(false);
  const { data: session } = useSession();
  const { currentOrganization } = useOrganization();
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingStarted, setProcessingStarted] = useState(false);

  clientLogger.debug('StreamedMessage: Rendering with', 'data', {
    contentLength: content?.length || 0,
    role,
    chunksCount: chunks.length,
    previousContentLength: previousContentRef.current?.length || 0,
    isNewContent: content !== previousContentRef.current,
  });

  // Process only NEW content as it arrives
  useEffect(() => {
    // Skip empty content
    if (!content) {
      return;
    }

    // If this is our first time seeing content
    if (!processingStarted) {
      clientLogger.debug('StreamedMessage: First content received - resetting parser', '', '');
      setProcessingStarted(true);
      reset(); // Reset parser for fresh start
    }

    // Determine if we have new content to process
    if (content === previousContentRef.current) {
      clientLogger.debug('StreamedMessage: No new content to process', '', '');
      return; // No new content
    }

    // Only process the NEW part of the content
    const newPortion = content.slice(previousContentRef.current.length);
    if (newPortion.length > 0) {
      clientLogger.debug('StreamedMessage: Processing new content portion', 'data', {
        newPortionLength: newPortion.length,
        newPortionPreview: newPortion.slice(0, 30) + (newPortion.length > 30 ? '...' : ''),
      });

      try {
        processingRef.current = true;
        // Process the new content as individual characters for accurate detection of UI components
        processToken(newPortion);

        // If the content contains a complete UI component, finalize to display it
        if (newPortion.includes(']]]')) {
          clientLogger.debug('StreamedMessage: UI component marker found, finalizing', '', '');
          finalize();
        } else if (newPortion.includes('\n\n')) {
          // Or finalize on paragraph breaks for better responsiveness
          clientLogger.debug('StreamedMessage: Paragraph break found, finalizing', '', '');
          finalize();
        }
      } catch (error) {
        clientLogger.error('StreamedMessage: Error processing content', 'data', error);
      } finally {
        processingRef.current = false;
        // Update reference to the full content we've now processed
        previousContentRef.current = content;
      }
    }
  }, [content, processToken, finalize, reset, processingStarted]);

  // When content stops changing (streaming ends), finalize one last time
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // If we have content but haven't finalized yet
    if (content && !processingComplete && processingStarted) {
      timeoutId = setTimeout(() => {
        if (previousContentRef.current === content) {
          clientLogger.debug(
            'StreamedMessage: Content stabilized, performing final finalize',
            '',
            ''
          );
          finalize();
          setProcessingComplete(true);
        }
      }, 500); // Wait 500ms of stability before finalizing
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [content, processingComplete, finalize, processingStarted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!processingComplete && processingStarted) {
        clientLogger.debug('StreamedMessage: Cleanup/unmount, finalizing', '', '');
        finalize();
      }
    };
  }, [finalize, processingComplete, processingStarted]);

  // Debug chunks updates
  useEffect(() => {
    if (chunks.length > 0) {
      clientLogger.debug('StreamedMessage: Chunks updated', 'data', {
        count: chunks.length,
        types: chunks.map(c => c.type),
        lastChunkPreview:
          chunks[chunks.length - 1]?.type === 'text'
            ? chunks[chunks.length - 1].content.toString().slice(0, 50) + '...'
            : 'UI Component',
      });
    }
  }, [chunks]);

  // --- Rendering Logic ---
  const isLoadingInitial = processingStarted && chunks.length === 0 && !processingComplete;
  const hasContent = chunks.length > 0;

  return (
    <div className={`chat ${role === 'user' ? 'chat-end' : 'chat-start'} mb-4`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {role === 'user' ? (
            <img
              src={session?.user?.image || 'https://picsum.photos/200/300?random=1'}
              alt={session?.user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-accent flex items-center justify-center h-full">
              <Icon icon="carbon:bot" className="w-6 h-6 text-accent-content" />
            </div>
          )}
        </div>
      </div>

      <div className="chat-header">
        {role === 'user' ? session?.user?.name || 'User' : currentOrganization?.name || 'Agent'}
      </div>

      <div
        className={`chat-bubble ${role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'}`}
      >
        {/* Initial loading indicator */}
        {isLoadingInitial && (
          <div className="flex items-center space-x-2 py-2">
            <span className="loading loading-dots loading-sm"></span>
            {/* <span className="text-sm opacity-70">Processing...</span> */}
          </div>
        )}

        {/* Render the chunks */}
        {hasContent && (
          <AnimatePresence mode="popLayout">
            {chunks.map((chunk, idx) => {
              return chunk.type === 'text' ? (
                <motion.div
                  key={`text-${idx}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="my-1"
                >
                  <div className="text-base leading-relaxed whitespace-pre-line">
                    {chunk.content}
                  </div>
                </motion.div>
              ) : chunk.type === 'ui' ? (
                <motion.div
                  key={`ui-${idx}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-base-200 rounded-lg my-3 shadow"
                >
                  <ComponentRenderer
                    jsxString={chunk.content.jsxString}
                    logic={chunk.content.logic}
                    onSubmit={formData => {
                      clientLogger.info('StreamedMessage: Form submitted', 'data', formData);
                    }}
                  />
                </motion.div>
              ) : null;
            })}
          </AnimatePresence>
        )}

        {/* Fallback for content that couldn't be parsed */}
        {processingComplete && chunks.length === 0 && content && (
          <div className="text-base leading-relaxed whitespace-pre-line">{content}</div>
        )}
      </div>
    </div>
  );
}
