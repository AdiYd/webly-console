'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor } from '@/editor/context/EditorContext';
import { getPageHtml } from '../pageParser';
import {
  preparePageForTextEditing,
  finalizePageFromTextEditing,
  TextContentMap,
} from './TextEditorParser';
import '../utils';

export const textEditingBridgeScript = `
<script>
(function () {
  // Don't initialize if already initialized
  if (window.textEditingInitialized) return;
  window.textEditingInitialized = true;

  // Inherit base bridge functionality
  function send(type, payload, requestId) {
    try { 
      parent.postMessage({ 
        weblyIframe: true, 
        type: type, 
        payload: payload || null, 
        requestId: requestId || null 
      }, '*'); 
    } catch(e) {
      console.warn('Bridge send error:', e);
    }
  }

  // Text editing specific functionality
  let textEditingMode = false;
  let textChangedElements = new Set();
  let debounceTimer = null;

  // Keep references so we can restore
  let weblyMutationObserver = null;
  let weblyCaptureClickHandler = null;

  function initializeTextEditing() {
    if (textEditingMode) return; // Already initialized
    textEditingMode = true;
    
    console.log('Initializing text editing mode');

    // Set up text change listeners with better event handling
    document.addEventListener('input', handleTextInput, true);
    document.addEventListener('blur', handleTextBlur, true);
    document.addEventListener('paste', handleTextPaste, true);
    document.addEventListener('focus', handleTextFocus, true);

    // Add placeholders for empty editable elements
    document.querySelectorAll('[data-text-editable="true"]').forEach(element => {
      if (!element.textContent.trim()) {
        element.setAttribute('data-placeholder', 'Click to edit...');
      }
    });

    // Disable interactive elements across the page (excluding elements that are or are inside text-editable)
    disableInteractiveElements();

    // Observe DOM changes and disable newly added interactive elements
    try {
      weblyMutationObserver = new MutationObserver(muts => {
        muts.forEach(m => {
          if (m.addedNodes && m.addedNodes.length) {
            // Slight delay to allow attributes to settle
            setTimeout(() => disableInteractiveElements(m.addedNodes), 10);
          }
        });
      });
      weblyMutationObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (err) {
      console.warn('MutationObserver failed:', err);
    }

    // Capture-phase click handler to block clicks on disabled elements (prevents inline onclicks)
    weblyCaptureClickHandler = function(e) {
      try {
        const tgt = e.target;
        if (!tgt || !tgt.closest) return;
        // If click target is inside an editable area, allow it
        if (tgt.closest('[data-text-editable="true"]')) return;
        // If click target or ancestor was marked disabled, prevent it
        const disabledAncestor = tgt.closest('[data-webly-disabled="true"]');
        if (disabledAncestor) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      } catch (err) {
        // ignore
      }
    };
    document.addEventListener('click', weblyCaptureClickHandler, true);

    send('response:textEditingEnabled', { success: true });
  }

  function teardownTextEditing() {
    if (!textEditingMode) return;
    textEditingMode = false;

    // Remove listeners we added
    document.removeEventListener('input', handleTextInput, true);
    document.removeEventListener('blur', handleTextBlur, true);
    document.removeEventListener('paste', handleTextPaste, true);
    document.removeEventListener('focus', handleTextFocus, true);

    // Restore interactive elements
    restoreInteractiveElements();

    // Disconnect observer
    try {
      if (weblyMutationObserver) {
        weblyMutationObserver.disconnect();
        weblyMutationObserver = null;
      }
    } catch (err) {}

    // Remove capture click handler
    try {
      if (weblyCaptureClickHandler) {
        document.removeEventListener('click', weblyCaptureClickHandler, true);
        weblyCaptureClickHandler = null;
      }
    } catch (err) {}

    send('response:textEditingDisabled', { success: true });
  }

  function isInsideEditable(el) {
    return !!(el && el.closest && el.closest('[data-text-editable="true"]'));
  }

  function disableInteractiveElements(onlyNodes) {
    // selector for interactive controls and obvious clickable elements
    const selector = 'a[href], a:not([href])[onclick], button, input, select, textarea, [role="button"], [onclick]';
    const nodes = onlyNodes ? Array.from(onlyNodes) : [document];
    nodes.forEach(root => {
      try {
        // If root is a NodeList or DocumentFragment, handle children
        const scope = (root.nodeType === 1 || root.nodeType === 9) ? root : document;
        const els = Array.from(scope.querySelectorAll ? scope.querySelectorAll(selector) : []);
        els.forEach(el => {
          try {
            // Don't disable elements that are inside editable areas
            if (isInsideEditable(el)) return;
            if (el.getAttribute && el.getAttribute('data-webly-disabled') === 'true') return;

            // Mark disabled so we don't re-process
            el.setAttribute('data-webly-disabled', 'true');

            const tag = (el.tagName || '').toLowerCase();

            // For anchors: back up href and remove it
            if (tag === 'a') {
              const href = el.getAttribute('href') || '';
              el.setAttribute('data-webly-href', href);
              // remove href to prevent navigation; still keep anchor element in DOM
              if (href) el.removeAttribute('href');
              el.setAttribute('aria-disabled', 'true');
              el.classList.add('webly-disabled');
            } else {
              // For form controls and buttons: back up disabled state then disable
              if ('disabled' in el) {
                el.setAttribute('data-webly-old-disabled', el.disabled ? 'true' : 'false');
                try { el.disabled = true; } catch (err) {}
              } else {
                // If it's not a native control but has role/button or onclick
                el.setAttribute('aria-disabled', 'true');
              }
              el.classList.add('webly-disabled');
            }
          } catch (err) {
            // ignore element-level errors
          }
        });
      } catch (err) {
        // ignore scope-level errors
      }
    });
  }

  function restoreInteractiveElements() {
    try {
      const disabledEls = Array.from(document.querySelectorAll('[data-webly-disabled="true"]'));
      disabledEls.forEach(el => {
        try {
          const tag = (el.tagName || '').toLowerCase();
          if (tag === 'a') {
            const oldHref = el.getAttribute('data-webly-href');
            if (oldHref) el.setAttribute('href', oldHref);
            el.removeAttribute('data-webly-href');
            el.removeAttribute('aria-disabled');
            el.classList.remove('webly-disabled');
          } else {
            if (el.hasAttribute('data-webly-old-disabled')) {
              const wasDisabled = el.getAttribute('data-webly-old-disabled') === 'true';
              try { el.disabled = wasDisabled; } catch (err) {}
              el.removeAttribute('data-webly-old-disabled');
            } else {
              try { if ('disabled' in el) el.disabled = false; } catch (err) {}
            }
            el.removeAttribute('aria-disabled');
            el.classList.remove('webly-disabled');
          }
          el.removeAttribute('data-webly-disabled');
        } catch (err) {
          // ignore
        }
      });
    } catch (err) {
      console.warn('restoreInteractiveElements error', err);
    }
  }

  function handleTextFocus(e) {
    const element = e.target;
    if (!element || !element.hasAttribute || !element.hasAttribute('data-key')) return;
    
    // Clear placeholder styling on focus
    element.style.opacity = '1';
    // Mark focused (optional)
    try { element.classList.add('webly-text-focused'); } catch (err) {}
  }

  function handleTextInput(e) {
    const element = e.target;
    if (!element || !element.hasAttribute || !element.hasAttribute('data-key')) return;

    textChangedElements.add(element.getAttribute('data-key'));
    
    // Debounce text change notifications
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sendTextChanges();
    }, 300);
  }

  function handleTextBlur(e) {
    const element = e.target;
    if (!element || !element.hasAttribute || !element.hasAttribute('data-key')) return;
    
    // Send immediate update on blur
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    sendTextChanges();
    try { element.classList.remove('webly-text-focused'); } catch (err) {}
  }

  function handleTextPaste(e) {
    const element = e.target;
    if (!element || !element.hasAttribute || !element.hasAttribute('data-key')) return;

    // Allow paste but clean it up
    setTimeout(() => {
      // Clean up pasted content - remove unwanted formatting
      const text = element.textContent || '';
      if (text !== element.textContent) {
        element.textContent = text;
      }
      
      textChangedElements.add(element.getAttribute('data-key'));
      sendTextChanges();
    }, 10);
  }

  function sendTextChanges() {
    if (textChangedElements.size === 0) return;

    const changes = {};
    textChangedElements.forEach(dataKey => {
      const element = document.querySelector(\`[data-key="\${dataKey}"]\`);
      if (element) {
        changes[dataKey] = element.textContent || '';
      }
    });

    send('text:changed', { changes });
    textChangedElements.clear();
  }

  // Listen for parent messages
  window.addEventListener('message', (e) => {
    try {
      const data = e.data;
      if (!data || !data.fromParent) return;

      if (data.type === 'command:enableTextEditing') {
        initializeTextEditing();
      }

      if (data.type === 'command:disableTextEditing') {
        teardownTextEditing();
      }

      if (data.type === 'command:updateText') {
        const { dataKey, newText } = data.payload || {};
        if (dataKey) {
          const element = document.querySelector(\`[data-key="\${dataKey}"]\`);
          if (element) {
            element.textContent = newText || '';
            send('response:textUpdated', { dataKey, success: true });
          }
        }
      }
    } catch (err) {
      console.warn('Text editing bridge error:', err);
    }
  });

  // Auto-initialize if elements are already present
  function checkAndInitialize() {
    if (document.querySelector('[data-text-editable="true"]')) {
      initializeTextEditing();
    }
  }

  // Initialize based on document state
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', checkAndInitialize);
  } else {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(checkAndInitialize, 100);
  }
})();
</script>
<style>

    .webly-disabled {
      opacity: 0.6;
      cursor: not-allowed !important;
      transition: opacity 120ms ease;
      /* don't remove pointer-events globally: we prevent clicks with capture handler and remove href/disable native props */
    }

    .webly-text-focused {
      outline: 3px solid rgba(59, 130, 246, 0.9);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
      border-radius: 6px;
      transition: box-shadow 140ms ease, outline-color 140ms ease;
    }
</style>
`;

