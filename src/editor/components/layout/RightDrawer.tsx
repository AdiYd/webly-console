'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';
import { ModeRenderer } from '../modes/ModeRenderer';
import { set } from 'zod';

export function RightDrawer() {
  const {
    state,
    actions: { setRightDrawer },
  } = useEditor();
  const [activeTab, setActiveTab] = useState<'editor' | 'properties' | 'assets'>('editor');

  const tabs = [
    { id: 'editor' as const, label: 'Editor', icon: 'mdi:pencil' },
    { id: 'properties' as const, label: 'Properties', icon: 'mdi:tune' },
    { id: 'assets' as const, label: 'Assets', icon: 'mdi:folder-image' },
  ];

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg flex justify-between items-center font-semibold text-base-content">
          Inspector
          <Icon
            title="close drawer"
            className="btn btn-ghost btn-sm"
            icon="mdi:close"
            onClick={() => setRightDrawer(false)}
          />
        </h2>
        <p className="text-sm text-base-content/60 mt-1">
          {state.selectedSectionId ? 'Section selected' : 'No selection'}
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            <Icon icon={tab.icon} className="text-sm" />
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4"
        >
          {activeTab === 'editor' && <ModeRenderer />}
          {activeTab === 'properties' && <PropertiesPanel />}
          {activeTab === 'assets' && <AssetsPanel />}
        </motion.div>
      </div>
    </div>
  );
}

function PropertiesPanel() {
  const { state } = useEditor();
  const { selectedSectionId, currentPage } = state;

  const selectedSection = currentPage.sections.find(s => s.id === selectedSectionId);

  if (!selectedSection) {
    return (
      <div className="text-center py-8">
        <Icon
          icon="mdi:cursor-default-click"
          className="text-4xl text-base-content/30 mx-auto mb-4"
        />
        <p className="text-sm text-base-content/60">Select a section to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Section Name</span>
        </label>
        <input
          type="text"
          value={selectedSection.section_name}
          className="input input-bordered input-sm"
          onChange={e => {
            // TODO: Update section name
            console.log('Update section name:', e.target.value);
          }}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Description</span>
        </label>
        <textarea
          value={selectedSection.section_description || ''}
          className="textarea textarea-bordered textarea-sm"
          rows={5}
          onChange={e => {
            // TODO: Update section description
            console.log('Update section description:', e.target.value);
          }}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Section ID</span>
        </label>
        <input
          type="text"
          value={selectedSection.id || ''}
          className="input input-bordered input-sm"
          onChange={e => {
            // TODO: Update section ID
            console.log('Update section ID:', e.target.value);
          }}
        />
      </div>

      {selectedSection.used_assets && selectedSection.used_assets.length > 0 && (
        <div>
          <label className="label">
            <span className="label-text font-medium">Used Assets</span>
          </label>
          <div className="">
            {selectedSection.used_assets.map((asset, index) => (
              <img
                key={index}
                src={asset}
                alt={`Image ${index + 1}`}
                className="w-full h-auto rounded-lg"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetsPanel() {
  const { state } = useEditor();
  const { website } = state;
  const [expand, setExpand] = useState({
    images: false,
    videos: false,
    icons: false,
  });

  return (
    <div className="space-y-4">
      {/* Images */}
      <div>
        <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
          <Icon icon="mdi:image" />
          Images ({website.resources?.images?.length || 0})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {website.resources?.images?.slice(0, expand.images ? -1 : 6).map((image, index) => (
            <div key={index} className="aspect-square bg-base-300 rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={image.title || `Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
        <button
          className="btn btn-ghost btn-sm w-full mt-2"
          onClick={() => setExpand(prev => ({ ...prev, images: !prev.images }))}
        >
          {expand.images ? 'View Less Images' : 'View All Images'}
        </button>
      </div>

      {/* Videos */}
      <div>
        <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
          <Icon icon="mdi:video" />
          Videos ({website.resources?.videos?.length || 0})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {website.resources?.videos?.slice(0, expand.videos ? -1 : 4).map((video, index) => (
            <div key={index} className="aspect-video bg-base-300 rounded-lg overflow-hidden">
              <video
                src={video.url}
                title={video.title || `Video ${index + 1}`}
                className="w-full h-full object-cover"
                loop
                controlsList="nodownload"
                onError={e => {
                  (e.target as HTMLVideoElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
        <button
          className="btn btn-ghost btn-sm w-full mt-2"
          onClick={() => setExpand(prev => ({ ...prev, videos: !prev.videos }))}
        >
          {expand.videos ? 'View Less Videos' : 'View All Videos'}
        </button>
      </div>

      {/* Icons */}
      <div>
        <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
          <Icon icon="mdi:emoticon" />
          Icons ({website.resources?.icons?.filter(icon => icon.source === 'Iconify')?.length || 0})
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {website.resources?.icons
            ?.filter(icon => icon.source === 'Iconify')
            .slice(0, expand.icons ? -1 : 4)
            .map((icon, index) => (
              <div
                key={index}
                className="aspect-square bg-base-300 rounded-lg flex items-center justify-center"
                title={icon.title}
              >
                {icon.iconId && <Icon icon={icon.iconId} className="text-xl" />}
              </div>
            ))}
        </div>
        {(website.resources?.icons?.length || 0) > 8 && (
          <button
            className="btn btn-ghost btn-sm w-full mt-2"
            onClick={() => setExpand(prev => ({ ...prev, icons: !prev.icons }))}
          >
            {expand.icons ? 'View Less Icons' : 'View All Icons'}
          </button>
        )}
      </div>

      {/* Add New Assets */}
      <div className="pt-4 border-t border-base-300">
        <button className="btn btn-primary btn-sm w-full gap-2">
          <Icon icon="mdi:plus" />
          Add New Asset
        </button>
      </div>
    </div>
  );
}
