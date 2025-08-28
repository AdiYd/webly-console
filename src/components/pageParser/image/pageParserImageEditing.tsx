'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor } from '@/editor/context/EditorContext';
import { getPageHtml } from '../pageParser';
import {
  preparePageForImageEditing,
  finalizePageFromImageEditing,
  ImageContentMap,
} from './ImageEditorParser';
import { ImageEditDialog } from './ImageEditDialog';

export const imageEditingBridgeScript = `
<script>
(function () {
  if (window.imageEditingInitialized) return;
  window.imageEditingInitialized = true;
  

  function send(type, payload, requestId) {
    try { 
      parent.postMessage({ 
        weblyIframe: true, 
        type: type, 
        payload: payload || null, 
        requestId: requestId || null 
      }, '*'); 
    } catch(e) {
      console.warn('Image bridge send error:', e);
    }
  }

  let imageEditingMode = false;
  let weblyMutationObserver = null;
  let weblyCaptureClickHandler = null;

  function initializeImageEditing() {
    if (imageEditingMode) return;
    imageEditingMode = true;
    
    console.log('Initializing image editing mode');

    // Add event listeners for image interactions
    document.addEventListener('click', handleImageClick, true);
    document.addEventListener('mouseover', handleImageHover, true);
    document.addEventListener('mouseout', handleImageOut, true);

    // Disable interactive elements except images
    disableNonImageElements();

    // Observe DOM changes
    try {
      weblyMutationObserver = new MutationObserver(muts => {
        muts.forEach(m => {
          if (m.addedNodes && m.addedNodes.length) {
            setTimeout(() => disableNonImageElements(m.addedNodes), 10);
          }
        });
      });
      weblyMutationObserver.observe(document.body || document.documentElement, { 
        childList: true, 
        subtree: true 
      });
    } catch (err) {
      console.warn('MutationObserver failed:', err);
    }

    // Add capture-phase click handler
    weblyCaptureClickHandler = function(e) {
      try {
        const tgt = e.target;
        if (!tgt || !tgt.closest) return;
        
        // Allow clicks on editable images
        if (tgt.closest('[data-image-editable="true"]')) return;
        
        // Block other clicks
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

    send('response:imageEditingEnabled', { success: true });
  }

  function teardownImageEditing() {
    if (!imageEditingMode) return;
    imageEditingMode = false;

    document.removeEventListener('click', handleImageClick, true);
    document.removeEventListener('mouseover', handleImageHover, true);
    document.removeEventListener('mouseout', handleImageOut, true);

    restoreNonImageElements();

    try {
      if (weblyMutationObserver) {
        weblyMutationObserver.disconnect();
        weblyMutationObserver = null;
      }
    } catch (err) {}

    try {
      if (weblyCaptureClickHandler) {
        document.removeEventListener('click', weblyCaptureClickHandler, true);
        weblyCaptureClickHandler = null;
      }
    } catch (err) {}

    // Remove all image editing overlays
    document.querySelectorAll('.webly-image-overlay').forEach(el => el.remove());

    send('response:imageEditingDisabled', { success: true });
  }

  function isEditableImage(el) {
    return !!(el && el.hasAttribute && el.hasAttribute('data-image-editable'));
  }

  function disableNonImageElements(onlyNodes) {
    const selector = 'a[href], a:not([href])[onclick], button, input, select, textarea, [role="button"], [onclick]';
    const nodes = onlyNodes ? Array.from(onlyNodes) : [document];
    
    nodes.forEach(root => {
      try {
        const scope = (root.nodeType === 1 || root.nodeType === 9) ? root : document;
        const els = Array.from(scope.querySelectorAll ? scope.querySelectorAll(selector) : []);
        
        els.forEach(el => {
          try {
            // Don't disable elements inside editable images or that are already disabled
            if (isEditableImage(el) || isEditableImage(el.closest('[data-image-editable="true"]'))) return;
            if (el.getAttribute && el.getAttribute('data-webly-disabled') === 'true') return;

            el.setAttribute('data-webly-disabled', 'true');
            
            const tag = (el.tagName || '').toLowerCase();
            if (tag === 'a') {
              const href = el.getAttribute('href') || '';
              el.setAttribute('data-webly-href', href);
              if (href) el.removeAttribute('href');
              el.setAttribute('aria-disabled', 'true');
              el.classList.add('webly-disabled');
            } else {
              if ('disabled' in el) {
                el.setAttribute('data-webly-old-disabled', el.disabled ? 'true' : 'false');
                try { el.disabled = true; } catch (err) {}
              } else {
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

  function restoreNonImageElements() {
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
      console.warn('restoreNonImageElements error', err);
    }
  }

  function handleImageHover(e) {
    const element = e.target;
    if (!isEditableImage(element)) return;
    
    element.style.transform = 'scale(1.05)';
    element.style.border = '3px solid #3B82F6';
    element.style.transition = 'all 0.2s ease';
    element.style.zIndex = '1000';
    element.style.position = 'relative';
    
    showImageOverlay(element);
  }

  function handleImageOut(e) {
    const element = e.target;
    if (!isEditableImage(element)) return;
    
    element.style.transform = '';
    element.style.border = '';
    element.style.transition = '';
    element.style.zIndex = '';
    element.style.position = '';
    
    // Remove overlay
    removeImageOverlay(element);
  }

  function handleImageClick(e) {
    const element = e.target;
    
    // Check if clicked on edit button
    if (element.classList.contains('webly-edit-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const imageElement = element.closest('[data-image-editable="true"]');
      if (imageElement) {
        openImageEditor(imageElement);
      }
      return false;
    }
    
    // Check if clicked on editable image
    if (isEditableImage(element)) {
      e.preventDefault();
      e.stopPropagation();
      openImageEditor(element);
      return false;
    }
  }

  function showImageOverlay(element) {
    // Remove existing overlay
    removeImageOverlay(element);
    
    const overlay = document.createElement('div');
    overlay.className = 'webly-image-overlay';
    overlay.style.cssText = \`
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 1001;
      pointer-events: auto;
    \`;
    
    const editBtn = document.createElement('button');
    editBtn.className = 'webly-edit-btn';
    editBtn.innerHTML = '+';
    editBtn.style.cssText = \`
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #3B82F6;
      color: white;
      border: none;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transition: all 0.2s ease;
    \`;
    
    editBtn.addEventListener('mouseenter', () => {
      editBtn.style.transform = 'scale(1.1)';
      editBtn.style.background = '#2563EB';
    });
    
    editBtn.addEventListener('mouseleave', () => {
      editBtn.style.transform = 'scale(1)';
      editBtn.style.background = '#3B82F6';
    });
    
    overlay.appendChild(editBtn);
    element.appendChild(overlay);
  }

  function removeImageOverlay(element) {
    const existing = element.querySelector('.webly-image-overlay');
    if (existing) {
      existing.remove();
    }
  }

  function openImageEditor(element) {
    const dataKey = element.getAttribute('data-key');
    const src = element.getAttribute('src') || element.getAttribute('poster') || '';
    const alt = element.getAttribute('alt') || '';
    const classNames = element.className || '';
    const elementType = element.tagName.toLowerCase();
    
    send('image:editRequest', {
      dataKey,
      src,
      alt,
      classNames,
      elementType
    });
  }

  // Listen for parent messages
  window.addEventListener('message', (e) => {
    try {
      const data = e.data;
      if (!data || !data.fromParent) return;

      if (data.type === 'command:enableImageEditing') {
        initializeImageEditing();
      }

      if (data.type === 'command:disableImageEditing') {
        teardownImageEditing();
      }

      if (data.type === 'command:updateImage') {
        const { dataKey, updates } = data.payload || {};
        if (dataKey) {
          const element = document.querySelector(\`[data-key="\${dataKey}"]\`);
          if (element) {
            if (updates.src) element.src = updates.src;
            if (updates.alt && element.tagName.toLowerCase() === 'img') {
              element.alt = updates.alt;
            }
            if (updates.classNames) element.className = updates.classNames;
            send('response:imageUpdated', { dataKey, success: true });
          }
        }
      }
    } catch (err) {
      console.warn('Image editing bridge error:', err);
    }
  });

  // Auto-initialize if elements are already present
  function checkAndInitialize() {
    if (document.querySelector('[data-image-editable="true"]')) {
      initializeImageEditing();
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', checkAndInitialize);
  } else {
    setTimeout(checkAndInitialize, 100);
  }
})();
<\/script>
<style>
    /* Image editing styles */

    .webly-image-editing {
        position: relative;
    }
    .webly-image-editing::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 999;
        pointer-events: none;
        }

        .webly-image-editing [data-image-editable="true"] {
        position: relative;
        z-index: 1000;
        cursor: pointer !important;
        transition: all 0.2s ease;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        border-radius: 8px;
        }

        .webly-image-editing [data-image-editable="true"]:hover {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.8);
        transform: scale(1.02);
        }

        .webly-image-editing *:not([data-image-editable="true"]) {
        position: relative;
        z-index: 998;
        }

        .webly-image-editing [data-image-editable="true"] {
        cursor: pointer;
        transition: all 0.2s ease;
        }

    .webly-image-editing [data-image-editable="true"]:hover {
    opacity: 0.9;
    }

    .webly-image-editing *:not([data-image-editable="true"]) {
    opacity: 0.7;
    pointer-events: none;
    }

    .webly-image-editing [data-image-editable="true"] {
    opacity: 1 !important;
    pointer-events: auto !important;
    }
  </style>
`;

