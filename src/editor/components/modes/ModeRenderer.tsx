'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import { TextEditor } from '../modes/TextEditor';
import { ImageEditor } from '../modes/ImageEditor';
import { ThemeEditor } from './ThemeEditor';
import { LayoutEditor } from '../modes/LayoutEditor';
import { AIEditor } from '../modes/AIEditor';
import { Icon } from '@/components/ui/icon';

export function ModeRenderer() {
  const { state } = useEditor();
  const { editingMode, selectedSectionId } = state;

  const renderModeContent = () => {
    switch (editingMode) {
      case 'text':
        return <TextEditor />;
      case 'image':
        return <ImageEditor />;
      case 'theme':
        return <ThemeEditor />;
      case 'layout':
        return <LayoutEditor />;
      case 'ai':
        return <AIEditor />;
      case 'preview':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Icon icon="mdi:eye" className="text-6xl text-base-content/30 mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">Preview Mode</h3>
            <p className="text-base-content/60 mb-4">
              Switch to an editing mode to start customizing your website
            </p>
            <div className="text-sm text-base-content/40">
              Click on a section and choose an editing mode from the navigation bar
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={editingMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-auto"
        >
          {renderModeContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
