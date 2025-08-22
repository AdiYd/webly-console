'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';
import { WebsiteTheme } from '@/types/mock';
import { useTheme } from '@/context/theme-provider';

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
  const { isDarkTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'effects'>('colors');

  const mode = isDarkTheme ? 'dark' : 'light';

  const { website } = state;
  const theme =
    website.design?.theme ||
    ({
      colors: {
        light: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' },
      },
      typography: {
        fontFamily: 'font-inter',
        fontSize: { base: '16px', sm: '14px', lg: '18px' },
        lineHeight: 1.5,
      },
    } as WebsiteTheme);

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
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
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
        <TabButton id="effects" label="Effects" icon="mdi:sparkles" />
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
                    <div className=" items-center gap-3">
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
                    <span className="label-text-alt">{theme.colors[mode]?.primary}</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered h-12"
                    value={theme.colors[mode]?.primary}
                    onChange={e =>
                      updateTheme({
                        colors: { ...theme.colors, primary: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Secondary Color</span>
                    <span className="label-text-alt">{theme.colors[mode]?.secondary}</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered h-12"
                    value={theme.colors[mode]?.secondary}
                    onChange={e =>
                      updateTheme({
                        colors: { ...theme.colors, secondary: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Accent Color</span>
                    <span className="label-text-alt">{theme.colors[mode]?.accent}</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered h-12"
                    value={theme.colors[mode]?.accent}
                    onChange={e =>
                      updateTheme({
                        colors: { ...theme.colors, accent: e.target.value },
                      })
                    }
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
                      checked={theme.typography?.fontFamily === font.class}
                      onChange={() =>
                        updateTheme({
                          typography: { ...theme.typography, fontFamily: font.class },
                        })
                      }
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

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Font Sizes</h4>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Base Size</span>
                    <span className="label-text-alt">{theme.typography?.fontSize.base}</span>
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="20"
                    step="1"
                    className="range range-primary"
                    value={parseInt(theme.typography?.fontSize?.base)}
                    onChange={e =>
                      updateTheme({
                        typography: {
                          ...theme.typography,
                          fontSize: { ...theme.typography?.fontSize, base: `${e.target.value}px` },
                        },
                      })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Line Height</span>
                    <span className="label-text-alt">{theme.typography?.lineHeight}</span>
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2"
                    step="0.1"
                    className="range range-primary"
                    value={theme.typography?.lineHeight}
                    onChange={e =>
                      updateTheme({
                        typography: { ...theme.typography, lineHeight: parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-base">Visual Effects</h4>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Border Radius</span>
                    <span className="label-text-alt">{theme.radius?.button}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    className="range range-primary"
                    value={(theme.radius?.button || '0').toString()}
                    onChange={e =>
                      updateTheme({
                        radius: { ...theme.radius, button: `${e.target.value}px` },
                      })
                    }
                  />
                </div>
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
