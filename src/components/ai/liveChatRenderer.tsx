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
  const { chunks, processToken, finalize } = useLiveStreamParser();
  const mounted = useRef(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [streamComplete, setStreamComplete] = useState(false);

  useEffect(() => {
    console.log('LiveChatRenderer: Initialize stream reading');
    const reader = stream.getReader();
    let accumulatedText = '';

    const readStream = async () => {
      try {
        let tokenCount = 0;
        while (mounted.current) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('LiveChatRenderer: Stream reading complete');
            finalize();
            setStreamComplete(true);
            break;
          }

          const text = new TextDecoder().decode(value);
          accumulatedText += text;

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
        }
      } catch (error) {
        console.error('LiveChatRenderer: Error reading stream', error);
        setIsError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error reading stream');
      }
    };

    readStream();

    return () => {
      console.log('LiveChatRenderer: Cleaning up');
      mounted.current = false;
      reader.cancel().catch(err => {
        console.error('LiveChatRenderer: Error cancelling reader', err);
      });
    };
  }, [stream, processToken, finalize]);

  return (
    <div className="space-y-6 p-4">
      {isError && (
        <div className="alert alert-error">
          <Icon icon="carbon:warning" className="w-6 h-6" />
          <p>Error streaming response: {errorMessage}</p>
        </div>
      )}

      {chunks.length === 0 && !isError && !streamComplete && (
        <div className="flex items-center space-x-2 py-4">
          <span className="loading loading-dots"></span>
          <span>Waiting for response...</span>
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

      {streamComplete && chunks.length === 0 && (
        <div className="alert alert-warning">
          <Icon icon="carbon:information" className="w-6 h-6" />
          <p>No content was received from the stream.</p>
        </div>
      )}
    </div>
  );
}
