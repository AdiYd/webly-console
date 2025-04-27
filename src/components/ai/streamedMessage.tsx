'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveStreamParser } from '@/hooks/use-parser';
import { ComponentRenderer } from './componentRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import { useOrganization } from '@/context/OrganizationContext';

interface StreamedMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function StreamedMessage({ content, role }: StreamedMessageProps) {
  const { chunks, processToken, finalize, reset } = useLiveStreamParser();
  const isProcessingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const { data: session } = useSession();
  const { currentOrganization } = useOrganization();
  const [processingComplete, setProcessingComplete] = useState(false);

  // Handle direct content rendering for simple messages
  useEffect(() => {
    // For very simple messages or user messages, skip streaming simulation and render directly
    if (role === 'user' || (content && content.length < 80 && !content.includes('[[['))) {
      console.log('StreamedMessage: Simple message, skipping simulation and rendering directly');
      reset();
      // Create a single text chunk directly
      processToken(content);
      finalize();
      setProcessingComplete(true);
      return;
    }
  }, [content, role, processToken, finalize, reset]);

  useEffect(() => {
    // Only run stream simulation on first render to prevent infinite loops
    // Skip for simple messages that were handled in the previous effect
    if (!isFirstRenderRef.current || processingComplete) {
      console.log('StreamedMessage: Skipping simulation on re-render or already processed');
      return;
    }

    isFirstRenderRef.current = false;
    console.log('StreamedMessage: Starting stream simulation', {
      role,
      contentPreview: content?.slice(0, 50) + '...',
      contentLength: content?.length || 0,
    });

    // Don't start a new simulation if one is already in progress
    if (isProcessingRef.current) {
      console.warn('StreamedMessage: Simulation already in progress');
      return;
    }

    // If content is empty, don't try to process
    if (!content || content.length === 0) {
      console.warn('StreamedMessage: Empty content received');
      setProcessingComplete(true);
      return;
    }

    isProcessingRef.current = true;
    let isMounted = true;

    // Reset the parser to start fresh
    reset();

    // Simulate streaming by processing one character at a time
    const simulateStream = async () => {
      try {
        // Process the message character by character
        for (let i = 0; i < content.length; i++) {
          if (!isMounted) {
            console.log('StreamedMessage: Component unmounted during stream');
            break;
          }

          const char = content[i];
          // Skip logging for most characters to reduce console spam
          if (i % 200 === 0) {
            console.log(`StreamedMessage: Processing char ${i}/${content.length}`);
          }

          processToken(char);

          // Shorter delay for better user experience
          const delay = 2; // Fixed delay for more consistent pacing
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log('StreamedMessage: Stream simulation complete');
        if (isMounted) {
          finalize();
          setProcessingComplete(true);
        }
      } catch (error) {
        console.error('StreamedMessage: Error in stream simulation', error);
        setProcessingComplete(true);
      } finally {
        isProcessingRef.current = false;
      }
    };

    simulateStream();

    // Cleanup function
    return () => {
      console.log('StreamedMessage: Cleanup - marking component as unmounted');
      isMounted = false;
    };
  }, [content, role, processToken, finalize, reset, processingComplete]);

  // For debugging: show chunk info
  useEffect(() => {
    if (chunks.length > 0) {
      console.log('StreamedMessage: Chunks updated', {
        count: chunks.length,
        types: chunks.map(c => c.type),
      });
    }
  }, [chunks]);

  // Add fallback info if there's trouble with text/UI chunks
  useEffect(() => {
    if (chunks.length === 0 && processingComplete) {
      console.warn('StreamedMessage: No chunks were parsed from content');
      // Create a fallback chunk if processing is complete but no chunks were created
      reset();
      processToken(content || 'No content available');
      finalize();
    }
  }, [chunks, processingComplete, content, processToken, finalize, reset]);

  return (
    <div className={`chat ${role === 'user' ? 'chat-end' : 'chat-start'} mb-4`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {role === 'user' ? (
            <img
              src="https://picsum.photos/200/300?random=1"
              alt="User"
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
        {role === 'user' ? session?.user?.name || 'User' : currentOrganization.name || 'Agent'}
      </div>

      <div
        className={`chat-bubble ${role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'}`}
      >
        {chunks.length === 0 && !processingComplete && (
          <div className="flex items-center space-x-2 py-2">
            <span className="loading loading-dots loading-sm"></span>
            <span className="text-sm opacity-70">Processing message...</span>
          </div>
        )}

        {chunks.length === 0 && processingComplete && (
          <div className="py-2 flex items-center text-warning">
            <Icon icon="carbon:warning" className="mr-2" />
            <span>No content to display</span>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {chunks.map((chunk, idx) =>
            chunk.type === 'text' ? (
              <motion.div
                key={`text-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="my-1"
              >
                <p className="text-base leading-relaxed whitespace-pre-line">{chunk.content}</p>
              </motion.div>
            ) : chunk.type === 'ui' ? (
              <motion.div
                key={`ui-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="p-4 bg-base-200 rounded-lg my-3"
              >
                <ComponentRenderer
                  jsxString={chunk.content.jsxString}
                  logic={chunk.content.logic}
                  onSubmit={formData => {
                    console.log('StreamedMessage: Form submitted', formData);
                  }}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
