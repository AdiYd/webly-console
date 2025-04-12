'use client';

import { useState, useEffect } from 'react';
import { AIProvider, availableModels } from '@/lib/ai/config';
import { cn } from '@/lib/utils';

interface UserPreferences {
  defaultProvider: AIProvider;
  defaultModel: string;
  theme: 'light' | 'dark' | 'system';
  saveHistory: boolean;
}

export default function ProfilePage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o',
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

  const handleProviderChange = (provider: AIProvider) => {
    setPreferences({
      ...preferences,
      defaultProvider: provider,
      defaultModel: availableModels[provider][0],
    });
  };

  const handleModelChange = (model: string) => {
    setPreferences({
      ...preferences,
      defaultModel: model,
    });
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="md:col-span-2 space-y-8">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">AI Preferences</h2>
              <p className="text-sm text-gray-500 mb-4">
                Configure your default AI settings for all interactions.
              </p>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Default AI Provider</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(availableModels).map((provider) => (
                    <button
                      key={provider}
                      className={cn(
                        "btn btn-sm",
                        preferences.defaultProvider === provider
                          ? "btn-primary"
                          : "btn-outline"
                      )}
                      onClick={() => handleProviderChange(provider as AIProvider)}
                    >
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
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
                  value={preferences.defaultModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                >
                  {availableModels[preferences.defaultProvider].map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt">
                    Different models have different capabilities and pricing
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Interface Settings</h2>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Theme Preference</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['light', 'dark', 'system'].map((theme) => (
                    <button
                      key={theme}
                      className={cn(
                        "btn btn-sm",
                        preferences.theme === theme
                          ? "btn-primary"
                          : "btn-outline"
                      )}
                      onClick={() => handleThemeChange(theme as any)}
                    >
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
                    onChange={(e) => handleSaveHistoryChange(e.target.checked)}
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
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-1" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Saved
                </span>
              ) : savedStatus === 'error' ? (
                "Error"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
        
        {/* Sidebar */}
        <div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Recent Chats</h2>
              
              {recentChats.length > 0 ? (
                <ul className="divide-y">
                  {recentChats.map((chat) => (
                    <li key={chat.id} className="py-3">
                      <a href={`/chat/${chat.id}`} className="block hover:bg-base-200 rounded-md p-2 -m-2">
                        <h3 className="font-medium">{chat.title}</h3>
                        <div className="text-sm text-gray-500 flex justify-between">
                          <span>{chat.date.toLocaleDateString()}</span>
                          <span>{chat.messages} messages</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent chats found
                </div>
              )}
              
              <div className="card-actions mt-2">
                <a href="/chat" className="btn btn-sm btn-outline w-full">
                  View All Chats
                </a>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm mt-6">
            <div className="card-body">
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