'use client';

import { useEffect, useRef } from 'react';
import { useLiveStreamParser } from '@/hooks/use-parser';
import { ComponentRenderer } from './componentRendere'; // Your dynamic JSX renderer
import { motion, AnimatePresence } from 'framer-motion';

interface LiveChatRendererProps {
  stream: ReadableStream; // Your AI output stream
}

export function LiveChatRenderer({ stream }: LiveChatRendererProps) {
  const { chunks, processToken, finalize } = useLiveStreamParser();
  const mounted = useRef(true);

  useEffect(() => {
    console.log('LiveChatRenderer: Starting to read stream');
    const reader = stream.getReader();

    const readStream = async () => {
      try {
        let tokenCount = 0;
        while (mounted.current) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('LiveChatRenderer: Stream reading complete');
            finalize();
            break;
          }

          const text = new TextDecoder().decode(value);
          console.log('LiveChatRenderer: Received chunk from stream', {
            length: text.length,
            excerpt: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          });

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
                className="text-base leading-relaxed"
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
    </div>
  );
}
