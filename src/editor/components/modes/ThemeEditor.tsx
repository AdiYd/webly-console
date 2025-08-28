'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';
import { fontOptions, ThemeSwitcher } from '@/components/pageParser/pageParser';
import ImageTooltip from '@/components/ui/tooltip/tooltip';
import { Dialog, useDialog } from '@/components/ui/notifier/use-dialog';

const colorPresets = [
  {
    mode: 'light',
    name: 'Blue Ocean',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#06B6D4',
    background: '#F0F7FF',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#DCEEFF',
  },
  {
    mode: 'light',
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10B981',
    background: '#fff',
    card: '#FFFFFF',
    text: '#053225',
    border: '#DFF6EE',
  },
  {
    mode: 'light',
    name: 'Sunset Orange',
    primary: '#EA580C',
    secondary: '#C2410C',
    accent: '#F97316',
    background: '#FFF7F0',
    card: '#FFFFFF',
    text: '#2B160C',
    border: '#FAD7C0',
  },
  {
    mode: 'light',
    name: 'Purple Dream',
    primary: '#7C3AED',
    secondary: '#5B21B6',
    accent: '#8B5CF6',
    background: '#F7F4FF',
    card: '#FFFFFF',
    text: '#1E0633',
    border: '#EEE7FF',
  },
  {
    mode: 'light',
    name: 'Rose Gold',
    primary: '#E11D48',
    secondary: '#BE185D',
    accent: '#F43F5E',
    background: '#FFF5F7',
    card: '#FFFFFF',
    text: '#2A0522',
    border: '#FBDDE6',
  },
  {
    mode: 'light',
    name: 'Midnight',
    primary: '#1F2937',
    secondary: '#111827',
    accent: '#374151',
    background: '#F4F6F8',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E6E9EE',
  },
  {
    mode: 'light',
    name: 'Soft Pastel',
    primary: '#FBBF24',
    secondary: '#FCD34D',
    accent: '#FDE68A',
    background: '#FFFBEA',
    card: '#FFFFFF',
    text: '#2A2A18',
    border: '#FFF3C9',
  },
  {
    mode: 'light',
    name: 'Cool Gray',
    primary: '#9CA3AF',
    secondary: '#6B7280',
    accent: '#D1D5DB',
    background: '#F3F4F6',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E6E9EE',
  },
  {
    mode: 'dark',
    name: 'Light style',
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    accent: '#E5E7EB',
    background: '#071226',
    card: '#0F172A',
    text: '#F8FAFC',
    border: '#1F2937',
  },
  {
    mode: 'dark',
    name: 'Dark Ocean',
    primary: '#1E3A8A',
    secondary: '#1E40AF',
    accent: '#06B6D4',
    background: '#061233',
    card: '#0B254E',
    text: '#E6F0FF',
    border: '#133054',
  },
  {
    mode: 'dark',
    name: 'Dark Forest',
    primary: '#064E3B',
    secondary: '#065F46',
    accent: '#10B981',
    background: '#051E15',
    card: '#06362A',
    text: '#DFF7ED',
    border: '#0A3A2A',
  },
  {
    mode: 'dark',
    name: 'Dark Sunset',
    primary: '#7C2D12',
    secondary: '#9A3412',
    accent: '#C2410C',
    background: '#160A07',
    card: '#2B1210',
    text: '#FFEDE4',
    border: '#3A1A14',
  },
  {
    mode: 'dark',
    name: 'Dark Purple',
    primary: '#5B21B6',
    secondary: '#6D28D9',
    accent: '#8B5CF6',
    background: '#0B0420',
    card: '#220A4A',
    text: '#ECE6FF',
    border: '#2F0E54',
  },
  {
    mode: 'dark',
    name: 'Dark Rose',
    primary: '#BE185D',
    secondary: '#9B1C30',
    accent: '#F43F5E',
    background: '#200514',
    card: '#3A0C20',
    text: '#FFEAF0',
    border: '#4A0D2B',
  },
  {
    mode: 'dark',
    name: 'Dark Pastel',
    primary: '#FBBF24',
    secondary: '#FCD34D',
    accent: '#FDE68A',
    background: '#17140A',
    card: '#2A2410',
    text: '#FFF8E0',
    border: '#3A2F11',
  },
  {
    mode: 'dark',
    name: 'Dark Gray',
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#D1D5DB',
    background: '#0B0F12',
    card: '#111215',
    text: '#E6E9EE',
    border: '#1F2933',
  },
  {
    mode: 'dark',
    name: 'Dark Light',
    primary: '#F3F4F6',
    secondary: '#FFFFFF',
    accent: '#E5E7EB',
    background: '#071226',
    card: '#0F172A',
    text: '#F8FAFC',
    border: '#1F2937',
  },
];

