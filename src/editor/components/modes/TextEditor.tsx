'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';

export function TextEditor() {
  const { state, actions } = useEditor();
  const [localContent, setLocalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { selectedSectionId, currentPage } = state;
  const selectedSection = currentPage.sections.find(s => s.id === selectedSectionId);

  useEffect(() => {
    if (selectedSection?.src?.html) {
      // Extract text content from HTML (simplified)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedSection.src.html;
      setLocalContent(tempDiv.textContent || tempDiv.innerText || '');
    }
  }, [selectedSection]);

  const handleSave = () => {
    if (!selectedSectionId || !selectedSection) return;

    // TODO: Update the actual HTML with the new text content
    // This is a simplified implementation
    actions.updateSection(selectedSectionId, {
      ...selectedSection,
      src: {
        ...selectedSection.src,
        html:
          selectedSection.src?.html?.replace(/>(.*?)</g, `>${localContent}<`) ||
          `<div>${localContent}</div>`,
      },
    });

    setIsEditing(false);
    actions.saveToHistory();
  };

  const handleCancel = () => {
    if (selectedSection?.src?.html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = selectedSection.src.html;
      setLocalContent(tempDiv.textContent || tempDiv.innerText || '');
    }
    setIsEditing(false);
  };

  if (!selectedSectionId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon icon="mdi:format-text" className="text-6xl text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">Text Editor</h3>
          <p className="text-base-content/60">Select a section to edit its text content</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Editing: {selectedSection?.section_name}</h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="btn btn-ghost btn-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary btn-sm">
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm gap-2">
              <Icon icon="mdi:pencil" />
              Edit Text
            </button>
          )}
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Text Content</span>
        </label>
        <textarea
          value={localContent}
          onChange={e => setLocalContent(e.target.value)}
          className="textarea textarea-bordered h-64"
          placeholder="Enter your text content here..."
          disabled={!isEditing}
        />
      </div>

      {isEditing && (
        <div className="alert alert-info">
          <Icon icon="mdi:information" />
          <span>Changes will be applied to the selected section when you save.</span>
        </div>
      )}
    </motion.div>
  );
}
