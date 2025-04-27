'use client';

import { useEffect, useRef } from 'react';
import { useLiveStreamParser } from '@/hooks/use-parser';
import { ComponentRenderer } from './componentRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface StreamedMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function StreamedMessage({ content, role }: StreamedMessageProps) {
  const { chunks, processToken, finalize, reset } = useLiveStreamParser();
  const isProcessingRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // Only run stream simulation on first render to prevent infinite loops
    if (!isFirstRenderRef.current) {
      console.log('StreamedMessage: Skipping simulation on re-render');
      return;
    }

    isFirstRenderRef.current = false;
    console.log('StreamedMessage: Starting stream simulation', {
      role,
      contentLength: content.length,
    });

    // Don't start a new simulation if one is already in progress
    if (isProcessingRef.current) {
      console.warn('StreamedMessage: Simulation already in progress');
      return;
    }

    isProcessingRef.current = true;
    let isMounted = true;

    // Reset the parser to start fresh
    reset();

    // Simulate streaming by processing one character at a time
    const simulateStream = async () => {
      try {
        if (!content) {
          console.warn('StreamedMessage: Empty content received');
          return;
        }

        // Process the message character by character
        for (let i = 0; i < content.length; i++) {
          if (!isMounted) {
            console.log('StreamedMessage: Component unmounted during stream');
            break;
          }

          const char = content[i];
          // Skip logging for most characters to reduce console spam
          if (i % 100 === 0) {
            console.log(`StreamedMessage: Processing char ${i}/${content.length}`);
          }

          processToken(char);

          // Randomize delay slightly for more natural feel
          const delay = Math.floor(Math.random() * 4) + 2;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log('StreamedMessage: Stream simulation complete');
        if (isMounted) {
          finalize();
        }
      } catch (error) {
        console.error('StreamedMessage: Error in stream simulation', error);
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
  }, [content, role, processToken, finalize, reset]);

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

      <div className="chat-header">{role === 'user' ? 'User' : 'Firestore Assistant'}</div>

      <div
        className={`chat-bubble ${role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'}`}
      >
        {chunks.length === 0 && (
          <div className="flex items-center space-x-2 py-2">
            <span className="loading loading-dots loading-sm"></span>
            <span className="text-sm opacity-70">Processing message...</span>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {chunks.map((chunk, idx) =>
            chunk.type === 'text' ? (
              <motion.p
                key={`text-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-base leading-relaxed"
              >
                {chunk.content}
              </motion.p>
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
                    console.log('Form submitted', formData);
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
