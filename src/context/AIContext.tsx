'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'grok';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: string[];
  maxTokens: number;
}

interface AIContextType {
  provider: AIProvider;
  model: string;
  temperature: number;
  systemPrompt: string;
  icon: string; // Add icon to context type
  availableProviders: Record<
    AIProvider,
    {
      name: string;
      icon?: string; // Keep icon here for data structure
      models: AIModel[];
    }
  >;
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setSystemPrompt: (prompt: string) => void;
}

// Define all available AI providers and their models
export const availableProvidersData: Record<
  AIProvider,
  {
    name: string;
    icon?: string;
    models: AIModel[];
  }
> = {
  openai: {
    name: 'OpenAI',
    icon: 'ri:openai-fill',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        capabilities: ['chat', 'vision'],
        maxTokens: 128000,
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        capabilities: ['chat'],
        maxTokens: 128000,
      },
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai', capabilities: ['chat'], maxTokens: 8192 },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        capabilities: ['chat'],
        maxTokens: 16384,
      },
    ],
  },
  anthropic: {
    name: 'Anthropic',
    icon: 'logos:claude-icon',
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        capabilities: ['chat', 'vision'],
        maxTokens: 200000,
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        capabilities: ['chat', 'vision'],
        maxTokens: 180000,
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        capabilities: ['chat'],
        maxTokens: 150000,
      },
    ],
  },
  gemini: {
    name: 'Google Gemini',
    icon: 'material-icon-theme:gemini-ai',
    models: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'gemini',
        capabilities: ['chat', 'vision'],
        maxTokens: 1000000,
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'gemini',
        capabilities: ['chat'],
        maxTokens: 1000000,
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'gemini',
        capabilities: ['chat'],
        maxTokens: 32768,
      },
    ],
  },
  //   azure: {
  //     name: 'Azure',
  //     icon: 'material-icon-theme:azure',
  //     models: [
  //       {
  //         id: 'azure-gpt-4',
  //         name: 'Azure GPT-4',
  //         provider: 'azure',
  //         capabilities: ['chat'],
  //         maxTokens: 8192,
  //       },
  //       {
  //         id: 'azure-gpt-3.5-turbo',
  //         name: 'Azure GPT-3.5 Turbo',
  //         provider: 'azure',
  //         capabilities: ['chat'],
  //         maxTokens: 16384,
  //       },
  //     ],
  //   },
  grok: {
    name: 'Grok',
    icon: 'pajamas:twitter',
    models: [
      { id: 'grok-1', name: 'Grok 1', provider: 'grok', capabilities: ['chat'], maxTokens: 8192 },
    ],
  },
};

// Default values for the context
const defaultValues: AIContextType = {
  provider: 'openai',
  model: 'gpt-4o',
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant.',
  icon: availableProvidersData['openai'].icon || '',
  availableProviders: availableProvidersData,
  setProvider: () => {},
  setModel: () => {},
  setTemperature: () => {},
  setSystemPrompt: () => {},
};

// Create the context
const AIContext = createContext<AIContextType>(defaultValues);

// Hook to use the AI context
export const useAI = () => useContext(AIContext);

// Provider component
export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [provider, setProviderState] = useState<AIProvider>(defaultValues.provider);
  const [model, setModelState] = useState<string>(defaultValues.model);
  const [temperature, setTemperatureState] = useState<number>(defaultValues.temperature);
  const [systemPrompt, setSystemPromptState] = useState<string>(defaultValues.systemPrompt);
  const [availableProviders] = useState<typeof availableProvidersData>(availableProvidersData);
  const [icon, setIcon] = useState<string>(defaultValues.icon); // Initialize icon state

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettingsRaw = localStorage.getItem('ai_settings');
      if (savedSettingsRaw) {
        const savedSettings = JSON.parse(savedSettingsRaw);

        if (
          savedSettings.provider &&
          Object.keys(availableProvidersData).includes(savedSettings.provider)
        ) {
          const loadedProvider = savedSettings.provider as AIProvider;
          setProviderState(loadedProvider);
          setIcon(availableProvidersData[loadedProvider].icon || ''); // Set icon based on loaded provider

          // Verify saved model exists for the loaded provider
          if (savedSettings.model) {
            const modelExists = availableProvidersData[loadedProvider].models.some(
              m => m.id === savedSettings.model
            );
            if (modelExists) {
              setModelState(savedSettings.model);
            } else {
              // Fallback to the first model of the loaded provider if saved model is invalid
              setModelState(availableProvidersData[loadedProvider].models[0]?.id || '');
            }
          } else {
            // Fallback if no model saved
            setModelState(availableProvidersData[loadedProvider].models[0]?.id || '');
          }
        } else {
          // Fallback if saved provider is invalid
          setIcon(availableProvidersData[defaultValues.provider].icon || '');
        }

        if (savedSettings.temperature) {
          const parsedTemp = parseFloat(savedSettings.temperature);
          if (!isNaN(parsedTemp) && parsedTemp >= 0 && parsedTemp <= 1) {
            setTemperatureState(parsedTemp);
          }
        }

        if (savedSettings.systemPrompt) {
          setSystemPromptState(savedSettings.systemPrompt);
        }
      } else {
        // Set default icon if no settings found
        setIcon(availableProvidersData[defaultValues.provider].icon || '');
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      // Set default icon on error
      setIcon(availableProvidersData[defaultValues.provider].icon || '');
    }
  }, []); // Run only on mount

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      const aiSettings = {
        provider,
        model,
        temperature,
        systemPrompt,
        // No need to save icon, it's derived from provider
      };
      localStorage.setItem('ai_settings', JSON.stringify(aiSettings));
    } catch (error) {
      console.error('Error saving AI settings:', error);
    }
  }, [provider, model, temperature, systemPrompt]); // Run when any setting changes

  // Update icon when provider changes
  useEffect(() => {
    setIcon(availableProviders[provider]?.icon || '');
  }, [provider, availableProviders]);

  // Handle provider change
  const setProvider = (newProvider: AIProvider) => {
    if (availableProviders[newProvider]) {
      setProviderState(newProvider);
      // Set default model for the new provider
      if (availableProviders[newProvider].models.length > 0) {
        setModelState(availableProviders[newProvider].models[0].id);
      } else {
        setModelState(''); // Or handle case with no models
      }
    } else {
      console.warn(`Attempted to set invalid provider: ${newProvider}`);
    }
  };

  // Value to provide
  const value: AIContextType = useMemo(
    () => ({
      provider,
      model,
      temperature,
      systemPrompt,
      icon,
      availableProviders,
      setProvider,
      setModel: setModelState,
      setTemperature: setTemperatureState,
      setSystemPrompt: setSystemPromptState,
    }),
    [provider, model, temperature, systemPrompt, icon, availableProviders] // Add icon to dependency array
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
