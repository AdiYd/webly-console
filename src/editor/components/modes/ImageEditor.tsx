'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';

export function ImageEditor() {
  const { state, actions } = useEditor();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { selectedSectionId, currentPage, website } = state;
  const selectedSection = currentPage.sections.find(s => s.id === selectedSectionId);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setUploadedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const replaceImage = (newImageUrl: string) => {
    if (!selectedSectionId || !selectedSection?.src?.html) return;

    // TODO: Replace image in HTML content
    const updatedHtml = selectedSection.src.html.replace(/src="[^"]*"/g, `src="${newImageUrl}"`);

    actions.updateSection(selectedSectionId, {
      ...selectedSection,
      src: {
        ...selectedSection.src,
        html: updatedHtml,
      },
    });

    actions.saveToHistory();
  };

  if (!selectedSectionId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon icon="mdi:image" className="text-6xl text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">Image Editor</h3>
          <p className="text-base-content/60">Select a section to manage its images</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Image Editor: {selectedSection?.section_name}</h3>
      </div>

      {/* Upload Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h4 className="card-title text-base">Upload New Images</h4>

          <div className="form-control">
            <label className="label cursor-pointer border-2 border-dashed border-base-300 rounded-lg p-8 hover:border-primary transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Icon icon="mdi:cloud-upload" className="text-3xl text-base-content/50" />
                <span className="text-sm text-base-content/70">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-base-content/50">PNG, JPG, GIF up to 10MB</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {uploadedImages.map((img, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden border border-base-300"
                >
                  <img
                    src={img}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => replaceImage(img)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Images */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h4 className="card-title text-base">Available Images</h4>

          <div className="grid grid-cols-3 gap-2">
            {website.resources?.images?.slice(0, 9).map((image, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden border border-base-300"
              >
                <img
                  src={image.url}
                  alt={image.title || `Image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => replaceImage(image.url)}
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          {(website.resources?.images?.length || 0) > 9 && (
            <button className="btn btn-ghost btn-sm mt-4">
              View All Images ({website.resources?.images?.length})
            </button>
          )}
        </div>
      </div>

      {/* Image Settings */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h4 className="card-title text-base">Image Settings</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Border Radius</span>
              </label>
              <input type="range" min="0" max="20" className="range range-primary range-sm" />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Shadow</span>
              </label>
              <select className="select select-bordered select-sm">
                <option>None</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Alt Text</span>
            </label>
            <input
              type="text"
              placeholder="Describe the image for accessibility"
              className="input input-bordered input-sm"
            />
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <Icon icon="mdi:information" />
        <span>Click on any image to replace the current image in the selected section.</span>
      </div>
    </motion.div>
  );
}