export function TextEditingPageParser() {
  const { state, actions } = useEditor();
  const { currentPage, theme, daisyTheme, editingMode } = state;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [textContentMap, setTextContentMap] = useState<TextContentMap>({});
  const [isTextEditingEnabled, setIsTextEditingEnabled] = useState(false);

  // Prepare page for text editing when mode changes
  const preparedPageData = useRef<{
    modifiedPage: any;
    textContentMap: TextContentMap;
  } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      console.log('Selected section changed:', state.selectedSectionId);
      const iframe = iframeRef.current;
      if (iframe && state.selectedSectionId) {
        const section = iframe.contentDocument?.getElementById(state.selectedSectionId);
        console.log('Found section in iframe:', section, iframe.contentDocument);
        if (section) {
          console.log('Scrolling to section:', state.selectedSectionId);
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 500);
  }, [state.selectedSectionId]);

  useEffect(() => {
    if (editingMode === 'text') {
      const { modifiedPage, globalTextContentMap } = preparePageForTextEditing(currentPage);
      preparedPageData.current = { modifiedPage, textContentMap: globalTextContentMap };
      setTextContentMap(globalTextContentMap);
    } else {
      preparedPageData.current = null;
      setTextContentMap({});
      setIsTextEditingEnabled(false);
    }
  }, [editingMode, currentPage]);

  // Create a stable reference to the save function using useRef
  const saveTextChanges = useRef<() => void>();

  // Update the save function when dependencies change, but don't trigger useEffect
  saveTextChanges.current = useCallback(() => {
    if (editingMode !== 'text' || !preparedPageData.current) return;

    try {
      const finalizedPage = finalizePageFromTextEditing(
        preparedPageData.current.modifiedPage,
        textContentMap
      );

      // Update the current page with finalized content
      actions.updateCurrentPage(finalizedPage);
      actions.saveToHistory();

      console.log('Text changes saved successfully');
    } catch (error) {
      console.error('Error saving text changes:', error);
      // Could show a toast notification here
    }
  }, [editingMode, textContentMap, actions.updateCurrentPage, actions.saveToHistory]);

  // Register save callback when entering text mode - ONLY depend on editingMode
  useEffect(() => {
    if (editingMode === 'text') {
      // Create a wrapper function that calls the current save function
      const stableSaveWrapper = () => {
        if (saveTextChanges.current) {
          saveTextChanges.current();
        }
      };
      actions.setTextEditorSaveCallback(stableSaveWrapper);
    } else {
      actions.setTextEditorSaveCallback(null);
    }

    // Cleanup callback when component unmounts or mode changes
    return () => {
      actions.setTextEditorSaveCallback(null);
    };
  }, [editingMode, actions.setTextEditorSaveCallback]); // Only depend on editingMode and the stable action

  // Generate HTML with text editing capabilities
  const generateHtml = useCallback(() => {
    const pageToRender =
      editingMode === 'text' && preparedPageData.current
        ? preparedPageData.current.modifiedPage
        : currentPage;

    // Pass the textEditing flag to enable text editing mode
    return getPageHtml(pageToRender, theme, daisyTheme, 'text');
  }, [currentPage, theme, daisyTheme, editingMode]);

  // Handle iframe messages with better error handling
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    const { data } = event;
    if (!data?.weblyIframe) return;

    try {
      switch (data.type) {
        case 'text:changed':
          if (data.payload?.changes) {
            console.log('Received text changes from iframe:', data.payload.changes);
            setTextContentMap(prev => {
              const updated = { ...prev };
              Object.entries(data.payload.changes).forEach(([dataKey, newText]) => {
                if (updated[dataKey]) {
                  updated[dataKey] = {
                    ...updated[dataKey],
                    currentText: newText as string,
                  };
                } else {
                  // Handle case where we don't have the original data
                  updated[dataKey] = {
                    originalText: newText as string,
                    currentText: newText as string,
                    originalHtml: newText as string,
                  };
                }
              });
              return updated;
            });
          }
          break;

        case 'response:textEditingEnabled':
          setIsTextEditingEnabled(true);
          break;

        default:
          // Handle other iframe messages
          break;
      }
    } catch (error) {
      console.warn('Error handling iframe message:', error);
    }
  }, []);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [handleIframeMessage]);

  // Enable text editing when iframe loads
  useEffect(() => {
    if (editingMode === 'text' && iframeRef.current && preparedPageData.current) {
      const iframe = iframeRef.current;
      const enableTextEditing = () => {
        setTimeout(() => {
          iframe.contentWindow?.postMessage(
            {
              fromParent: true,
              type: 'command:enableTextEditing',
            },
            '*'
          );
        }, 500); // Give iframe time to fully load
      };

      iframe.addEventListener('load', enableTextEditing);
      return () => iframe.removeEventListener('load', enableTextEditing);
    }
  }, [editingMode]);

  return (
    <div className="relative h-full w-full">
      {/* Iframe */}
      <iframe
        ref={iframeRef}
        srcDoc={generateHtml()}
        className="w-full h-[calc(100vh-3.5rem)] border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Page Preview"
      />
    </div>
  );
}

