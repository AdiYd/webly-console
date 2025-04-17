'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Theme, useTheme } from '@/components/ui/theme-provider';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'grok';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: string[];
  maxTokens: number;
}

// Define the Agent interface
export interface Agent {
  id: string;
  avatar: string;
  name: string;
  role: string;
  description: string;
}

// Define the AI parameters interface
export interface AIParams {
  provider: AIProvider;
  model: string;
  temperature: number;
  systemPrompt: string;
  organizationPrompt: string;
}

// Define the organization settings interface
export interface OrganizationSettings {
  theme: Theme;
  saveHistory?: boolean; // Backward compatibility for old settings
}

// Define the Project interface
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Define the Organization interface with unified structure
export interface Organization {
  id: string;
  name: string;
  agents: Agent[];
  ai_params: AIParams;
  settings: OrganizationSettings;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

// Define the organizations storage structure
interface OrganizationsStorage {
  organizations: Organization[];
  lastOrganizationId: string;
}

// Context type definition with unified update functions
interface OrganizationContextType {
  // Core data
  organizations: Organization[];
  currentOrganization: Organization;

  // Organization management
  switchOrganization: (id: string) => void;
  addOrganization: (name: string) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;

  // High-level update functions
  updateOrganizationProperty: <K extends keyof Organization>(
    property: K,
    value: Organization[K]
  ) => void;

  // Unified update functions
  updateAIParams: (params: Partial<AIParams>) => void;
  updateSettings: (settings: Partial<OrganizationSettings>) => void;

  // Agent management
  addAgent: (agentData: Omit<Agent, 'id'>) => void;
  updateAgent: (agentId: string, agentData: Omit<Agent, 'id'>) => void;
  removeAgent: (agentId: string) => void;

  // Project management
  addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
  ) => void;
  removeProject: (projectId: string) => void;

  // Backward compatibility - convenience accessors
  provider: AIProvider;
  model: string;
  temperature: number;
  systemPrompt: string;
  organizationPrompt: string;
  agents: Agent[];
  icon: string;
  preferences: OrganizationSettings;

  // Direct setters (maintained for backward compatibility)
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setSystemPrompt: (prompt: string) => void;
  setOrganizationPrompt: (prompt: string) => void;
  setPreferences: (settings: Partial<OrganizationSettings>) => void;

  // Available providers data
  availableProviders: Record<
    AIProvider,
    {
      name: string;
      icon?: string;
      models: AIModel[];
    }
  >;

  // Saving status
  lastSaved: Date | null;
  isSaving: boolean;
  saveError: string | null;
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
  grok: {
    name: 'Grok',
    icon: 'pajamas:twitter',
    models: [
      { id: 'grok-1', name: 'Grok 1', provider: 'grok', capabilities: ['chat'], maxTokens: 8192 },
    ],
  },
};

