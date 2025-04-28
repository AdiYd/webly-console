'use client';

import { useState, useCallback, useRef } from 'react';
import { clientLogger } from '@/utils/logger';

// Types
type ParsedChunk =
  | { type: 'text'; content: string }
  | { type: 'ui'; content: { jsxString: string; logic: any } };

// Parser Hook
export function useLiveStreamParser() {
  const [chunks, setChunks] = useState<ParsedChunk[]>([]);
  const bufferRef = useRef('');
  const uiBufferRef = useRef('');
  const insideUIRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastChunkContentRef = useRef(''); // Track content of the last text chunk

  // Reset the parser state
  const reset = useCallback(() => {
    clientLogger.debug('Parser: Resetting parser state',''  , '');
    setChunks([]);
    bufferRef.current = '';
    uiBufferRef.current = '';
    insideUIRef.current = false;
    isProcessingRef.current = false;
    lastChunkContentRef.current = '';
  }, []);

  const processToken = useCallback((token: string) => {
    if (!token || token.length === 0) return;

    // Process character by character for more accurate parsing
    if (token.length > 1) {
      clientLogger.debug('Parser: Processing multi-character token','' ,{ length: token.length });
      for (let i = 0; i < token.length; i++) {
        processSingleChar(token[i]);
      }
    } else {
      processSingleChar(token);
    }
  }, []);

  // Helper function to process a single character
  const processSingleChar = useCallback((char: string) => {
    // Prevent reentrancy issues
    if (isProcessingRef.current) {
      clientLogger.warn('Parser: Skipping char - already processing','this', { char });
      return;
    }

    try {
      isProcessingRef.current = true;

      // Check for UI section start marker [[[
      if (!insideUIRef.current && (bufferRef.current + char).endsWith('[[[')) {
        clientLogger.debug('Parser: UI section start detected', '','');
        
        // Extract text before the marker and create a text chunk if needed
        const textBeforeMarker = bufferRef.current.slice(0, -2); 
        if (textBeforeMarker.trim() && textBeforeMarker.trim() !== lastChunkContentRef.current) {
          clientLogger.debug('Parser: Creating text chunk before UI marker','data', { 
            text: textBeforeMarker.trim() 
          });
          
          setChunks(prev => [...prev, { type: 'text', content: textBeforeMarker.trim() }]);
          lastChunkContentRef.current = textBeforeMarker.trim();
        }
        
        // Reset buffers for UI content
        bufferRef.current = '';
        uiBufferRef.current = '';
        insideUIRef.current = true;
        return; // Marker processed
      }

      // Check for UI section end marker ]]]
      if (insideUIRef.current && (uiBufferRef.current + char).endsWith(']]]')) {
        const jsonString = uiBufferRef.current.slice(0, -2); // Content before ']]]'
        clientLogger.debug('Parser: UI section end detected, parsing JSON','','');
        
        try {
          // Parse JSON content for UI component
          let parsed;
          try {
            parsed = JSON.parse(jsonString.trim());
          } catch (e) {
            clientLogger.warn('Parser: Initial JSON parse failed, attempting to fix','', { error: e });
            // Fix common JSON issues like escaped quotes
            const fixedJson = jsonString.trim()
              .replace(/\\"/g, '"')
              .replace(/\\'/g, "'")
              .replace(/\\\\/g, "\\");
            parsed = JSON.parse(fixedJson);
          }

          // Validate and create UI chunk
          if (parsed && parsed.jsxString && typeof parsed.logic === 'object') {
            clientLogger.debug('Parser: Adding UI component chunk', '', { parsed });
            setChunks(prev => [...prev, { type: 'ui', content: parsed }]);
          } else {
            clientLogger.warn('Parser: Invalid UI component format','', { parsed });
            setChunks(prev => [...prev, { 
              type: 'text', 
              content: `[[[${jsonString}]]]` 
            }]);
          }
        } catch (err:any) {
          clientLogger.error('Parser: JSON parse error','', { error: err });
          // Add the raw content as text if parsing fails
          setChunks(prev => [...prev, { 
            type: 'text', 
            content: `[[[${jsonString}]]]` 
          }]);
        }
        
        // Reset state after processing UI component
        insideUIRef.current = false;
        uiBufferRef.current = '';
        bufferRef.current = '';
        return;
      }

      // Append character to the appropriate buffer
      if (insideUIRef.current) {
        uiBufferRef.current += char;
      } else {
        bufferRef.current += char;
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Finalize current buffer into chunks
  const finalize = useCallback(() => {
    clientLogger.debug('Parser: Finalize called','data', {
      bufferLength: bufferRef.current.length,
      insideUI: insideUIRef.current,
      uiBufferLength: uiBufferRef.current.length,
    });

    // Process remaining text buffer if not inside UI component
    if (!insideUIRef.current && bufferRef.current.trim()) {
      const finalContent = bufferRef.current.trim();
      
      // Only add as a new chunk if it's different from the last chunk
      // or if it's a meaningful extension of the last chunk
      if (finalContent !== lastChunkContentRef.current) {
        if (finalContent.startsWith(lastChunkContentRef.current) && chunks.length > 0) {
          // This is an extension of the last chunk, update it instead of adding new
          const lastChunkIndex = chunks.length - 1;
          if (chunks[lastChunkIndex].type === 'text') {
            clientLogger.debug('Parser: Updating last text chunk with new content','','');
            setChunks(prev => {
              const updated = [...prev];
              updated[lastChunkIndex] = { ...updated[lastChunkIndex], content: finalContent } as ParsedChunk;
              return updated;
            });
          } else {
            // Last chunk wasn't text, add as new chunk
            clientLogger.debug('Parser: Adding new text chunk (extension after non-text)','','');
            setChunks(prev => [...prev, { type: 'text', content: finalContent }]);
          }
        } else {
          // This is entirely new content, add as new chunk
          clientLogger.debug('Parser: Adding new text chunk','', { content: finalContent });
          setChunks(prev => [...prev, { type: 'text', content: finalContent }]);
        }
        
        lastChunkContentRef.current = finalContent;
      } else {
        clientLogger.debug('Parser: Skipping duplicate text chunk','',{ });
      }
    }

    // Handle unclosed UI section as text
    if (insideUIRef.current && uiBufferRef.current.trim()) {
      clientLogger.warn('Parser: Unclosed UI section on finalize','data', {
        content: uiBufferRef.current.slice(0, 30) + '...'
      });
      
      setChunks(prev => [
        ...prev,
        {
          type: 'text',
          content: `[[[${uiBufferRef.current}]]]`,
        },
      ]);
      
      // Reset UI state
      insideUIRef.current = false;
      uiBufferRef.current = '';
    }
  }, [chunks]);

  return { chunks, processToken, finalize, reset };
}
