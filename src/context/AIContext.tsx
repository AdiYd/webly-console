'use client';

import React from 'react';
import { useOrganization } from './OrganizationContext';
import { type AIProvider, type Agent } from './OrganizationContext';

// This context is now a compatibility layer that redirects to the unified OrganizationContext
// It's maintained to avoid breaking existing code, but new code should use OrganizationContext directly

interface AIContextType {
  provider: AIProvider;
  model: string;
  temperature: number;
  organizationPrompt: string;
  icon: string;
  agents: Agent[];
  availableProviders: Record<
    AIProvider,
    {
      name: string;
      icon?: string;
      models: any[];
    }
  >;
  setProvider: (provider: AIProvider) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setOrganizationPrompt: (prompt: string) => void;
  addAgent: (agentData: Omit<Agent, 'id'>) => void;
  updateAgent: (agentId: string, agentData: Omit<Agent, 'id'>) => void;
  removeAgent: (agentId: string) => void;
  lastSaved: Date | null;
  isSaving: boolean;
  saveError: string | null;
}

// Create the context hook that redirects to OrganizationContext
export const useAI = (): AIContextType => {
  const org = useOrganization();

  return {
    provider: org.provider,
    model: org.model,
    temperature: org.temperature,
    organizationPrompt: org.organizationPrompt,
    icon: org.icon,
    agents: org.agents,
    availableProviders: org.availableProviders,
    setProvider: org.setProvider,
    setModel: org.setModel,
    setTemperature: org.setTemperature,
    setOrganizationPrompt: org.setOrganizationPrompt,
    addAgent: org.addAgent,
    updateAgent: org.updateAgent,
    removeAgent: org.removeAgent,
    lastSaved: org.lastSaved,
    isSaving: org.isSaving,
    saveError: org.saveError,
  };
};

// AIContextProvider is now just a pass-through component that doesn't do anything
// It's maintained for backward compatibility
export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Re-export types for backward compatibility
export type { AIProvider, Agent };
