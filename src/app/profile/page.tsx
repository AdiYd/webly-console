'use client';

import { useState, useEffect } from 'react';
import { useAI, AIProvider } from '@/context/AIContext';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-screen';
import { Icon } from '@/components/ui/icon';

interface UserPreferences {
  defaultProvider: AIProvider;
  defaultModel: string;
  theme: 'light' | 'dark' | 'system';
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

  const { isMobile } = useBreakpoint();
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultProvider: provider,
    defaultModel: model,
    theme: 'system',
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
    }));
  }, [provider, model]);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setPreferences({
      ...preferences,
      theme,
    });
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
                        'btn btn-sm',
                        provider === prov ? 'btn-primary' : 'btn-outline'
                      )}
                      onClick={() => handleProviderChange(prov as AIProvider)}
                    >
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
                  className="range range-sm range-primary"
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
              <h2 className="card-title">Interface Settings</h2>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Theme Preference</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['light', 'dark', 'system'].map(theme => (
                    <button
                      key={theme}
                      className={cn(
                        'btn btn-sm',
                        preferences.theme === theme ? 'btn-primary' : 'btn-outline'
                      )}
                      onClick={() => handleThemeChange(theme as any)}
                    >
                      {theme === 'light' && <Icon icon="md:sunny" className="mr-1" />}
                      {theme === 'dark' && <Icon icon="md:moon" className="mr-1" />}
                      {theme === 'system' && <Icon icon="md:desktop" className="mr-1" />}
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
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