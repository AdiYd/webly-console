'use client';

import { useState, useCallback, useRef } from 'react';

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

  // Reset the parser state
  const reset = useCallback(() => {
    console.log('Parser: Resetting parser state');
    setChunks([]);
    bufferRef.current = '';
    uiBufferRef.current = '';
    insideUIRef.current = false;
    isProcessingRef.current = false;
  }, []);

  const processToken = useCallback((token: string) => {
    // Handle case when a full string is passed rather than a single character
    if (token && token.length > 1) {
      console.log('Parser: Received full string instead of single token', { 
        length: token.length,
        preview: token.slice(0, 30) + (token.length > 30 ? '...' : '')
      });
      
      // Process full string directly if it doesn't contain UI markers
      if (!token.includes('[[[') && !token.includes(']]]')) {
        console.log('Parser: Processing simple string without UI markers');
        setChunks(prev => [...prev, { type: 'text', content: token.trim() }]);
        return;
      }
      
      // Otherwise process character by character
      for (let i = 0; i < token.length; i++) {
        processToken(token[i]);
      }
      return;
    }

    // Prevent processing if already handling a token (prevents reentrancy issues)
    if (isProcessingRef.current) {
      console.warn('Parser: Skipping token processing - already processing');
      return;
    }

    try {
      isProcessingRef.current = true;

      // Only log occasionally to reduce console spam
      if (Math.random() < 0.01) {
        console.log(`Parser: Processing token`, {
          token: token === '\n' ? '\\n' : token,
          bufferLength: bufferRef.current.length,
          uiBufferLength: uiBufferRef.current.length,
          insideUI: insideUIRef.current
        });
      }

      // Check for UI start marker - looking for [[[
      if (!insideUIRef.current && (bufferRef.current + token).endsWith('[[[')) {
        console.log('Parser: UI section start detected');
        
        // Get buffer without the marker
        const newBuffer = bufferRef.current.slice(0, -2); // Remove last 2 chars, token is the 3rd
        
        // Add any text before the UI section as a chunk
        if (newBuffer.trim()) {
          console.log('Parser: Creating text chunk before UI section', { content: newBuffer.trim() });
          setChunks(prev => [...prev, { type: 'text', content: newBuffer.trim() }]);
        }
        
        // Clear buffer and start collecting UI content
        bufferRef.current = '';
        uiBufferRef.current = '';
        insideUIRef.current = true;
        return;
      }

      // Check for UI end marker - looking for ]]]
      if (insideUIRef.current && (uiBufferRef.current + token).endsWith(']]]')) {
        try {
          // Extract JSON without the end marker
          const jsonString = (uiBufferRef.current + token).slice(0, -(']]]'.length));
          console.log('Parser: UI section end detected, parsing JSON');
          
          let parsed;
          try {
            parsed = JSON.parse(jsonString.trim());
          } catch (e) {
            console.error('Parser: JSON parse error, attempting to fix malformed JSON', e);
            // Try to fix common JSON formatting issues
            const fixedJson = jsonString.trim()
              .replace(/\\"/g, '"')
              .replace(/\\'/g, "'")
              .replace(/\\\\/g, "\\");
            parsed = JSON.parse(fixedJson);
          }
          
          if (parsed && parsed.jsxString && typeof parsed.logic === 'object') {
            console.log('Parser: Adding UI component chunk');
            setChunks(prev => [...prev, { type: 'ui', content: parsed }]);
          } else {
            console.warn('Parser: Invalid UI component format', { parsed });
            // Fall back to text if format is invalid
            setChunks(prev => [...prev, { 
              type: 'text', 
              content: `[[[${jsonString}]]]` 
            }]);
          }
        } catch (err) {
          console.error('Parser: JSON parse error', err);
          // Show the raw content if JSON parsing fails
          setChunks(prev => [...prev, { 
            type: 'text', 
            content: `[[[${uiBufferRef.current}]]]` 
          }]);
        }
        
        // Reset UI parsing state
        insideUIRef.current = false;
        uiBufferRef.current = '';
        return;
      }

      // If inside UI section, add to UI buffer
      if (insideUIRef.current) {
        uiBufferRef.current += token;
        return;
      }

      // Regular text processing
      bufferRef.current += token;

      // Create new text chunk at sentence-ending punctuation or newline
      // or after a reasonable buffer length to ensure text appears promptly
      if (token === '.' || token === '!' || token === '?' || token === '\n' || 
          bufferRef.current.length > 80) { // Also chunk after reasonable length
        if (bufferRef.current.trim()) {
          console.log('Parser: Creating text chunk', { trigger: token, content: bufferRef.current.trim() });
          setChunks(prev => [
            ...prev,
            {
              type: 'text', 
              content: bufferRef.current.trim(),
            },
          ]);
          bufferRef.current = '';
        }
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const finalize = useCallback(() => {
    console.log('Parser: Finalizing with remaining buffer', { 
      bufferContent: bufferRef.current,
      insideUI: insideUIRef.current,
      uiBufferContent: uiBufferRef.current
    });

    // Add any remaining text in buffer
    if (bufferRef.current.trim()) {
      setChunks(prev => [
        ...prev,
        {
          type: 'text',
          content: bufferRef.current.trim(),
        },
      ]);
      bufferRef.current = '';
    }

    // Handle unclosed UI section
    if (insideUIRef.current && uiBufferRef.current.trim()) {
      console.warn('Parser: Unclosed UI section on finalize - outputting as text');
      setChunks(prev => [
        ...prev,
        {
          type: 'text',
          content: `[[[${uiBufferRef.current}]]]`,
        },
      ]);
      uiBufferRef.current = '';
      insideUIRef.current = false;
    }
    
    // Force creation of a text chunk if no chunks were created
    if (chunks.length === 0 && !bufferRef.current.trim() && !uiBufferRef.current.trim()) {
      console.warn('Parser: No chunks created after finalizing, adding empty chunk');
      setChunks([{ type: 'text', content: '' }]);
    }
  }, [chunks.length]);

  return { chunks, processToken, finalize, reset };
}
