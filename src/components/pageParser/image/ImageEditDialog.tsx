'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';

interface ImageEditDialogProps {
  image: {
    dataKey: string;
    src: string;
    alt: string;
    classNames: string;
    elementType: string;
  };
  onSubmit: (updates: { src: string; alt: string; classNames: string }) => void;
  onCancel: () => void;
}

const borderRadiusOptions = [
  { label: 'None', value: 'rounded-none' },
  { label: 'Small', value: 'rounded-sm' },
  { label: 'Medium', value: 'rounded-md' },
  { label: 'Large', value: 'rounded-lg' },
  { label: 'XL', value: 'rounded-xl' },
  { label: '2XL', value: 'rounded-2xl' },
  { label: 'Full', value: 'rounded-full' },
];

const shadowOptions = [
  { label: 'None', value: 'shadow-none' },
  { label: 'Small', value: 'shadow-sm' },
  { label: 'Medium', value: 'shadow-md' },
  { label: 'Large', value: 'shadow-lg' },
  { label: 'XL', value: 'shadow-xl' },
  { label: '2XL', value: 'shadow-2xl' },
];

const aspectRatioOptions = [
  { label: 'Auto', value: '' },
  { label: 'Square', value: 'aspect-square' },
  { label: '16:9', value: 'aspect-video' },
  { label: '4:3', value: 'aspect-[4/3]' },
  { label: '3:2', value: 'aspect-[3/2]' },
  { label: '21:9', value: 'aspect-[21/9]' },
];

export function ImageEditDialog({ image, onSubmit, onCancel }: ImageEditDialogProps) {
  const [currentSrc, setCurrentSrc] = useState(image.src);
  const [currentAlt, setCurrentAlt] = useState(image.alt);
  const [currentClasses, setCurrentClasses] = useState(image.classNames);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse current classes to extract specific properties
  const getCurrentRounded = useCallback(() => {
    const match = currentClasses.match(/rounded-[\w-]+/);
    return match ? match[0] : 'rounded-none';
  }, [currentClasses]);

  const getCurrentShadow = useCallback(() => {
    const match = currentClasses.match(/shadow-[\w-]+|shadow-none/);
    return match ? match[0] : 'shadow-none';
  }, [currentClasses]);

  const getCurrentAspectRatio = useCallback(() => {
    const match = currentClasses.match(/aspect-[\w\[\]\/]+/);
    return match ? match[0] : '';
  }, [currentClasses]);

  // Update class string with new property
  const updateClassProperty = useCallback(
    (oldClass: string, newClass: string) => {
      let updatedClasses = currentClasses;

      // Remove old class if it exists
      if (oldClass) {
        updatedClasses = updatedClasses.replace(new RegExp(`\\b${oldClass}\\b`, 'g'), '').trim();
      }

      // Add new class if not empty
      if (newClass) {
        updatedClasses = `${updatedClasses} ${newClass}`.trim();
      }

      // Clean up multiple spaces
      updatedClasses = updatedClasses.replace(/\s+/g, ' ');

      setCurrentClasses(updatedClasses);
    },
    [currentClasses]
  );

  const handleRoundedChange = (newRounded: string) => {
    updateClassProperty(getCurrentRounded(), newRounded);
  };

  const handleShadowChange = (newShadow: string) => {
    updateClassProperty(getCurrentShadow(), newShadow);
  };

  const handleAspectRatioChange = (newAspectRatio: string) => {
    updateClassProperty(getCurrentAspectRatio(), newAspectRatio);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);

      // Create a preview URL for the uploaded file
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setCurrentSrc(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = () => {
    onSubmit({
      src: currentSrc,
      alt: currentAlt,
      classNames: currentClasses,
    });
  };

  // Generate preview classes for the dialog
  const previewClasses = `max-w-full max-h-64 object-cover ${currentClasses}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon icon="mdi:image-edit" className="w-6 h-6" />
              Edit {image.elementType === 'img' ? 'Image' : 'Video'}
            </h2>
            <button onClick={onCancel} className="btn btn-ghost btn-sm btn-circle">
              <Icon icon="mdi:close" className="w-4 h-4" />
            </button>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Preview</label>
            <div className="border border-base-300 rounded-lg p-4 bg-base-50 flex justify-center">
              {image.elementType === 'img' ? (
                <img src={currentSrc} alt={currentAlt} className={previewClasses} />
              ) : (
                <video src={currentSrc} className={previewClasses} controls />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Source URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentSrc}
                  onChange={e => setCurrentSrc(e.target.value)}
                  placeholder="Enter image/video URL"
                  className="input input-bordered flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={image.elementType === 'img' ? 'image/*' : 'video/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon icon="mdi:upload" className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Alt Text (for images only) */}
            {image.elementType === 'img' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Alt Text</label>
                <input
                  type="text"
                  value={currentAlt}
                  onChange={e => setCurrentAlt(e.target.value)}
                  placeholder="Describe the image"
                  className="input input-bordered w-full"
                />
              </div>
            )}

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium mb-2">Border Radius</label>
              <select
                value={getCurrentRounded()}
                onChange={e => handleRoundedChange(e.target.value)}
                className="select select-bordered w-full"
              >
                {borderRadiusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Shadow */}
            <div>
              <label className="block text-sm font-medium mb-2">Shadow</label>
              <select
                value={getCurrentShadow()}
                onChange={e => handleShadowChange(e.target.value)}
                className="select select-bordered w-full"
              >
                {shadowOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
              <select
                value={getCurrentAspectRatio()}
                onChange={e => handleAspectRatioChange(e.target.value)}
                className="select select-bordered w-full"
              >
                {aspectRatioOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Classes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Custom Classes</label>
              <textarea
                value={currentClasses}
                onChange={e => setCurrentClasses(e.target.value)}
                placeholder="Additional Tailwind classes"
                className="textarea textarea-bordered w-full h-20"
              />
              <div className="text-xs text-base-content/60 mt-1">
                Current classes: {currentClasses || 'None'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-300">
            <button onClick={onCancel} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn btn-primary">
              <Icon icon="mdi:check" className="w-4 h-4 mr-1" />
              Apply Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
