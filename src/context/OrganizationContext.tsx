'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Theme, useTheme } from '@/components/ui/theme-provider';
import { db } from '@/lib/firebase/firebase-client';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  doc,
} from 'firebase/firestore';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'grok';
export type Capabilitys = 'chat' | 'vision' | 'code' | 'text-to-image' | 'audio-to-text';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: Capabilitys[];
  maxTokens: number;
}

// Define the Agent interface
export interface Agent {
  id: string;
  avatar: string;
  name: string;
  role: string;
  description: string;
  prompt: string;
}

// Define the AI parameters interface
export interface AIParams {
  provider: AIProvider;
  model: string;
  temperature: number;
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
  agents: Agent[]; // list of global agent IDs assigned to this organization
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
  name: string;

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
  globalAgents: Agent[]; // all available global agents
  addAgent: (agentData: Omit<Agent, 'id'>) => Promise<void>; // create and assign agent
  updateAgent: (agentId: string, agentData: Partial<Omit<Agent, 'id'>>) => Promise<void>; // update global agent
  removeAgent: (agentId: string) => Promise<void>; // unassign from org

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
  organizationPrompt: string;
  agents: Agent[];
  icon: string;
  preferences: OrganizationSettings;

  // Direct setters (maintained for backward compatibility)
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
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
  isAuth: boolean;
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
  name: defaultOrganization.name,

  // Organization management
  switchOrganization: () => {},
  addOrganization: () => {},
  updateOrganization: () => {},
  removeOrganization: () => {},

  // High-level update functions
  updateOrganizationProperty: () => {},
  updateAIParams: () => {},
  updateSettings: () => {},

  // Agent management
  globalAgents: [],
  agents: [],
  addAgent: async () => {},
  updateAgent: async () => {},
  removeAgent: async () => {},

  // Project management
  addProject: () => {},
  updateProject: () => {},
  removeProject: () => {},

  // Backward compatibility accessors
  provider: defaultOrganization.ai_params.provider,
  model: defaultOrganization.ai_params.model,
  temperature: defaultOrganization.ai_params.temperature,
  organizationPrompt: defaultOrganization.ai_params.organizationPrompt,
  icon: availableProvidersData[defaultOrganization.ai_params.provider].icon || '',
  preferences: defaultOrganization.settings,

  // Direct setters for backward compatibility
  setProvider: () => {},
  setModel: () => {},
  setTemperature: () => {},
  setOrganizationPrompt: () => {},
  setPreferences: () => {},

  availableProviders: availableProvidersData,

  // Saving status
  lastSaved: null,
  isSaving: false,
  saveError: null,
  isAuth: false,
};

// Create the context
const OrganizationContext = createContext<OrganizationContextType>(defaultValues);

// Hook to use the organization context
export const useOrganization = () => useContext(OrganizationContext);

// Provider component
export const OrganizationContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const isAuth = status === 'authenticated';

  // State for organizations and current organization
  const [organizations, setOrganizations] = useState<Organization[]>([defaultOrganization]);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string>(
    defaultOrganization.id
  );

  // Global agents state
  const [globalAgents, setGlobalAgents] = useState<Agent[]>([]);

  // Derived state for current organization
  const currentOrganization = useMemo(() => {
    return organizations.find(org => org.id === currentOrganizationId) || organizations[0];
  }, [organizations, currentOrganizationId]);

  // console.log('Current Organization:', currentOrganization);

  // Status state - initialize icon with a safe default first
  const [icon, setIcon] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  // Derive assigned agents based on currentOrganization.agent
  const assignedAgents = useMemo(
    () => globalAgents.filter(agent => currentOrganization.agents.some(a => a.id === agent.id)),
    [globalAgents, currentOrganization.agents]
  );

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

  // Load global agents on auth
  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'agents'));
        const agents = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Agent, 'id'>) }));
        setGlobalAgents(agents);
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    })();
  }, [status]);

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

  // Functions to manage agents
  const addAgent = async (agentData: Omit<Agent, 'id'>) => {
    if (!isAuth || !session?.user?.id) return;
    const ref = await addDoc(collection(db, 'agents'), agentData);
    setGlobalAgents(prev => [...prev, { ...agentData, id: ref.id }]);
    const orgRef = doc(db, `users/${session.user.id}/organizations/${currentOrganization.id}`);
    await updateDoc(orgRef, { agent: arrayUnion(ref.id) });
    setOrganizations(orgs =>
      orgs.map(o => (o.id === currentOrganization.id ? { ...o, agent: [...o.agents, ref.id] } : o))
    );
  };

  const updateAgent = async (agentId: string, data: Partial<Omit<Agent, 'id'>>) => {
    if (!isAuth) return;
    const agentRef = doc(db, 'agents', agentId);
    await updateDoc(agentRef, data);
    setGlobalAgents(prev => prev.map(a => (a.id === agentId ? { ...a, ...data } : a)));
  };

  const removeAgent = async (agentId: string) => {
    if (!isAuth) return;
    // unassign from org
    const orgRef = doc(db, `users/${session?.user?.id}/organizations/${currentOrganization.id}`);
    await updateDoc(orgRef, { agent: arrayRemove(agentId) });
    setOrganizations(orgs =>
      orgs.map(o =>
        o.id === currentOrganization.id
          ? { ...o, agent: o.agents.filter(agent => agent.id !== agentId) }
          : o
      )
    );
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
      globalAgents,
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
      organizationPrompt: currentOrganization.ai_params.organizationPrompt,
      agents: currentOrganization.agents,
      name: currentOrganization.name,
      icon,
      preferences: currentOrganization.settings,

      // Direct setters for backward compatibility
      setProvider,
      setModel,
      setTemperature,
      setOrganizationPrompt,
      setPreferences,

      // Available providers data
      availableProviders: availableProvidersData,

      // Saving status
      lastSaved,
      isSaving,
      saveError,
      isAuth,
    }),
    [
      organizations,
      currentOrganization,
      currentOrganizationId,
      icon,
      lastSaved,
      isSaving,
      saveError,
      status,
    ]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};