export function ThemeEditor() {
  const {
    state: {
      theme,
      website: { design },
    },
    actions,
  } = useEditor();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography'>('colors');
  const { showDialog, ...dialogState } = useDialog();
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
        ...design?.theme?.colors,
        [preset.mode === 'dark' ? 'dark' : 'light']: {
          primary: preset.primary || currentColors.primary,
          secondary: preset.secondary || currentColors.secondary,
          accent: preset.accent || currentColors.accent,
        },
      },
    });
    actions.saveToHistory();
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
      className={`tab flex text-sm gap-2 border-b items-center !rounded-t-3xl !rounded-b-none ${
        activeTab === id ? 'tab-active !border-primary' : ''
      }`}
      onClick={() => setActiveTab(id as any)}
    >
      <Icon icon={icon} className="relative w-4 h-4 top-0.5" />
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 scrollbar-thin overflow-x-hidden"
    >
      {/* <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Theme Editor</h3>
        <button className="btn btn-neutral btn-sm" onClick={() => actions.saveToHistory()}>
          <Icon icon="mdi:content-save" className="w-4 h-4 mr-1" />
          Save Theme
        </button>
      </div> */}
      <Dialog {...dialogState}>
        <div className="w-full max-w-xl mx-auto ">
          <form
            className="p-4 bg-transparent"
            onSubmit={async e => {
              e.preventDefault();
              const form = new FormData(e.currentTarget as HTMLFormElement);

              // Apply daisy theme (switch light/dark)
              try {
                console.log('Prompt:', form.get('aiPrompt'));
                await new Promise(resolve => setTimeout(resolve, 5000));
              } catch (err) {
                // ignore if action not available
              }

              // Save to history so change is persisted in undo stack
              try {
                actions.saveToHistory();
              } catch (err) {
                // noop
              }

              // close dialog if available on dialogState
              if ((dialogState as any).onClose) {
                (dialogState as any).onClose();
              }
            }}
          >
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2">
                <Icon icon="mdi:robot" className="w-5 h-5" />
                AI Theme Generator
              </h3>

              <p className="text-sm text-base-content/60">
                Describe the theme you want in plain language — colors, mood, spacing, border
                radius, etc. Example: "Light airy blue theme with soft rounded corners and subtle
                shadows."
              </p>

              <label className="w-full">
                <textarea
                  name="aiPrompt"
                  placeholder="e.g. 'Light modern blue theme: primary #3B82F6, accent soft teal, rounded 8px, minimal shadows'"
                  className="textarea textarea-bordered w-full h-28 resize-y"
                />
              </label>

              <div className="flex items-center justify-end gap-2">
                <button type="submit" className="btn btn-primary">
                  Generate with AI
                  <Icon icon="mdi:send" />
                </button>
              </div>

              <p className="text-xs text-base-content/50">
                Tip: be specific (light/dark, primary/secondary colors, font style) for best
                results.
              </p>
            </div>
          </form>
        </div>
      </Dialog>
      <div className="w-full">
        <div
          onClick={() => showDialog('Create a custom theme')}
          className="btn mx-auto shadow-lg hover:shadow-amber-300 mt-4 flex w-fit justify-center font-semibold btn-secondary text-white"
        >
          ✨ Generate AI theme
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs bg-transparent tabs-bordered">
        <TabButton id="colors" label="Colors" icon="mdi:palette" />
        <TabButton id="typography" label="Typography" icon="mdi:format-text" />
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
      {/* <div className="alert alert-info">
        <Icon icon="mdi:eye" />
        <span>Theme changes are applied live to the preview. Save to make them permanent.</span>
      </div> */}
    </motion.div>
  );
}
