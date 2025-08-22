'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';

const colorPresets = [
  { name: 'Blue Ocean', primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' },
  { name: 'Forest Green', primary: '#059669', secondary: '#047857', accent: '#10B981' },
  { name: 'Sunset Orange', primary: '#EA580C', secondary: '#C2410C', accent: '#F97316' },
  { name: 'Purple Dream', primary: '#7C3AED', secondary: '#5B21B6', accent: '#8B5CF6' },
  { name: 'Rose Gold', primary: '#E11D48', secondary: '#BE185D', accent: '#F43F5E' },
  { name: 'Midnight', primary: '#1F2937', secondary: '#111827', accent: '#374151' },
];

const fontOptions = [
  { name: 'Inter', class: 'font-inter', preview: 'Modern & Clean' },
  { name: 'Poppins', class: 'font-poppins', preview: 'Friendly & Round' },
  { name: 'Roboto', class: 'font-roboto', preview: 'Technical & Clear' },
  { name: 'Playfair', class: 'font-playfair', preview: 'Elegant & Serif' },
  { name: 'Montserrat', class: 'font-montserrat', preview: 'Bold & Geometric' },
];

export function ThemeEditor() {
  const { state, actions } = useEditor();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography'>('colors');

  const { website } = state;
  const theme = website.design?.theme || {
    colors: {
      light: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' },
    },
  };

  const currentColors = theme.colors?.light || {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#06B6D4',
  };
  const currentTypography = theme.typography || { fontFamily: 'Inter' };

  const updateTheme = (updates: any) => {
    actions.setWebsite({
      ...website,
      design: {
        ...website.design,
        theme: { ...theme, ...updates },
      },
    });
  };

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    updateTheme({
      colors: {
        ...theme.colors,
        light: {
          ...currentColors,
          primary: preset.primary,
          secondary: preset.secondary,
          accent: preset.accent,
        },
      },
    });
    actions.saveToHistory();
  };

  const updateColor = (colorKey: string, value: string) => {
    updateTheme({
      colors: {
        ...theme.colors,
        light: {
          ...currentColors,
          [colorKey]: value,
        },
      },
    });
  };

  const updateTypography = (updates: any) => {
    updateTheme({
      typography: {
        ...currentTypography,
        ...updates,
      },
    });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme Editor</h3>
        <button className="btn btn-primary btn-sm" onClick={() => actions.saveToHistory()}>
          <Icon icon="mdi:content-save" className="w-4 h-4 mr-1" />
          Save Theme
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <TabButton id="colors" label="Colors" icon="mdi:palette" />
        <TabButton id="typography" label="Typography" icon="mdi:format-text" />
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Color Presets */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Color Presets</h4>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    className="btn btn-ghost h-auto p-3 justify-start hover:bg-base-200"
                    onClick={() => applyColorPreset(preset)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-sm">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Colors */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Custom Colors</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Primary Color</span>
                    <span className="label-text-alt">{currentColors.primary}</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered h-12"
                    value={currentColors.primary}
                    onChange={e => updateColor('primary', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Secondary Color</span>
                    <span className="label-text-alt">{currentColors.secondary}</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered h-12"
                    value={currentColors.secondary}
                    onChange={e => updateColor('secondary', e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Accent Color</span>
                    <span className="label-text-alt">{currentColors.accent}</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered h-12"
                    value={currentColors.accent}
                    onChange={e => updateColor('accent', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Font Family</h4>
              <div className="space-y-3">
                {fontOptions.map((font, index) => (
                  <label key={index} className="label cursor-pointer justify-start gap-4">
                    <input
                      type="radio"
                      name="font"
                      className="radio radio-primary"
                      checked={currentTypography.fontFamily === font.class}
                      onChange={() => updateTypography({ fontFamily: font.class })}
                    />
                    <div>
                      <div className="font-medium">{font.name}</div>
                      <div className="text-sm text-base-content/60">{font.preview}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Preview */}
      <div className="alert alert-info">
        <Icon icon="mdi:eye" />
        <span>Theme changes are applied live to the preview. Save to make them permanent.</span>
      </div>
    </motion.div>
  );
}
