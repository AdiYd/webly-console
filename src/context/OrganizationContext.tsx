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
  getDoc,
  query,
  where,
  setDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { Project, ProjectListItem } from '@/types/project';

// We'll install sonner in a separate step
// import { toast } from 'sonner';

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

// Define the Organization interface with unified structure
export interface Organization {
  id: string;
  name: string;
  agents: string[]; // Array of agent IDs (references to global agents)
  privateAgents: Agent[]; // Array of organization-specific agents (full objects)
  ai_params: AIParams;
  settings: OrganizationSettings;
  projects: ProjectListItem[]; // Store minimal project data in organization
  createdAt: string;
  updatedAt: string;
  userId?: string; // Reference to the user who owns this organization
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
  addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;

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
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        capabilities: ['chat'],
        maxTokens: 8192,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        capabilities: ['chat'],
        maxTokens: 16385,
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
      {
        id: 'grok-1',
        name: 'Grok 1',
        provider: 'grok',
        capabilities: ['chat'],
        maxTokens: 8192,
      },
    ],
  },
};

// Creates a default organization with all required fields
const createDefaultOrganization = (
  name: string = 'My Organization',
  userId?: string
): Organization => ({
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
  projects: [], // Projects will be loaded from Firestore
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId,
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
  addProject: async () => ({ id: '', name: '', description: '', createdAt: '', updatedAt: '' }),
  updateProject: async () => {},
  removeProject: async () => {},

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
  const userId = session?.user?.email;

  // State for orgs + currentOrgId
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string>('');
  const [globalAgents, setGlobalAgents] = useState<Agent[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 1️⃣ On mount: try LSO cache
  useEffect(() => {
    if (!isAuth || !userId) return;
    const stored = localStorage.getItem('orgsCache');
    if (stored) {
      try {
        const parsed: Organization[] = JSON.parse(stored);
        setOrganizations(parsed);
        const last = localStorage.getItem('lastOrgId');
        if (last && parsed.some(o => o.id === last)) {
          setCurrentOrganizationId(last);
        } else if (parsed.length) {
          setCurrentOrganizationId(parsed[0].id);
        }
      } catch {}
    }
    // 2️⃣ Always fetch Firestore in background
    (async () => {
      const orgCol = collection(db, 'users', userId, 'organizations');
      const orgSnap = await getDocs(orgCol);
      const loaded: Organization[] = [];
      for (const o of orgSnap.docs) {
        const data = o.data() as Omit<Organization, 'id' | 'projects'>;
        // load projects subcollection
      }
    })();
  }, [isAuth, userId]);

  // --- helper to switch org ---
  const switchOrganization = (id: string) => {
    setCurrentOrganizationId(id);
    localStorage.setItem('lastOrgId', id);
  };

  // --- addOrganization under users/{uid}/organizations ---
  const addOrganization = async (name: string) => {
    if (!userId) throw new Error('No user');
    const colRef = collection(db, 'users', userId, 'organizations');
    const orgData = createDefaultOrganization(name, userId);
    const docRef = await addDoc(colRef, {
      ...orgData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // also create default project subcol
    await addDoc(collection(db, 'users', userId, 'organizations', docRef.id, 'projects'), {
      id: uuidv4(),
      name: 'Default Project',
      description: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // refresh cache in background
    switchOrganization(docRef.id);
    // ...existing success toast...
  };

  // --- updateOrganization at users/{uid}/organizations/{id} ---
  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    if (!userId) throw new Error('No user');
    const docRef = doc(db, 'users', userId, 'organizations', id);
    const valid: any = { updatedAt: serverTimestamp() };
    if (updates.name) valid.name = updates.name;
    if (updates.settings) valid.settings = updates.settings;
    if (updates.ai_params) valid.ai_params = updates.ai_params;
    await updateDoc(docRef, valid);
    // local state
    setOrganizations(orgs => orgs.map(o => (o.id === id ? { ...o, ...updates } : o)));
  };

  // --- removeOrganization: just delete subcollection ref + doc ---
  const removeOrganization = async (id: string) => {
    if (!userId) throw new Error('No user');
    await deleteDoc(doc(db, 'users', userId, 'organizations', id));
    setOrganizations(orgs => orgs.filter(o => o.id !== id));
    // pick new current
    if (currentOrganizationId === id && organizations.length > 1) {
      const next = organizations.find(o => o.id !== id)!.id;
      switchOrganization(next);
    }
  };

  // --- rest of your context and value memo ---
  const currentOrganization = useMemo(
    () => organizations.find(o => o.id === currentOrganizationId)!,
    [organizations, currentOrganizationId]
  );

  const value = useMemo(
    () => ({
      organizations,
      currentOrganization,
      switchOrganization,
      addOrganization,
      updateOrganization,
      removeOrganization,
      // ...existing context methods...
    }),
    [organizations, currentOrganization, currentOrganizationId]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};
