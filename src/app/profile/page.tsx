'use client';

import { useState, useEffect } from 'react';
import { useAI, AIProvider } from '@/context/AIContext';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-screen';
import { Icon } from '@/components/ui/icon';
import { useTheme, Theme } from '@/components/ui/theme-provider';
import { themeEmoji, themeIconify } from '@/components/ui/theme-toggle';

// Import the theme categories and icons from theme-toggle
const themeCategories = {
  base: ['light', 'dark', 'system'],
  colorful: ['cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk'],
  seasonal: ['valentine', 'halloween', 'autumn', 'winter'],
  nature: ['garden', 'forest', 'aqua', 'lemonade'],
  aesthetic: ['lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk'],
  mood: ['business', 'acid', 'night', 'coffee'],
};

interface UserPreferences {
  defaultProvider: AIProvider;
  defaultModel: string;
  theme: Theme;
  saveHistory: boolean;
}

export default function ProfilePage() {
  const {
    provider,
    model,
    temperature,
    systemPrompt,
    availableProviders,
    setProvider,
    setModel,
    setTemperature,
    setSystemPrompt,
  } = useAI();

  const { theme, setTheme, isDarkTheme } = useTheme();
  const { isMobile } = useBreakpoint();
  const [activeCategory, setActiveCategory] = useState<string>('base');

  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultProvider: provider,
    defaultModel: model,
    theme: theme as Theme,
    saveHistory: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // For demo purposes, we're just simulating loading preferences
  // In a real app, this would fetch from Firebase/database
  useEffect(() => {
    // Simulate loading user preferences
    const loadPreferences = async () => {
      // This would be an API call in production
      const storedPrefs = localStorage.getItem('user_preferences');
      if (storedPrefs) {
        try {
          setPreferences(JSON.parse(storedPrefs));
        } catch (err) {
          console.error('Failed to parse preferences:', err);
        }
      }
    };

    loadPreferences();
  }, []);

  // Update local preferences when global AI context changes
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      defaultProvider: provider,
      defaultModel: model,
      theme: theme as Theme,
    }));
  }, [provider, model, theme]);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setPreferences(prev => ({
      ...prev,
      theme: newTheme,
    }));
  };

  const handleSaveHistoryChange = (saveHistory: boolean) => {
    setPreferences({
      ...preferences,
      saveHistory,
    });
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setSavedStatus('saving');

    try {
      // In a real app, this would be an API call to save to Firebase/database
      localStorage.setItem('user_preferences', JSON.stringify(preferences));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setSavedStatus('saved');
      setTimeout(() => setSavedStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setSavedStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const recentChats = [
    { id: '1', title: 'Math help', date: new Date('2025-04-10'), messages: 12 },
    { id: '2', title: 'Physics concepts', date: new Date('2025-04-08'), messages: 8 },
    { id: '3', title: 'History questions', date: new Date('2025-04-05'), messages: 15 },
  ];

  // Get theme display name with proper capitalization
  const getDisplayThemeName = (themeName: string) => {
    if (themeName === 'system') {
      return 'System (OS Default)';
    }
    return themeName.charAt(0).toUpperCase() + themeName.slice(1);
  };

  // Get theme icon
  const getThemeIcon = (themeName: string) => {
    return themeIconify[themeName] || themeEmoji[themeName] || 'mdi:theme-light-dark';
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl font-bold mb-4 md:mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Main Settings */}
        <div className="md:col-span-2 space-y-4 md:space-y-8">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title">AI Preferences</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Configure your default AI settings for all interactions.
              </p>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Default AI Provider</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(availableProviders).map(prov => (
                    <button
                      key={prov}
                      className={cn(
                        'btn btn-sm flex gap-2',
                        provider === prov ? 'btn-soft btn-primary' : 'btn-ghost'
                      )}
                      onClick={() => handleProviderChange(prov as AIProvider)}
                    >
                      {availableProviders[prov as AIProvider].icon && (
                        <Icon
                          icon={availableProviders[prov as AIProvider].icon || 'mdi:robot'}
                          width={16}
                          className="w-4 h-4 mr-1"
                        />
                      )}
                      {availableProviders[prov as AIProvider].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Default AI Model</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={model}
                  onChange={e => handleModelChange(e.target.value)}
                >
                  {availableProviders[provider].models.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt">
                    Different models have different capabilities and pricing
                  </span>
                </label>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Temperature ({temperature.toFixed(1)})</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  className="range range-accent range-xs"
                />
                <div className="flex justify-between text-xs px-1 mt-1">
                  <span>Precise (0.0)</span>
                  <span>Balanced (0.5)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">System Prompt</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  placeholder="Set a system prompt to guide the AI's responses..."
                ></textarea>
                <label className="label">
                  <span className="label-text-alt">
                    Use a system prompt to set the behavior and knowledge of the AI assistant
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title mb-2">Interface Settings</h2>

              {/* Current Theme Display Card */}
              <div className="card bg-base-200 mb-6">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full`}>
                        <Icon icon={getThemeIcon(theme)} className="" />
                      </div>
                      <div>
                        <h3 className="font-medium">{getDisplayThemeName(theme)}</h3>
                        <p className="text-xs text-base-content/70">
                          {isDarkTheme ? 'Dark theme' : 'Light theme'}
                          {theme === 'system' &&
                            ` (${isDarkTheme ? 'currently dark' : 'currently light'})`}
                        </p>
                      </div>
                      <div className="flex relative -top-[6px] mx-2 gap-2 z-10">
                        <div className="w-3 h-3 rounded-full bg-red-500* btn min-h-2 btn-xs btn-primary btn-circle "></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500* btn min-h-2 btn-xs btn-secondary btn-circle "></div>
                        <div className="w-3 h-3 rounded-full bg-green-500* btn min-h-2 btn-xs btn-accent btn-circle"></div>
                      </div>
                    </div>
                    <div className="badge badge-sm badge-outline">
                      {theme === 'system'
                        ? 'System default'
                        : Object.entries(themeCategories).find(([_, themes]) =>
                            themes.includes(theme)
                          )?.[0] || 'Custom'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Categories Tabs */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Theme Preference</span>
                </label>

                <div className="tabs tabs-boxed flex overflow-x-auto mb-4">
                  {Object.keys(themeCategories).map(category => (
                    <a
                      key={category}
                      className={`tab text-xs ${activeCategory === category ? 'tab-active' : ''}`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </a>
                  ))}
                </div>

                {/* Theme Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[240px] overflow-y-auto p-1">
                  {themeCategories[activeCategory as keyof typeof themeCategories].map(
                    themeName => (
                      <button
                        key={themeName}
                        onClick={() => handleThemeChange(themeName as Theme)}
                        className={`btn btn-xs ${
                          theme === themeName ? 'btn-primary' : 'btn-outline'
                        }  flex items-center justify-start py-2 gap-2 h-auto normal-case`}
                      >
                        <div
                          className={`w-6 h-6  mask mask-hexagon-2 flex justify-center ${
                            isDarkTheme
                              ? 'bg-neutral !text-neutral-content'
                              : 'bg-gray-100 !text-black'
                          }`}
                        >
                          {themeIconify[themeName] ? (
                            <Icon icon={themeIconify[themeName]} className="m-auto self-center" />
                          ) : (
                            <span>{themeEmoji[themeName] || '🎨'}</span>
                          )}
                        </div>
                        <span className="text-sm">
                          {themeName === 'system' ? 'System (OS)' : themeName}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label justify-start gap-8 cursor-pointer">
                  <span className="label-text">Save Chat History</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={preferences.saveHistory}
                    onChange={e => handleSaveHistoryChange(e.target.checked)}
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt">
                    If disabled, your chat conversations won't be saved for future reference
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="min-w-[120px] btn btn-primary btn-sm"
            >
              {isSaving ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : savedStatus === 'saved' ? (
                <span className="flex items-center">
                  <Icon icon="md:checkmark" className="mr-1" />
                  Saved
                </span>
              ) : savedStatus === 'error' ? (
                <span className="flex items-center">
                  <Icon icon="md:alert" className="mr-1" />
                  Error
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {savedStatus === 'saved' && (
          <div
            role="alert"
            className="alert alert-success w-fit fixed top-8 right-[45%] z-50 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Changes saved!</span>
          </div>
        )}

        {/* Sidebar */}
        <div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title">Recent Chats</h2>

              {recentChats.length > 0 ? (
                <ul className="divide-y">
                  {recentChats.map(chat => (
                    <li key={chat.id} className="py-3">
                      <a
                        href={`/chat/${chat.id}`}
                        className="block hover:bg-base-200 rounded-md p-2 -m-2"
                      >
                        <h3 className="font-medium">{chat.title}</h3>
                        <div className="text-sm text-base-content/70 flex justify-between">
                          <span>{chat.date.toLocaleDateString()}</span>
                          <span>{chat.messages} messages</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-base-content/70">No recent chats found</div>
              )}

              <div className="card-actions mt-2">
                <a href="/chat" className="btn btn-sm btn-outline w-full">
                  View All Chats
                </a>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm mt-4 md:mt-6">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title">Account</h2>
              <div className="py-2">
                <button className="btn btn-sm btn-outline btn-error w-full">
                  Delete All Chat History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}