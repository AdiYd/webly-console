'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';
import { fontOptions, ThemeSwitcher } from '@/components/pageParser/pageParser';
import ImageTooltip from '@/components/ui/tooltip/tooltip';

const colorPresets = [
  {
    mode: 'light',
    name: 'Blue Ocean',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#06B6D4',
  },
  {
    mode: 'light',
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10B981',
  },
  {
    mode: 'light',
    name: 'Sunset Orange',
    primary: '#EA580C',
    secondary: '#C2410C',
    accent: '#F97316',
  },
  {
    mode: 'light',
    name: 'Purple Dream',
    primary: '#7C3AED',
    secondary: '#5B21B6',
    accent: '#8B5CF6',
  },
  { mode: 'light', name: 'Rose Gold', primary: '#E11D48', secondary: '#BE185D', accent: '#F43F5E' },
  { mode: 'light', name: 'Midnight', primary: '#1F2937', secondary: '#111827', accent: '#374151' },
  {
    mode: 'light',
    name: 'Soft Pastel',
    primary: '#FBBF24',
    secondary: '#FCD34D',
    accent: '#FDE68A',
  },
  { mode: 'light', name: 'Cool Gray', primary: '#9CA3AF', secondary: '#6B7280', accent: '#D1D5DB' },
  {
    mode: 'dark',
    name: 'Light style',
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    accent: '#E5E7EB',
  },
  { mode: 'dark', name: 'Dark Ocean', primary: '#1E3A8A', secondary: '#1E40AF', accent: '#06B6D4' },
  {
    mode: 'dark',
    name: 'Dark Forest',
    primary: '#064E3B',
    secondary: '#065F46',
    accent: '#10B981',
  },
  {
    mode: 'dark',
    name: 'Dark Sunset',
    primary: '#7C2D12',
    secondary: '#9A3412',
    accent: '#C2410C',
  },
  {
    mode: 'dark',
    name: 'Dark Purple',
    primary: '#5B21B6',
    secondary: '#6D28D9',
    accent: '#8B5CF6',
  },
  { mode: 'dark', name: 'Dark Rose', primary: '#BE185D', secondary: '#9B1C30', accent: '#F43F5E' },
  {
    mode: 'dark',
    name: 'Dark Pastel',
    primary: '#FBBF24',
    secondary: '#FCD34D',
    accent: '#FDE68A',
  },
  { mode: 'dark', name: 'Dark Gray', primary: '#6B7280', secondary: '#9CA3AF', accent: '#D1D5DB' },
  { mode: 'dark', name: 'Dark Light', primary: '#F3F4F6', secondary: '#FFFFFF', accent: '#E5E7EB' },
];

export function ThemeEditor() {
  const {
    state: { theme },
    actions,
  } = useEditor();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography'>('colors');

  const selectedPreset = useMemo(() => {
    return colorPresets.find(preset => {
      return (
        (preset.primary === theme.colors?.light?.primary &&
          preset.secondary === theme.colors?.light?.secondary &&
          preset.accent === theme.colors?.light?.accent) ||
        (preset.primary === theme.colors?.dark?.primary &&
          preset.secondary === theme.colors?.dark?.secondary &&
          preset.accent === theme.colors?.dark?.accent)
      );
    })?.name;
  }, [theme]);

  const currentColors = theme.colors?.light || {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#06B6D4',
  };
  const currentTypography = theme.typography || { fontFamily: 'Inter' };
  const updateTheme = (updates: any) => {
    actions.setTheme({
      ...theme,
      ...updates,
    });
  };

  const applyColorPreset = (preset: Partial<(typeof colorPresets)[0]>) => {
    actions.setDaisyTheme(preset.mode === 'dark' ? 'webly-dark' : 'webly-light');
    updateTheme({
      colors: {
        ...theme.colors,
        [preset.mode === 'dark' ? 'dark' : 'light']: {
          primary: preset.primary || currentColors.primary,
          secondary: preset.secondary || currentColors.secondary,
          accent: preset.accent || currentColors.accent,
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
    console.log('Updating typography:', updates);
    updateTheme({
      typography: {
        ...currentTypography,
        ...updates,
      },
    });
  };

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button
      className={`tab flex text-sm gap-2 items-center !rounded-t-3xl !rounded-b-none ${
        activeTab === id ? 'tab-active' : ''
      }`}
      onClick={() => setActiveTab(id as any)}
    >
      <Icon icon={icon} className="relative w-4 h-4 top-0.5" />
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 overflow-x-hidden"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme Editor</h3>
        <button className="btn btn-neutral btn-sm" onClick={() => actions.saveToHistory()}>
          <Icon icon="mdi:content-save" className="w-4 h-4 mr-1" />
          Save Theme
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs bg-transparent tabs-boxed">
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
          <div className="card bg-base-100/20 backdrop-blur-md shadow-sm">
            <div className="card-body p-4">
              <h4 className="card-title text-base">Color Presets</h4>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    style={{
                      backgroundColor: preset.mode === 'dark' ? '#1c1917' : '#f8fafc',
                      border: `1px solid ${preset.mode === 'dark' ? '#27272a' : '#e2e8f0'}`,
                      color: preset.mode === 'dark' ? '#f3f4f6' : '#334155',
                    }}
                    className={`btn btn-ghost h-auto p-3 justify-center hover:bg-base-200 ${
                      preset.name === selectedPreset ? '!border-primary' : ''
                    }`}
                    onClick={() => applyColorPreset(preset)}
                  >
                    <div className="flex flex-col-reverse items-center gap-3">
                      <div className="flex gap-1 justify-center">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-xs text-center">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daisy Theme */}
          <div className="card bg-base-100/20 shadow-sm">
            <div className="card-body p-4">
              <h4 className="card-title text-base">
                Themes
                <ImageTooltip
                  src={'/daisyThemes.png'}
                  alt="DaisyUI Themes"
                  caption="Click to see all themes"
                >
                  (
                  <a
                    href="https://daisyui.com/docs/themes/?lang=en#list-of-themes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    DaisyUI
                  </a>
                  )
                </ImageTooltip>
              </h4>
              <div className=" *:flex-wrap p-1">
                <ThemeSwitcher style={{ padding: '10px', overflow: 'visible' }} />
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
            <div className="card-body p-4">
              <h4 className="card-title text-base">Font Family</h4>
              <div className="space-y-3">
                {fontOptions.map((font, index) => (
                  <label key={index} className="label cursor-pointer justify-start gap-4">
                    <input
                      type="radio"
                      name="font"
                      className="radio radio-primary"
                      checked={currentTypography.fontFamily === font.name}
                      onChange={() => updateTypography({ fontFamily: font.name })}
                    />
                    <div>
                      <div className="font-medium">{font.name}</div>
                      <div
                        className="text-sm text-base-content/60"
                        style={{ fontFamily: font.name }}
                      >
                        {font.preview}
                      </div>
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