// Creates a default organization with all required fields
const createDefaultOrganization = (name: string = 'My Organization'): Organization => ({
  id: uuidv4(),
  name,
  agents: [],
  ai_params: {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    systemPrompt: 'You are a helpful assistant.',
    organizationPrompt: 'Our organization aims to provide helpful and accurate information.',
  },
  settings: {
    theme: 'system',
    saveHistory: true,
  },
  projects: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Default context values
const defaultOrganization = createDefaultOrganization();

const defaultValues: OrganizationContextType = {
  organizations: [defaultOrganization],
  currentOrganization: defaultOrganization,

  // Organization management functions
  switchOrganization: () => {},
  addOrganization: () => {},
  updateOrganization: () => {},
  removeOrganization: () => {},

  // High-level update functions
  updateOrganizationProperty: () => {},
  updateAIParams: () => {},
  updateSettings: () => {},

  // Agent management
  addAgent: () => {},
  updateAgent: () => {},
  removeAgent: () => {},

  // Project management
  addProject: () => {},
  updateProject: () => {},
  removeProject: () => {},

  // Backward compatibility accessors
  provider: defaultOrganization.ai_params.provider,
  model: defaultOrganization.ai_params.model,
  temperature: defaultOrganization.ai_params.temperature,
  systemPrompt: defaultOrganization.ai_params.systemPrompt,
  organizationPrompt: defaultOrganization.ai_params.organizationPrompt,
  agents: defaultOrganization.agents,
  icon: availableProvidersData[defaultOrganization.ai_params.provider].icon || '',
  preferences: defaultOrganization.settings,

  // Direct setters for backward compatibility
  setProvider: () => {},
  setModel: () => {},
  setTemperature: () => {},
  setSystemPrompt: () => {},
  setOrganizationPrompt: () => {},
  setPreferences: () => {},

  availableProviders: availableProvidersData,

  // Saving status
  lastSaved: null,
  isSaving: false,
  saveError: null,
};

// Create the context
const OrganizationContext = createContext<OrganizationContextType>(defaultValues);

// Hook to use the organization context
export const useOrganization = () => useContext(OrganizationContext);

// Provider component
export const OrganizationContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State for organizations and current organization
  const [organizations, setOrganizations] = useState<Organization[]>([defaultOrganization]);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string>(
    defaultOrganization.id
  );

  // Derived state for current organization
  const currentOrganization = useMemo(() => {
    return organizations.find(org => org.id === currentOrganizationId) || organizations[0];
  }, [organizations, currentOrganizationId]);

  console.log('Current Organization:', currentOrganization);

  // Status state - initialize icon with a safe default first
  const [icon, setIcon] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const { status } = useSession();

  // Update icon whenever currentOrganization changes
  useEffect(() => {
    if (
      currentOrganization &&
      currentOrganization.ai_params &&
      currentOrganization.ai_params.provider
    ) {
      setIcon(availableProvidersData[currentOrganization.ai_params.provider]?.icon || '');
    }
    if (currentOrganization.settings.theme !== theme) {
      setTheme(currentOrganization.settings.theme);
    }
  }, [currentOrganization]);

  // Load organizations from localStorage on mount
  useEffect(() => {
    try {
      if (status !== 'authenticated') return; // Only load if authenticated

      const storedOrganizations = localStorage.getItem('organizations');
      if (storedOrganizations) {
        const storage: OrganizationsStorage = JSON.parse(storedOrganizations);

        if (
          storage.organizations &&
          Array.isArray(storage.organizations) &&
          storage.organizations.length > 0
        ) {
          setOrganizations(storage.organizations);

          // Set current organization from lastOrganizationId or default to first
          const lastOrgId = storage.lastOrganizationId;
          if (lastOrgId && storage.organizations.some(org => org.id === lastOrgId)) {
            setCurrentOrganizationId(lastOrgId);
          } else {
            setCurrentOrganizationId(storage.organizations[0].id);
          }
        }
      } else {
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      setSaveError('Failed to load your organizations. Using default settings.');
    }
  }, [status]); // Run only when auth status changes

  // Update icon when provider changes
  useEffect(() => {
    setIcon(availableProvidersData[currentOrganization.ai_params.provider]?.icon || '');
  }, [currentOrganization.ai_params?.provider]);

  // Save organizations to localStorage (debounced)
  useEffect(() => {
    if (status !== 'authenticated') return; // Only save if authenticated

    // Debounce the save operation
    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const storageData: OrganizationsStorage = {
          organizations,
          lastOrganizationId: currentOrganizationId,
        };
        localStorage.setItem('organizations', JSON.stringify(storageData));
        setLastSaved(new Date()); // Update lastSaved after successful save
      } catch (error) {
        console.error('Error saving organizations:', error);
        setSaveError(error instanceof Error ? error.message : 'Unknown error saving settings');
      } finally {
        setIsSaving(false);
      }
    }, 800); // Debounce delay

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount or dependency change
  }, [organizations, currentOrganizationId, status]); // Depend on the data structure and ID

  // Organization management functions
  const switchOrganization = (id: string) => {
    // Only switch if the ID is different and exists
    if (id !== currentOrganizationId && organizations.some(org => org.id === id)) {
      setCurrentOrganizationId(id);
    }
  };

  const addOrganization = (name: string) => {
    if (organizations.length >= 4) {
      setSaveError('You can only create up to 4 organizations with the current plan.');
      return;
    }

    const newOrg = createDefaultOrganization(name);
    const updatedOrgs = [...organizations, newOrg];

    setOrganizations(updatedOrgs);
    setTimeout(() => {
      setCurrentOrganizationId(newOrg.id);
    }, 0);
  };

  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    setOrganizations(prev =>
      prev.map(org =>
        org.id === id ? { ...org, ...updates, updatedAt: new Date().toISOString() } : org
      )
    );
  };

  const removeOrganization = (id: string) => {
    // Prevent removing the last organization
    if (organizations.length <= 1) {
      setSaveError('You must have at least one organization.');
      return;
    }

    setOrganizations(prev => {
      const filtered = prev.filter(org => org.id !== id);

      // If we're removing the current organization, switch to the first available
      if (id === currentOrganizationId) {
        setTimeout(() => {
          setCurrentOrganizationId(filtered[0].id);
        }, 0);
      }

      return filtered;
    });
  };

  // Unified update function for any organization property
  const updateOrganizationProperty = <K extends keyof Organization>(
    property: K,
    value: Organization[K]
  ) => {
    setOrganizations(prev =>
      prev.map(org =>
        org.id === currentOrganizationId
          ? { ...org, [property]: value, updatedAt: new Date().toISOString() }
          : org
      )
    );
  };

  // Specialized update functions
  const updateAIParams = (params: Partial<AIParams>) => {
    setOrganizations(prev =>
      prev.map(org =>
        org.id === currentOrganizationId
          ? {
              ...org,
              ai_params: { ...org.ai_params, ...params },
              updatedAt: new Date().toISOString(),
            }
          : org
      )
    );
  };

  const updateSettings = (settings: Partial<OrganizationSettings>) => {
    setOrganizations(prev =>
      prev.map(org =>
        org.id === currentOrganizationId
          ? {
              ...org,
              settings: { ...org.settings, ...settings },
              updatedAt: new Date().toISOString(),
            }
          : org
      )
    );
  };

  // Agent management functions
  const addAgent = (agentData: Omit<Agent, 'id'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: uuidv4(),
    };

    updateOrganizationProperty('agents', [...currentOrganization.agents, newAgent]);
  };

  const updateAgent = (agentId: string, agentData: Omit<Agent, 'id'>) => {
    const updatedAgents = currentOrganization.agents.map(agent =>
      agent.id === agentId ? { ...agentData, id: agentId } : agent
    );

    updateOrganizationProperty('agents', updatedAgents);
  };

  const removeAgent = (agentId: string) => {
    const filteredAgents = currentOrganization.agents.filter(agent => agent.id !== agentId);
    updateOrganizationProperty('agents', filteredAgents);
  };

  // Project management functions
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateOrganizationProperty('projects', [...currentOrganization.projects, newProject]);
  };

  const updateProject = (
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const updatedProjects = currentOrganization.projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : project
    );

    updateOrganizationProperty('projects', updatedProjects);
  };

  const removeProject = (projectId: string) => {
    const filteredProjects = currentOrganization.projects.filter(
      project => project.id !== projectId
    );
    updateOrganizationProperty('projects', filteredProjects);
  };

  // Direct setters for backward compatibility
  const setProvider = (provider: AIProvider) => {
    updateAIParams({ provider });

    // Also update model if needed
    if (availableProvidersData[provider]?.models.length > 0) {
      updateAIParams({ model: availableProvidersData[provider].models[0].id });
    }
  };

  const setModel = (model: string) => {
    updateAIParams({ model });
  };

  const setTemperature = (temperature: number) => {
    updateAIParams({ temperature });
  };

  const setSystemPrompt = (systemPrompt: string) => {
    updateAIParams({ systemPrompt });
  };

  const setOrganizationPrompt = (organizationPrompt: string) => {
    updateAIParams({ organizationPrompt });
  };

  const setPreferences = (preferences: Partial<OrganizationSettings>) => {
    updateSettings(preferences);
  };

  // Create the context value
  const value = useMemo<OrganizationContextType>(
    () => ({
      // Core data
      organizations,
      currentOrganization,

      // Organization management
      switchOrganization,
      addOrganization,
      updateOrganization,
      removeOrganization,

      // High-level update functions
      updateOrganizationProperty,
      updateAIParams,
      updateSettings,

      // Agent management
      addAgent,
      updateAgent,
      removeAgent,

      // Project management
      addProject,
      updateProject,
      removeProject,

      // Backward compatibility accessors
      provider: currentOrganization.ai_params.provider,
      model: currentOrganization.ai_params.model,
      temperature: currentOrganization.ai_params.temperature,
      systemPrompt: currentOrganization.ai_params.systemPrompt,
      organizationPrompt: currentOrganization.ai_params.organizationPrompt,
      agents: currentOrganization.agents,
      icon,
      preferences: currentOrganization.settings,

      // Direct setters for backward compatibility
      setProvider,
      setModel,
      setTemperature,
      setSystemPrompt,
      setOrganizationPrompt,
      setPreferences,

      // Available providers data
      availableProviders: availableProvidersData,

      // Saving status
      lastSaved,
      isSaving,
      saveError,
    }),
    [
      organizations,
      currentOrganization,
      currentOrganizationId,
      icon,
      lastSaved,
      isSaving,
      saveError,
    ]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};
