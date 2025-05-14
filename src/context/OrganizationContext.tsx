'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
import { clientLogger } from '@/utils/logger';

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
  isPrivate?: boolean; // Add this to indicate if agent is private to an organization
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
  agents: string[]; // Array of agent IDs (references to global agents)
  privateAgents: Agent[]; // Array of organization-specific agents (full objects)
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
  addAgent: (agentData: Omit<Agent, 'id'>, isPrivate?: boolean) => Promise<void>; // create agent
  updateAgent: (agentId: string, agentData: Partial<Omit<Agent, 'id'>>) => Promise<void>; // update agent
  removeAgent: (agentId: string) => Promise<void>; // remove agent from org
  importAgent: (agentId: string) => Promise<void>; // import global agent to org
  getAgentById: (agentId: string) => Agent | undefined; // get agent by ID (whether global or private)

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
  agents: [], // Reference IDs to global agents
  privateAgents: [], // Full objects of private agents
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
  projects: [
    {
      id: uuidv4(),
      name: 'Default Project',
      description: 'My first project to get started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
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
  importAgent: async () => {},
  getAgentById: () => undefined,

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

  // Global agents state with example data
  const [globalAgents, setGlobalAgents] = useState<Agent[]>([
    {
      id: 'sample-marketing-agent',
      avatar: 'mdi:account-tie',
      name: 'Marketing Expert',
      role: 'Marketing Strategy Specialist',
      description:
        'I specialize in digital marketing strategies, content planning, and campaign optimization.',
      prompt:
        'You are a marketing specialist with expertise in digital marketing strategies, content planning, and campaign optimization.',
      isPrivate: false,
    },
    {
      id: 'sample-research-agent',
      avatar: 'mdi:flask',
      name: 'Research Assistant',
      role: 'Data Analysis & Research',
      description:
        'I help gather and analyze information, prepare reports, and provide insights based on data.',
      prompt:
        'You are a research assistant focused on data analysis, information gathering, and providing factual insights.',
      isPrivate: false,
    },
  ]);

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

  // Helper function to get agent by ID (whether global or private)
  const getAgentById = useCallback(
    (agentId: string): Agent | undefined => {
      // First check global agents
      const globalAgent = globalAgents.find(agent => agent.id === agentId);
      if (globalAgent) return globalAgent;

      // Then check private agents
      const privateAgent = currentOrganization.privateAgents?.find(agent => agent.id === agentId);
      if (privateAgent) return privateAgent;

      return undefined;
    },
    [globalAgents, currentOrganization]
  );

  // Derive assigned agents based on currentOrganization.agents
  const assignedAgents = useMemo(() => {
    // Combine imported global agents with private agents
    const importedGlobalAgents = currentOrganization.agents
      .map(id => globalAgents.find(agent => agent.id === id))
      .filter(agent => agent !== undefined) as Agent[];

    return [...importedGlobalAgents, ...(currentOrganization.privateAgents || [])];
  }, [globalAgents, currentOrganization.agents, currentOrganization.privateAgents]);

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

  // Load global agents on auth (replace with local data for now)
  useEffect(() => {
    if (status !== 'authenticated') return;

    // For now, just use the initial state data
    // In a real app, this would load from Firestore
    // const fetchGlobalAgents = async () => {
    //   try {
    //     const snap = await getDocs(collection(db, 'agents'));
    //     const agents = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Agent, 'id'>) }));
    //     setGlobalAgents(agents);
    //   } catch (error) {
    //     console.error('Error loading agents:', error);
    //   }
    // };
    // fetchGlobalAgents();
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
    if (organizations.length >= 2) {
      setSaveError('You can only create up to 2 organizations with the current plan.');
      return;
    }

    const newOrg = createDefaultOrganization(name);
    // This ensures the organization has at least one project by using createDefaultOrganization
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
  const addAgent = async (agentData: Omit<Agent, 'id'>, isPrivate = false) => {
    try {
      const newAgentId = uuidv4(); // Generate ID locally for now
      const newAgent: Agent = { ...agentData, id: newAgentId, isPrivate };

      if (isPrivate) {
        // Add to organization's private agents
        setOrganizations(orgs =>
          orgs.map(org => {
            if (org.id === currentOrganizationId) {
              const updatedPrivateAgents = [...(org.privateAgents || []), newAgent];
              return { ...org, privateAgents: updatedPrivateAgents };
            }
            return org;
          })
        );
      } else {
        // Add to global agents and reference in organization
        setGlobalAgents(prev => [...prev, newAgent]);

        // Add reference to organization's agents list
        setOrganizations(orgs =>
          orgs.map(org => {
            if (org.id === currentOrganizationId) {
              const updatedAgents = [...(org.agents || []), newAgentId];
              return { ...org, agents: updatedAgents };
            }
            return org;
          })
        );
      }

      clientLogger.debug('Agent added successfully', '', { isPrivate });
      return Promise.resolve();
    } catch (error) {
      clientLogger.error('Error adding agent:', '', error);
      return Promise.reject(error);
    }
  };

  const updateAgent = async (agentId: string, data: Partial<Omit<Agent, 'id'>>) => {
    try {
      // Check if this is a global agent
      const isGlobalAgent = globalAgents.some(agent => agent.id === agentId);

      if (isGlobalAgent) {
        // Update in global agents
        setGlobalAgents(prev => prev.map(a => (a.id === agentId ? { ...a, ...data } : a)));
      } else {
        // Update in organization's private agents
        setOrganizations(orgs =>
          orgs.map(org => {
            if (org.id === currentOrganizationId) {
              const updatedPrivateAgents = (org.privateAgents || []).map(agent =>
                agent.id === agentId ? { ...agent, ...data } : agent
              );
              return { ...org, privateAgents: updatedPrivateAgents };
            }
            return org;
          })
        );
      }

      clientLogger.debug('Agent updated successfully', '', { agentId });
      return Promise.resolve();
    } catch (error) {
      clientLogger.error('Error updating agent:', '', error);
      return Promise.reject(error);
    }
  };

  const removeAgent = async (agentId: string) => {
    try {
      // Check if this is a global agent reference or private agent
      const isGlobalAgentRef = currentOrganization.agents.includes(agentId);

      if (isGlobalAgentRef) {
        // Remove reference from organization
        setOrganizations(orgs =>
          orgs.map(org => {
            if (org.id === currentOrganizationId) {
              const updatedAgents = org.agents.filter(id => id !== agentId);
              return { ...org, agents: updatedAgents };
            }
            return org;
          })
        );
      } else {
        // Remove from organization's private agents
        setOrganizations(orgs =>
          orgs.map(org => {
            if (org.id === currentOrganizationId) {
              const updatedPrivateAgents = (org.privateAgents || []).filter(
                agent => agent.id !== agentId
              );
              return { ...org, privateAgents: updatedPrivateAgents };
            }
            return org;
          })
        );
      }

      clientLogger.debug('Agent removed successfully', '', { agentId });
      return Promise.resolve();
    } catch (error) {
      clientLogger.error('Error removing agent:', '', error);
      return Promise.reject(error);
    }
  };

  const importAgent = async (agentId: string) => {
    try {
      // Check if agent exists in global agents
      const agent = globalAgents.find(a => a.id === agentId);
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found in global agents`);
      }

      // Check if agent is already imported
      if (currentOrganization.agents.includes(agentId)) {
        throw new Error(`Agent with ID ${agentId} is already imported`);
      }

      // Add reference to organization's agents list
      setOrganizations(orgs =>
        orgs.map(org => {
          if (org.id === currentOrganizationId) {
            const updatedAgents = [...org.agents, agentId];
            return { ...org, agents: updatedAgents };
          }
          return org;
        })
      );

      clientLogger.debug('Agent imported successfully', '', { agentId });
      return Promise.resolve();
    } catch (error) {
      clientLogger.error('Error importing agent:', '', error);
      return Promise.reject(error);
    }
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
      importAgent,
      getAgentById,

      // Assign agents for backward compatibility
      agents: assignedAgents,

      // Project management
      addProject,
      updateProject,
      removeProject,

      // Backward compatibility accessors
      provider: currentOrganization.ai_params.provider,
      model: currentOrganization.ai_params.model,
      temperature: currentOrganization.ai_params.temperature,
      organizationPrompt: currentOrganization.ai_params.organizationPrompt,
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
      globalAgents,
      assignedAgents,
      getAgentById,
    ]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};
