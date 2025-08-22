'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';

export function LayoutEditor() {
  const { state, actions } = useEditor();
  const [activeTab, setActiveTab] = useState<'structure' | 'spacing' | 'grid'>('structure');

  const { selectedSectionId, currentPage, website } = state;
  const selectedSection = currentPage.sections.find(s => s.id === selectedSectionId);

  const layoutOptions = [
    {
      id: 'single-column',
      name: 'Single Column',
      icon: 'mdi:view-agenda',
      preview: 'Simple vertical layout',
    },
    {
      id: 'two-column',
      name: 'Two Columns',
      icon: 'mdi:view-column',
      preview: 'Side-by-side content',
    },
    {
      id: 'three-column',
      name: 'Three Columns',
      icon: 'mdi:view-grid',
      preview: 'Triple column layout',
    },
    {
      id: 'hero-centered',
      name: 'Hero Centered',
      icon: 'mdi:image-frame',
      preview: 'Large centered hero',
    },
    { id: 'card-grid', name: 'Card Grid', icon: 'mdi:grid', preview: 'Responsive card grid' },
    {
      id: 'split-screen',
      name: 'Split Screen',
      icon: 'mdi:view-split-vertical',
      preview: '50/50 split layout',
    },
  ];

  const spacingOptions = [
    { name: 'Compact', value: 'compact', spacing: '16px' },
    { name: 'Normal', value: 'normal', spacing: '24px' },
    { name: 'Comfortable', value: 'comfortable', spacing: '32px' },
    { name: 'Spacious', value: 'spacious', spacing: '48px' },
  ];

  const applyLayout = (layoutId: string) => {
    if (!selectedSectionId || !selectedSection) return;

    // TODO: Apply layout transformation to section HTML
    const layoutClass = `layout-${layoutId}`;

    actions.updateSection(selectedSectionId, {
      ...selectedSection,
      layout: layoutId,
      // Add layout-specific classes to HTML
      src: {
        ...selectedSection.src,
        css: `${selectedSection.src?.css || ''}\n.${layoutClass} { /* Layout styles */ }`,
      },
    });

    actions.saveToHistory();
  };

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button
      className={`tab ${activeTab === id ? 'tab-active' : ''}`}
      onClick={() => setActiveTab(id as any)}
    >
      <Icon icon={icon} className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  if (!selectedSectionId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon icon="mdi:view-grid" className="text-6xl text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">Layout Editor</h3>
          <p className="text-base-content/60">Select a section to modify its layout</p>
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
        <h3 className="text-lg font-semibold">Layout Editor: {selectedSection?.section_name}</h3>
        <button className="btn btn-primary btn-sm" onClick={() => actions.saveToHistory()}>
          <Icon icon="mdi:content-save" className="w-4 h-4 mr-1" />
          Apply Layout
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <TabButton id="structure" label="Structure" icon="mdi:view-grid" />
        <TabButton id="spacing" label="Spacing" icon="mdi:resize" />
        <TabButton id="grid" label="Grid" icon="mdi:grid" />
      </div>

      {/* Structure Tab */}
      {activeTab === 'structure' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Layout Templates</h4>
              <div className="grid grid-cols-2 gap-3">
                {layoutOptions.map(layout => (
                  <button
                    key={layout.id}
                    className="btn btn-ghost h-auto p-4 flex-col hover:bg-base-200"
                    onClick={() => applyLayout(layout.id)}
                  >
                    <Icon icon={layout.icon} className="text-3xl text-primary mb-2" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{layout.name}</div>
                      <div className="text-xs text-base-content/60">{layout.preview}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Alignment</h4>
              <div className="grid grid-cols-3 gap-2">
                <button className="btn btn-outline btn-sm">
                  <Icon icon="mdi:format-align-left" className="w-4 h-4" />
                  Left
                </button>
                <button className="btn btn-outline btn-sm">
                  <Icon icon="mdi:format-align-center" className="w-4 h-4" />
                  Center
                </button>
                <button className="btn btn-outline btn-sm">
                  <Icon icon="mdi:format-align-right" className="w-4 h-4" />
                  Right
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Spacing Tab */}
      {activeTab === 'spacing' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Spacing Presets</h4>
              <div className="space-y-3">
                {spacingOptions.map(spacing => (
                  <label key={spacing.value} className="label cursor-pointer justify-start gap-4">
                    <input
                      type="radio"
                      name="spacing"
                      className="radio radio-primary"
                      defaultChecked={spacing.value === 'normal'}
                    />
                    <div>
                      <div className="font-medium">{spacing.name}</div>
                      <div className="text-sm text-base-content/60">{spacing.spacing} padding</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Custom Spacing</h4>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Top Padding</span>
                    <span className="label-text-alt">24px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="24"
                    className="range range-primary range-sm"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Bottom Padding</span>
                    <span className="label-text-alt">24px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="24"
                    className="range range-primary range-sm"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Section Gap</span>
                    <span className="label-text-alt">16px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    defaultValue="16"
                    className="range range-primary range-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid Tab */}
      {activeTab === 'grid' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Grid Settings</h4>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Columns (Desktop)</span>
                    <span className="label-text-alt">3</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    defaultValue="3"
                    className="range range-primary range-sm"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Columns (Tablet)</span>
                    <span className="label-text-alt">2</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    defaultValue="2"
                    className="range range-primary range-sm"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Column Gap</span>
                    <span className="label-text-alt">20px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    defaultValue="20"
                    className="range range-primary range-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Responsive Behavior</h4>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Auto-adjust on mobile</span>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Equal height columns</span>
                    <input type="checkbox" className="toggle toggle-primary" />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Stack on narrow screens</span>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="alert alert-info">
        <Icon icon="mdi:information" />
        <span>
          Layout changes will be applied to the selected section. Preview changes in real-time.
        </span>
      </div>
    </motion.div>
  );
}