// Not in use, deprecated version
const textEditingBridgeScriptOld = `
<script>
(function () {
  // Don't initialize if already initialized
  if (window.textEditingInitialized) return;
  window.textEditingInitialized = true;

  // Inherit base bridge functionality
  function send(type, payload, requestId) {
    try { 
      parent.postMessage({ 
        weblyIframe: true, 
        type: type, 
        payload: payload || null, 
        requestId: requestId || null 
      }, '*'); 
    } catch(e) {
      console.warn('Bridge send error:', e);
    }
  }

  // Text editing specific functionality
  let textEditingMode = false;
  let textChangedElements = new Set();
  let debounceTimer = null;

  function initializeTextEditing() {
    if (textEditingMode) return; // Already initialized
    textEditingMode = true;
    
    console.log('Initializing text editing mode');

    // Set up text change listeners with better event handling
    document.addEventListener('input', handleTextInput, true);
    document.addEventListener('blur', handleTextBlur, true);
    document.addEventListener('paste', handleTextPaste, true);
    document.addEventListener('focus', handleTextFocus, true);

    // Add placeholders for empty editable elements
    document.querySelectorAll('[data-text-editable="true"]').forEach(element => {
      if (!element.textContent.trim()) {
        element.setAttribute('data-placeholder', 'Click to edit...');
      }
    });

    send('response:textEditingEnabled', { success: true });
  }

  function handleTextFocus(e) {
    const element = e.target;
    if (!element.hasAttribute('data-key')) return;
    
    // Clear placeholder styling on focus
    element.style.opacity = '1';
  }

  function handleTextInput(e) {
    const element = e.target;
    if (!element.hasAttribute('data-key')) return;

    textChangedElements.add(element.getAttribute('data-key'));
    
    // Debounce text change notifications
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sendTextChanges();
    }, 300);
  }

  function handleTextBlur(e) {
    const element = e.target;
    if (!element.hasAttribute('data-key')) return;
    
    // Send immediate update on blur
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    sendTextChanges();
  }

  function handleTextPaste(e) {
    const element = e.target;
    if (!element.hasAttribute('data-key')) return;

    // Allow paste but clean it up
    setTimeout(() => {
      // Clean up pasted content - remove unwanted formatting
      const text = element.textContent || '';
      if (text !== element.textContent) {
        element.textContent = text;
      }
      
      textChangedElements.add(element.getAttribute('data-key'));
      sendTextChanges();
    }, 10);
  }

  function sendTextChanges() {
    if (textChangedElements.size === 0) return;

    const changes = {};
    textChangedElements.forEach(dataKey => {
      const element = document.querySelector(\`[data-key="\${dataKey}"]\`);
      if (element) {
        changes[dataKey] = element.textContent || '';
      }
    });

    send('text:changed', { changes });
    textChangedElements.clear();
  }

  // Listen for parent messages
  window.addEventListener('message', (e) => {
    try {
      const data = e.data;
      if (!data || !data.fromParent) return;

      if (data.type === 'command:enableTextEditing') {
        initializeTextEditing();
      }

      if (data.type === 'command:updateText') {
        const { dataKey, newText } = data.payload || {};
        if (dataKey) {
          const element = document.querySelector(\`[data-key="\${dataKey}"]\`);
          if (element) {
            element.textContent = newText || '';
            send('response:textUpdated', { dataKey, success: true });
          }
        }
      }
    } catch (err) {
      console.warn('Text editing bridge error:', err);
    }
  });

  // Auto-initialize if elements are already present
  function checkAndInitialize() {
    if (document.querySelector('[data-text-editable="true"]')) {
      initializeTextEditing();
    }
  }

  // Initialize based on document state
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', checkAndInitialize);
  } else {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(checkAndInitialize, 100);
  }
})();
<\/script>
`;
