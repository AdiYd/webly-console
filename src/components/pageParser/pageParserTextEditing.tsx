'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor } from '@/editor/context/EditorContext';
import { getPageHtml, textEditingBridgeScript } from './pageParser';
import {
  preparePageForTextEditing,
  finalizePageFromTextEditing,
  TextContentMap,
} from './TextEditorParser';
import { Icon } from '../ui/icon';

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

  // Generate HTML with text editing capabilities
  const generateHtml = useCallback(() => {
    const pageToRender =
      editingMode === 'text' && preparedPageData.current
        ? preparedPageData.current.modifiedPage
        : currentPage;

    // Pass the textEditing flag to enable text editing mode
    return getPageHtml(pageToRender, theme, daisyTheme, editingMode === 'text');
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
          console.log('Text editing enabled successfully');
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

  // Save changes function with better error handling
  const saveTextChanges = useCallback(() => {
    if (editingMode !== 'text' || !preparedPageData.current) return;

    try {
      const finalizedPage = finalizePageFromTextEditing(
        preparedPageData.current.modifiedPage,
        textContentMap
      );

      // Update the current page with finalized content
      actions.updateCurrentPage(finalizedPage);
      actions.saveToHistory();

      // Switch back to preview mode
      actions.setEditingMode('preview');
    } catch (error) {
      console.error('Error saving text changes:', error);
      // Could show a toast notification here
    }
  }, [editingMode, textContentMap, actions]);

  return (
    <div className="relative h-full w-full">
      {/* Text Editing Controls */}
      {editingMode === 'text' && (
        <div className="absolute top-12 right-8 z-10 flex justify-center gap-2">
          <button
            className="btn btn-sm btn-neutral"
            onClick={saveTextChanges}
            disabled={!isTextEditingEnabled}
          >
            Save Changes
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => actions.setEditingMode('preview')}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Debug info for text changes */}
      {editingMode === 'text' && Object.keys(textContentMap).length > 0 && (
        <div className="absolute top-20 right-4 z-10 w-64 overflow-y-auto">
          <div className="card card-compact !bg-gray-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-zinc-900 text-sm">
                Text Changes (
                {
                  Object.entries(textContentMap).filter(
                    ([_, data]) => data.currentText !== data.originalText
                  ).length
                }
                )
              </h3>
              <div className="text-xs space-y-1">
                {Object.entries(textContentMap)
                  .filter(([_, data]) => data.currentText !== data.originalText)
                  .slice(-5)
                  .reverse()
                  .map(([key, data]) => (
                    <div key={key} className="truncate flex items-center">
                      {/* <span className="font-mono text-xs opacity-60">{key.slice(-8)}:</span> */}
                      <Icon icon="mdi:check" className="inline-block w-4 h-4 text-success" />
                      <span className="ml-1 text-zinc-800">{data.currentText}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