export function ImageEditingPageParser() {
  const { state, actions } = useEditor();
  const { currentPage, theme, daisyTheme, editingMode } = state;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [imageContentMap, setImageContentMap] = useState<ImageContentMap>({});
  const [isImageEditingEnabled, setIsImageEditingEnabled] = useState(false);
  const [editingImage, setEditingImage] = useState<{
    dataKey: string;
    src: string;
    alt: string;
    classNames: string;
    elementType: string;
  } | null>(null);

  // Prepare page for image editing when mode changes
  const preparedPageData = useRef<{
    modifiedPage: any;
    imageContentMap: ImageContentMap;
  } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      console.log('Selected section changed:', state.selectedSectionId);
      const iframe = iframeRef.current;
      if (iframe && state.selectedSectionId) {
        const section = iframe.contentDocument?.getElementById(state.selectedSectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 500);
  }, [state.selectedSectionId]);

  useEffect(() => {
    if (editingMode === 'image') {
      const { modifiedPage, globalImageContentMap } = preparePageForImageEditing(currentPage);
      preparedPageData.current = { modifiedPage, imageContentMap: globalImageContentMap };
      setImageContentMap(globalImageContentMap);
    } else {
      preparedPageData.current = null;
      setImageContentMap({});
      setIsImageEditingEnabled(false);
    }
  }, [editingMode, currentPage]);

  // Create a stable reference to the save function
  const saveImageChanges = useCallback(() => {
    if (editingMode !== 'image' || !preparedPageData.current) return;

    try {
      const finalizedPage = finalizePageFromImageEditing(
        preparedPageData.current.modifiedPage,
        imageContentMap
      );

      actions.updateCurrentPage(finalizedPage);
      actions.saveToHistory();

      console.log('Image changes saved successfully');
    } catch (error) {
      console.error('Error saving image changes:', error);
    }
  }, [editingMode, imageContentMap, actions]);

  // Register save callback when entering image mode
  useEffect(() => {
    if (editingMode === 'image') {
      actions.setImageEditorSaveCallback(saveImageChanges);
    } else {
      actions.setImageEditorSaveCallback(null);
    }

    return () => {
      actions.setImageEditorSaveCallback(null);
    };
  }, [editingMode, saveImageChanges, actions]);

  // Generate HTML with image editing capabilities
  const generateHtml = useCallback(() => {
    const pageToRender =
      editingMode === 'image' && preparedPageData.current
        ? preparedPageData.current.modifiedPage
        : currentPage;

    return getPageHtml(pageToRender, theme, daisyTheme, 'image');
  }, [currentPage, theme, daisyTheme, editingMode]);

  // Handle iframe messages
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    const { data } = event;
    if (!data?.weblyIframe) return;

    try {
      switch (data.type) {
        case 'image:editRequest':
          if (data.payload) {
            setEditingImage(data.payload);
          }
          break;

        case 'response:imageEditingEnabled':
          setIsImageEditingEnabled(true);
          break;

        case 'response:imageUpdated':
          // Handle image update confirmation
          break;

        default:
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

  // Enable image editing when iframe loads
  useEffect(() => {
    if (editingMode === 'image' && iframeRef.current && preparedPageData.current) {
      const iframe = iframeRef.current;
      const enableImageEditing = () => {
        setTimeout(() => {
          iframe.contentWindow?.postMessage(
            {
              fromParent: true,
              type: 'command:enableImageEditing',
            },
            '*'
          );
        }, 500);
      };

      iframe.addEventListener('load', enableImageEditing);
      return () => iframe.removeEventListener('load', enableImageEditing);
    }
  }, [editingMode]);

  // Handle image edit submission
  const handleImageEditSubmit = useCallback(
    (updates: { src: string; alt: string; classNames: string }) => {
      if (!editingImage) return;

      // Update local state
      setImageContentMap(prev => {
        const updated = { ...prev };
        if (updated[editingImage.dataKey]) {
          updated[editingImage.dataKey] = {
            ...updated[editingImage.dataKey],
            currentSrc: updates.src,
            currentAlt: updates.alt,
            currentClasses: updates.classNames,
          };
        }
        return updated;
      });

      // Send update to iframe
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.contentWindow?.postMessage(
          {
            fromParent: true,
            type: 'command:updateImage',
            payload: {
              dataKey: editingImage.dataKey,
              updates,
            },
          },
          '*'
        );
      }

      setEditingImage(null);
    },
    [editingImage]
  );

  return (
    <div className="relative h-full w-full">
      {/* Iframe */}
      <iframe
        ref={iframeRef}
        srcDoc={generateHtml()}
        className="w-full h-[calc(100vh-3.5rem)] border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Page Preview - Image Editing"
      />

      {/* Image Edit Dialog */}
      {editingImage && (
        <ImageEditDialog
          image={editingImage}
          onSubmit={handleImageEditSubmit}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </div>
  );
}
          image={editingImage}
          onSubmit={handleImageEditSubmit}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </div>
  );
}
