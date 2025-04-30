'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveStreamParser } from '@/hooks/use-parser';
import { ComponentRenderer } from './componentRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface LiveChatRendererProps {
  stream: ReadableStream;
}

export function LiveChatRenderer({ stream }: LiveChatRendererProps) {
  const { chunks, processToken, finalize, reset } = useLiveStreamParser();
  const mounted = useRef(true);
  const lastProcessedTime = useRef(Date.now());
  const processingComplete = useRef(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [streamComplete, setStreamComplete] = useState(false);
  const [streamedText, setStreamedText] = useState(''); // Track total streamed text for debugging
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('LiveChatRenderer: Initialize stream reading');
    // Reset parser state on mount
    reset();

    const reader = stream.getReader();
    let accumulatedText = '';
    lastProcessedTime.current = Date.now();

    // If no activity for 2 seconds, consider stream complete
    const inactivityTimer = setInterval(() => {
      if (!processingComplete.current && Date.now() - lastProcessedTime.current > 2000) {
        console.log('LiveChatRenderer: Inactivity timeout - finalizing');
        finalize();
        setStreamComplete(true);
        processingComplete.current = true;
        clearInterval(inactivityTimer);
      }
    }, 500);

    const readStream = async () => {
      try {
        setIsLoading(true);
        let tokenCount = 0;

        while (mounted.current) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('LiveChatRenderer: Stream reading complete');
            // Ensure we finalize even if no chunks were processed
            finalize();
            setStreamComplete(true);
            processingComplete.current = true;
            break;
          }

          const text = new TextDecoder().decode(value);
          if (!text || text.length === 0) continue;

          accumulatedText += text;
          setStreamedText(accumulatedText);
          lastProcessedTime.current = Date.now();

          console.log('LiveChatRenderer: Received chunk from stream', {
            length: text.length,
            excerpt: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
            accumulatedLength: accumulatedText.length,
          });

          // Process each character in the chunk
          for (const token of text) {
            tokenCount++;
            if (tokenCount % 50 === 0) {
              console.log(`LiveChatRenderer: Processed ${tokenCount} tokens`);
            }
            processToken(token);
          }

          // Finalize after processing this chunk to ensure partial content appears
          // This is important for UI components
          if (text.includes(']]]')) {
            console.log('LiveChatRenderer: UI component detected, finalizing current buffer');
            finalize();
          } else if (tokenCount % 100 === 0) {
            // Periodically finalize to show partial content
            finalize();
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error('LiveChatRenderer: Error reading stream', error);
        setIsError(true);
        setIsLoading(false);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error reading stream');
        // Still try to display any content that was received before the error
        finalize();
      } finally {
        clearInterval(inactivityTimer);
        setIsLoading(false);

        if (mounted.current && !processingComplete.current) {
          finalize();
          setStreamComplete(true);
          processingComplete.current = true;
        }
      }
    };

    readStream();

    return () => {
      console.log('LiveChatRenderer: Cleaning up');
      mounted.current = false;
      clearInterval(inactivityTimer);
      reader.cancel().catch(err => {
        console.error('LiveChatRenderer: Error cancelling reader', err);
      });
      // Always finalize on unmount to ensure any remaining content is processed
      if (!processingComplete.current) {
        finalize();
        processingComplete.current = true;
      }
    };
  }, [stream, processToken, finalize, reset]);

  // Force finalize after a reasonable timeout if no chunks have been created
  useEffect(() => {
    if (isLoading && !streamComplete) {
      const timeout = setTimeout(() => {
        if (!streamComplete && chunks.length === 0) {
          console.log('LiveChatRenderer: Auto-finalizing after timeout');
          finalize();
          setIsLoading(false);
        }
      }, 5000); // 5 second safety timeout

      return () => clearTimeout(timeout);
    }
  }, [chunks.length, streamComplete, finalize, isLoading]);

  return (
    <div className="space-y-6 p-4">
      {isError && (
        <div className="alert alert-error">
          <Icon icon="carbon:warning" className="w-6 h-6" />
          <p>Error streaming response: {errorMessage}</p>
        </div>
      )}

      {chunks.length === 0 && !isError && (
        <div className="flex items-center space-x-2 py-4">
          <span
            className={`loading loading-dots ${!isLoading && streamComplete ? 'hidden' : ''}`}
          ></span>
          <span>
            {isLoading
              ? 'Waiting for response...'
              : streamComplete
              ? 'Processing...'
              : 'Generating response...'}
          </span>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {chunks.map((chunk, idx) => {
          console.log('LiveChatRenderer: Rendering chunk', { index: idx, type: chunk.type });

          if (chunk.type === 'text') {
            return (
              <motion.p
                key={`text-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-base leading-relaxed whitespace-pre-line"
              >
                {chunk.content}
              </motion.p>
            );
          }
          if (chunk.type === 'ui') {
            console.log('LiveChatRenderer: Rendering UI component', {
              jsxPreview: chunk.content.jsxString.slice(0, 100) + '...',
              logic: chunk.content.logic,
            });

            return (
              <motion.div
                key={`ui-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="p-4 bg-base-200 rounded-lg"
              >
                <ComponentRenderer
                  jsxString={chunk.content.jsxString}
                  logic={chunk.content.logic}
                  onSubmit={formData => {
                    console.log('LiveChatRenderer: Form submitted:', formData);
                    // Optional: send back to AI etc.
                  }}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </AnimatePresence>

      {streamComplete && chunks.length === 0 && streamedText && (
        <div className="alert alert-warning">
          <Icon icon="carbon:information" className="w-6 h-6" />
          <div className="flex flex-col">
            <p>Content received but rendered as plain text.</p>
            <details className="text-xs mt-2">
              <summary>View raw content</summary>
              <p className="mt-1 max-h-20 overflow-y-auto">{streamedText}</p>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
