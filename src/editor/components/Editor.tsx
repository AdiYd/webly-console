'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EditorProvider, useEditor } from '../context/EditorContext';
import { EditorNavigation } from './layout/EditorNavigation';
import { LeftSidebar } from './layout/LeftSidebar';
import { RightDrawer } from './layout/RightDrawer';
import { ChatInterface } from './chat/ChatInterface';
import { EnhancedPageParser } from './parser/EnhancedPageParser';
import { ResizeHandle } from './layout/ResizeHandle';

interface EditorProps {
  className?: string;
}

function EditorContent() {
  const { state, actions } = useEditor();
  const { chatVisible, chatWidth, leftDrawerOpen, rightDrawerOpen, editingMode, isLoading } = state;

  const handleChatResize = (newWidth: number) => {
    actions.setChatWidth(Math.max(300, Math.min(600, newWidth)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-base-100 overflow-hidden">
      {/* Top Navigation */}
      <EditorNavigation />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <AnimatePresence>
          {leftDrawerOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 bg-base-200 border-r border-base-300 shadow-lg z-20"
            >
              <LeftSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Page Parser Area */}
          <motion.div
            className="flex-1 bg-base-50 relative overflow-hidden"
            layout="position"
            layoutDependency={[leftDrawerOpen, rightDrawerOpen, chatVisible, chatWidth]}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              width: chatVisible ? `calc(100% - ${chatWidth}px)` : '100%',
            }}
          >
            <div className="h-full p-2 overflow-auto">
              <EnhancedPageParser />
            </div>
          </motion.div>

          {/* Resize Handle */}
          {chatVisible && (
            <ResizeHandle
              onResize={handleChatResize}
              direction="horizontal"
              className="w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize"
            />
          )}

          {/* Chat Interface */}
          <AnimatePresence>
            {chatVisible && (
              <motion.div
                initial={{ x: chatWidth, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: chatWidth, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-base-100 border-l border-base-300 shadow-lg flex flex-col"
                style={{ width: chatWidth, minWidth: 300, maxWidth: 600 }}
              >
                <ChatInterface />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Drawer */}
        <AnimatePresence>
          {rightDrawerOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 bg-base-200 border-l border-base-300 shadow-lg z-20"
            >
              <RightDrawer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {state.isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-base-content/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="card bg-base-100 shadow-xl p-6">
              <div className="flex items-center gap-4">
                <div className="loading loading-spinner loading-md text-primary"></div>
                <span className="text-lg font-medium">Saving changes...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Editor({ className }: EditorProps) {
  return (
    <EditorProvider>
      <div className={`webly-editor ${className || ''}`}>
        <EditorContent />
      </div>
    </EditorProvider>
  );
}
