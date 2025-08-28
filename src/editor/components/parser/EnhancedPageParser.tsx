'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageParser from '@/components/pageParser/pageParser';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';
import { stat } from 'fs';
import { TextEditingPageParser } from '@/components/pageParser/text/pageParserTextEditing';
import { ImageEditingPageParser } from '@/components/pageParser/image/pageParserImageEditing';

export function EnhancedPageParser() {
  const { state, actions } = useEditor();
  const [isEditingOverlayVisible, setIsEditingOverlayVisible] = useState(false);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [editingOverlays, setEditingOverlays] = useState<{ [key: string]: HTMLElement }>({});
  const parserRef = useRef<HTMLDivElement>(null);

  const { currentPage, theme, daisyTheme, editingMode, selectedSectionId, isEditing } = state;
  // Show editing overlays when in editing mode
  useEffect(() => {
    if (editingMode !== 'preview') {
      setIsEditingOverlayVisible(true);
      // TODO: Add section highlighting logic here
    } else {
      setIsEditingOverlayVisible(false);
      setHoveredSectionId(null);
    }
  }, [editingMode]);

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      if (editingMode !== 'preview') {
        actions.setSelectedSection(sectionId === selectedSectionId ? null : sectionId, true);
      }
    },
    [editingMode, selectedSectionId, actions]
  );

  const handleSectionEdit = useCallback(
    (sectionId: string) => {
      actions.setSelectedSection(sectionId, true);
      actions.setIsEditing(true);

      // TODO: Open appropriate editing modal/drawer based on editing mode
      console.log(`Edit section ${sectionId} in ${editingMode} mode`);
    },
    [editingMode, actions]
  );

  let parser = <PageParser />;
  switch (editingMode) {
    case 'text':
      parser = <TextEditingPageParser />;
      break;
    case 'image':
      parser = <ImageEditingPageParser />;
      break;
    default:
      break;
  }

  const renderEditingOverlays = () => {
    if (!isEditingOverlayVisible) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {currentPage.sections.map((section, index) => {
          const sectionId = section.id || `section-${index}`;
          const isSelected = selectedSectionId === sectionId;
          const isHovered = hoveredSectionId === sectionId;

          return (
            <motion.div
              key={sectionId}
              className={`absolute border-2 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : isHovered
                  ? 'border-secondary bg-secondary/5'
                  : 'border-transparent'
              }`}
              style={{
                // This would need to be calculated based on the actual section position
                // For now, we'll use a simple grid layout
                top: `${index * 20}%`,
                left: '5%',
                right: '5%',
                height: '15%',
                pointerEvents: editingMode !== 'preview' ? 'auto' : 'none',
              }}
              onClick={() => handleSectionClick(sectionId)}
              onMouseEnter={() => setHoveredSectionId(sectionId)}
              onMouseLeave={() => setHoveredSectionId(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Section Label */}
              {(isSelected || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-8 left-0 bg-base-100 border border-base-300 rounded-lg px-3 py-1 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-base-content">
                      {section.section_name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSectionEdit(sectionId);
                        }}
                        className="btn btn-ghost btn-xs btn-square"
                        title="Edit section"
                      >
                        <Icon icon="mdi:pencil" className="text-xs" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          // TODO: Duplicate section
                          console.log('Duplicate section', sectionId);
                        }}
                        className="btn btn-ghost btn-xs btn-square"
                        title="Duplicate section"
                      >
                        <Icon icon="mdi:content-copy" className="text-xs" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Editing Mode Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 bg-primary text-primary-content rounded-full p-2"
                >
                  <Icon icon={getEditingModeIcon(editingMode)} className="text-sm" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`relative ${
        state.screenMode === 'mobile'
          ? 'max-w-sm mx-auto rounded-3xl border-base-content/80 border-2 ring-2 ring-base-content/80 shadow-xl overflow-hidden'
          : ''
      }`}
    >
      {/* Page Parser Container */}
      <div ref={parserRef} className="relative">
        {state.screenMode === 'mobile' && (
          <div className="absolute z-[200] top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-[10px] border-black"></div>
        )}
        {parser}

        {/* Editing Overlays */}
        {/* {renderEditingOverlays()} */}
      </div>

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}
    </div>
  );
}

function getEditingModeIcon(mode: string): string {
  switch (mode) {
    case 'text':
      return 'mdi:format-text';
    case 'image':
      return 'mdi:image';
    case 'theme':
      return 'mdi:palette';
    case 'layout':
      return 'mdi:view-grid';
    case 'ai':
      return 'mdi:robot';
    default:
      return 'mdi:eye';
  }
}
