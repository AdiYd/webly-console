'use client';

import { useState, useEffect, useId, useRef } from 'react';
import { useOrganization, Organization, AIProvider, Agent } from '@/context/OrganizationContext';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-screen';
import { Icon } from '@/components/ui/icon';
import { useTheme, Theme, darkThemes } from '@/components/ui/theme-provider';
import { themeCategories, themeEmoji, themeIconify } from '@/components/ui/theme-toggle';

// Predefined avatar icons for agents
const agentAvatars = [
  'mdi:account-tie',
  'mdi:account-hard-hat',
  'mdi:account-school',
  'mdi:account-cash',
  'mdi:account-heart',
  'mdi:account-star',
  'mdi:brain',
  'mdi:code-braces',
  'mdi:chart-line',
  'mdi:palette',
  'mdi:flask',
  'mdi:gavel',
  'mdi:doctor',
  'mdi:presentation',
  'mdi:finance',
  'mdi:human-greeting-variant',
  'mdi:book-open-page-variant',
  'mdi:robot-industrial',
];

// Decorative patterns for agent cards - using CSS gradients for visual appeal
const cardPatterns = [
  'radial-gradient(circle at top right, var(--fallback-p,oklch(var(--p)/0.15)), transparent 40%)',
  'linear-gradient(60deg, var(--fallback-s,oklch(var(--s)/0.1)), transparent 40%)',
  'radial-gradient(circle at bottom left, var(--fallback-a,oklch(var(--a)/0.12)), transparent 30%)',
  'linear-gradient(135deg, var(--fallback-p,oklch(var(--p)/0.1)), transparent 60%)',
  'radial-gradient(circle at top left, var(--fallback-s,oklch(var(--s)/0.12)), transparent 50%)',
  'linear-gradient(to right, var(--fallback-a,oklch(var(--a)/0.08)), transparent 70%)',
];

// --- OrganizationSwitcher Component ---
interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrganization: Organization;
  onSwitch: (id: string) => void;
  onAddNew: () => void;
}

function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onSwitch,
  onAddNew,
}: OrganizationSwitcherProps) {
  const dropdownTriggerRef = useRef<HTMLDivElement>(null); // Add a ref

  const handleSwitch = (id: string) => {
    onSwitch(id);
    dropdownTriggerRef.current?.blur(); // Remove focus to close
  };

  const handleAddNew = () => {
    onAddNew();
    dropdownTriggerRef.current?.blur(); // Remove focus to close
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        ref={dropdownTriggerRef}
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm normal-case gap-2 transition-all hover:bg-base-200 group"
      >
        <div className="flex items-center gap-2 max-w-[250px]">
          <div className="avatar placeholder">
            <div className="bg-base-200 text-base-content w-6 h-6 rounded-full">
              <span className="text-xs">{currentOrganization.name.charAt(0)}</span>
            </div>
          </div>
          <span className="text-sm font-medium truncate">{currentOrganization.name}</span>
          <Icon icon="mdi:chevron-down" className="w-4 h-4 opacity-60 group-hover:opacity-100" />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-60 mt-1*"
      >
        <li className="menu-title py-1 px-2 text-xs font-medium opacity-60">Organizations</li>
        <div className="max-h-[240px] overflow-y-auto">
          {organizations.map(org => (
            <li key={org.id}>
              <button
                onClick={() => handleSwitch(org.id)}
                className={cn(
                  'flex items-center gap-2 py-2',
                  org.id === currentOrganization.id ? 'active' : ''
                )}
              >
                <div className="avatar rounded-3xl placeholder">
                  <div
                    className={`${
                      org.id === currentOrganization.id ? 'bg-base-300' : 'bg-base-300'
                    } text-base-content w-6 h-6 rounded-full transition-colors`}
                  >
                    <span className="text-xs">{org.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="flex-1 truncate">{org.name}</div>
                {org.id === currentOrganization.id && (
                  <Icon icon="mdi:check" className="w-4 h-4 text-success" />
                )}
              </button>
            </li>
          ))}
        </div>
        <div className="divider my-1"></div>
        <li>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 text-primary"
            disabled={organizations.length >= 4}
          >
            <Icon icon="mdi:plus" className="w-5 h-5" />
            <span>New Organization</span>
            {organizations.length >= 4 && (
              <span className="badge badge-sm badge-outline">Limit</span>
            )}
          </button>
        </li>
      </ul>
    </div>
  );
}

// --- New Organization Modal Component ---
interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  editOrganization?: Organization;
  title?: string;
}

function OrganizationModal({
  isOpen,
  onClose,
  onSave,
  editOrganization,
  title = 'New Organization',
}: OrganizationModalProps) {
  const modalId = useId();
  const [name, setName] = useState(editOrganization?.name || '');

  useEffect(() => {
    if (editOrganization) {
      setName(editOrganization.name);
    } else {
      setName('');
    }
  }, [editOrganization, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name);
    onClose();
  };

  useEffect(() => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal) {
      if (isOpen) {
        modal.showModal();
      } else {
        modal.close();
      }
    }
  }, [isOpen, modalId]);

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Organization Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Marketing Team"
              className="input input-bordered w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <label className="label">
              <span className="label-text-alt">
                This will be the name of your organization and its AI settings profile.
              </span>
            </label>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editOrganization ? 'Save Changes' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

// --- AgentModal Component (Same as before) ---
interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentData: Omit<Agent, 'id'>, agentId?: string) => void;
  agent?: Agent;
  title?: string;
}

function AgentModal({ isOpen, onClose, onSave, agent, title = 'Add New Agent' }: AgentModalProps) {
  const modalId = useId();
  const [avatar, setAvatar] = useState<string>(agent?.avatar || agentAvatars[0]);
  const [name, setName] = useState(agent?.name || '');
  const [role, setRole] = useState(agent?.role || '');
  const [description, setDescription] = useState(agent?.description || '');
  const [prompt, setPrompt] = useState(agent?.prompt || '');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Update form when agent changes (for editing)
    if (agent) {
      setAvatar(agent.avatar);
      setName(agent.name);
      setRole(agent.role);
      setDescription(agent.description);
    } else {
      // Reset form for new agent
      setAvatar(agentAvatars[0]);
      setName('');
      setRole('');
      setDescription('');
    }
  }, [agent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !description) return; // Basic validation

    onSave({ avatar, name, role, description, prompt }, agent?.id);
    onClose();
  };

  useEffect(() => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal) {
      if (isOpen) {
        modal.showModal();
      } else {
        modal.close();
      }
    }
  }, [isOpen, modalId]);

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Avatar Selection */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Agent Avatar</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {agentAvatars.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setAvatar(icon)}
                  className={cn(
                    'btn btn-square btn-sm',
                    avatar === icon ? 'btn-primary' : 'btn-ghost'
                  )}
                >
                  <Icon icon={icon} />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Agent Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Marketing Guru"
              className="input input-bordered w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Agent Role</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Specialist in Digital Marketing"
              className="input input-bordered w-full"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            />
          </div>

          {/* Description (System Prompt) */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Agent Description (System Prompt)</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              placeholder="Describe the agent's expertise and how they should behave..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            ></textarea>
            <label className="label">
              <span className="label-text-alt">
                This defines how the agent will respond and what knowledge they'll have.
              </span>
            </label>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {agent ? 'Save Changes' : 'Add Agent'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

// --- Agent Card Component (Same as before) ---
interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: string) => void;
  patternIndex: number;
}

function AgentCard({ agent, onEdit, onDelete, patternIndex }: AgentCardProps) {
  const patternStyle = {
    backgroundImage: cardPatterns[patternIndex % cardPatterns.length],
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden h-[180px]"
      onClick={() => onEdit(agent)}
    >
      <div className="absolute inset-0 opacity-20" style={patternStyle}></div>
      <div className="card-body p-4 relative">
        <div className="flex items-start gap-3">
          {/* Avatar with decorative circle */}
          <div className="avatar">
            <div className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-gradient-to-br from-base-100 to-base-300 flex items-center justify-center">
              <Icon width={35} height={35} icon={agent.avatar} className="text-primary" />
            </div>
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <h3 className="card-title text-base font-bold leading-tight">{agent.name}</h3>
            <p className="text-xs font-medium text-primary mt-0.5">{agent.role}</p>

            {/* Description with truncation */}
            <div className="mt-3">
              <p className="text-xs text-base-content/80 line-clamp-4">
                {truncateText(agent.description, 120)}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons - positioned absolutely to avoid click interference */}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-primary"
            onClick={e => {
              e.stopPropagation();
              onEdit(agent);
            }}
            aria-label={`Edit agent ${agent.name}`}
          >
            <Icon icon="mdi:pencil" className="w-3.5 h-3.5" />
          </button>
          <button
            className="btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-error"
            onClick={e => {
              e.stopPropagation();
              onDelete(agent.id);
            }}
            aria-label={`Delete agent ${agent.name}`}
          >
            <Icon icon="mdi:trash" className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute bottom-2 right-2">
          <div className="badge badge-xs p-2 badge-primary text-xs">Expert</div>
        </div>
      </div>
    </div>
  );
}

// --- Main ProfilePage Component ---
export default function ProfilePage() {
  const {
    organizations,
    currentOrganization,
    addOrganization,
    updateOrganization,
    removeOrganization,
    switchOrganization,
    provider,
    model,
    temperature,
    organizationPrompt,
    agents,
    availableProviders,
    setProvider,
    setModel,
    setTemperature,
    setOrganizationPrompt,
    addAgent,
    updateAgent,
    removeAgent,
    preferences,
    setPreferences,
    lastSaved,
    isSaving,
    saveError,
  } = useOrganization();

  // Placeholder for user role
  const userRole = 'Trial'; // Hardcoded for demonstration
  const maxAgents = userRole === 'Trial' ? 2 : 5;
  const maxOrganizations = 4;

  const { theme, setTheme, isDarkTheme } = useTheme();
  const { isMobile } = useBreakpoint();
  const [activeCategory, setActiveCategory] = useState<string>('base');

  // Agent modal state
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | undefined>(undefined);
  const [agentModalTitle, setAgentModalTitle] = useState('Add New Agent');

  // Organization modal state
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [currentEditOrg, setCurrentEditOrg] = useState<Organization | undefined>(undefined);
  const [orgModalTitle, setOrgModalTitle] = useState('New Organization');

  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Sync theme with current organization preference
  useEffect(() => {
    if (preferences.theme !== theme) {
      setTheme(preferences.theme);
    }
  }, [preferences.theme]);

  // Update theme in organization preferences when changed globally
  // useEffect(() => {
  //   if (theme !== preferences.theme) {
  //     setPreferences({
  //       ...preferences,
  //       theme: theme as Theme,
  //     });
  //   }
  // }, [theme, preferences, setPreferences]);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setPreferences({
      ...preferences,
      theme: newTheme,
    });
  };

  const handleSaveHistoryChange = (saveHistory: boolean) => {
    setPreferences({
      ...preferences,
      saveHistory,
    });
  };

  // Organization management handlers
  const handleAddOrganization = () => {
    if (organizations.length >= maxOrganizations) {
      // Show toast error
      setSavedStatus('error');
      return;
    }
    setCurrentEditOrg(undefined);
    setOrgModalTitle('New Organization');
    setIsOrgModalOpen(true);
  };

  const handleEditOrganization = (org: Organization) => {
    setCurrentEditOrg(org);
    setOrgModalTitle('Edit Organization');
    setIsOrgModalOpen(true);
  };

  const handleSaveOrganization = (name: string) => {
    if (currentEditOrg) {
      // Edit existing
      updateOrganization(currentEditOrg.id, { name });
    } else {
      // Add new
      addOrganization(name);
    }
    // Show success toast
    setSavedStatus('saved');
    setTimeout(() => setSavedStatus('idle'), 2000);
  };

  const handleDeleteOrganization = () => {
    if (organizations.length <= 1) {
      // Show toast error - can't delete last organization
      setSavedStatus('error');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete "${currentOrganization.name}"? This action cannot be undone.`
      )
    ) {
      removeOrganization(currentOrganization.id);
      // Show success toast
      setSavedStatus('saved');
      setTimeout(() => setSavedStatus('idle'), 2000);
    }
  };

  // Agent management handlers
  const handleAddAgent = () => {
    setCurrentAgent(undefined);
    setAgentModalTitle('Add New Agent');
    setIsAgentModalOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setCurrentAgent(agent);
    setAgentModalTitle(`Edit Agent: ${agent.name}`);
    setIsAgentModalOpen(true);
  };

  const handleDeleteAgent = (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      removeAgent(agentId);
    }
  };

  const handleSaveAgent = (agentData: Omit<Agent, 'id'>, agentId?: string) => {
    if (agentId) {
      // Update existing agent
      updateAgent(agentId, agentData);
    } else {
      // Add new agent
      addAgent(agentData);
    }
    setCurrentAgent(undefined);
  };

  const recentChats = [
    { id: '1', title: 'Math help', date: new Date('2025-04-10'), messages: 12 },
    { id: '2', title: 'Physics concepts', date: new Date('2025-04-08'), messages: 8 },
    { id: '3', title: 'History questions', date: new Date('2025-04-05'), messages: 15 },
  ];

  const getDisplayThemeName = (themeName: string) => {
    if (themeName === 'system') {
      return 'System (OS Default)';
    }
    return themeName.charAt(0).toUpperCase() + themeName.slice(1);
  };

  const getThemeIcon = (themeName: string) => {
    return themeIconify[themeName] || themeEmoji[themeName] || 'mdi:theme-light-dark';
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return 'Never saved';

    // If it was less than a minute ago
    const secondsAgo = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (secondsAgo < 60) return 'Just now';

    // If it was today
    const today = new Date();
    if (lastSaved.toDateString() === today.toDateString()) {
      return `Today at ${lastSaved.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    // Otherwise full date/time
    return lastSaved.toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 mt-12 mb-18 py-6 md:py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Organization Switcher */}
        <div className="flex items-center gap-3">
          <OrganizationSwitcher
            organizations={organizations}
            currentOrganization={currentOrganization}
            onSwitch={switchOrganization}
            onAddNew={handleAddOrganization}
          />

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm flex btn-ghost btn-circle">
              <Icon icon="mdi:dots-vertical" className="" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-1*"
            >
              <li>
                <button
                  onClick={() => handleEditOrganization(currentOrganization)}
                  className="flex items-center gap-2"
                >
                  <Icon icon="mdi:pencil" className="w-4 h-4" />
                  Edit Organization
                </button>
              </li>
              <li>
                <button
                  onClick={handleDeleteOrganization}
                  className="text-error"
                  disabled={organizations.length <= 1}
                >
                  <Icon icon="mdi:delete" className="w-4 h-4" />
                  Delete Organization
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Main Settings */}
        <div className="md:col-span-2 space-y-4 md:space-y-8">
          {/* --- Organization Settings Card --- */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 md:p-6">
              <div className="flex justify-between items-center">
                <h2 className="card-title">Organization Settings</h2>

                {/* Auto-save status indicator */}
                <div className="flex items-center text-xs text-base-content/70">
                  {isSaving ? (
                    <span className="flex items-center">
                      <span className="loading loading-spinner loading-xs mr-1"></span>
                      Saving...
                    </span>
                  ) : saveError ? (
                    <span className="flex items-center text-error">
                      <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
                      Save error
                    </span>
                  ) : lastSaved ? (
                    <span className="flex items-center">
                      <Icon icon="mdi:content-save-check" className="w-4 h-4 mr-1 text-success" />
                      Saved {formatLastSaved()}
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="text-sm text-base-content/70 mb-4">
                Configure your organization's AI behavior and specialized agents.
              </p>

              {/* Organization Agenda */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">
                    Organization prompt (System Prompt)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  value={organizationPrompt}
                  onChange={e => setOrganizationPrompt(e.target.value)}
                  placeholder="Set the overall goal or persona for your AI organization..."
                ></textarea>
                <label className="label">
                  <span className="label-text-alt">
                    This high-level prompt guides all AI interactions within your organization.
                  </span>
                </label>
              </div>

              {/* Agent Management - Now with improved cards */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Icon icon="mdi:account-group" className="w-5 h-5 text-primary" />
                    <span>Expert Agents</span>
                    <span className="badge badge-sm badge-primary">
                      {agents.length}/{maxAgents}
                    </span>
                  </h3>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleAddAgent}
                    disabled={agents.length >= maxAgents}
                  >
                    <Icon icon="mdi:plus" className="mr-1" />
                    Add Agent
                  </button>
                </div>

                {/* Agent Grid - New responsive grid layout */}
                {agents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    {agents.map((agent, index) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onEdit={handleEditAgent}
                        onDelete={handleDeleteAgent}
                        patternIndex={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg bg-base-200/50">
                    <Icon
                      icon="mdi:account-plus"
                      className="w-12 h-12 mx-auto text-base-content/30 mb-2"
                    />
                    <p className="text-base-content/60">
                      No specialized agents added yet.
                      <button
                        onClick={handleAddAgent}
                        className="btn btn-link btn-xs normal-case ml-1 text-primary"
                      >
                        Create your first agent
                      </button>
                    </p>
                  </div>
                )}

                {agents.length >= maxAgents && (
                  <div className="alert alert-warning alert-sm mt-3">
                    <Icon icon="mdi:alert-circle" className="w-5 h-5" />
                    <span className="text-sm">
                      You've reached the maximum number of agents ({maxAgents}) for your {userRole}{' '}
                      plan.
                      <a href="/upgrade" className="link link-primary ml-1">
                        Upgrade your plan
                      </a>{' '}
                      for more.
                    </span>
                  </div>
                )}
              </div>

              <div className="divider my-4"></div>

              {/* Default Provider/Model/Temp Settings */}
              <h3 className="font-medium mb-3">Default AI Configuration</h3>
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
                  disabled={!availableProviders[provider]?.models?.length} // Disable if no models
                >
                  {availableProviders[provider]?.models.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  {!availableProviders[provider]?.models?.length && (
                    <option disabled>No models available for this provider</option>
                  )}
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
            </div>
          </div>
          {/* --- End Organization Settings Card --- */}

          {/* --- Interface Settings Card (Themes, History) --- */}
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
                      {/* Decorative dots */}
                      <div className="flex relative -top-[6px]* mx-2 gap-2 z-10">
                        <div className="w-[6px] h-[6px] btn btn-circle btn-xs btn-primary"></div>
                        <div className="w-[6px] h-[6px] btn btn-circle btn-xs btn-secondary"></div>
                        <div className="w-[6px] h-[6px] btn btn-circle btn-xs btn-accent"></div>
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
                      role="tab" // Add role for accessibility
                      className={`tab text-xs ${activeCategory === category ? 'tab-active' : ''}`}
                      onClick={() => setActiveCategory(category)}
                      // Use onKeyDown for keyboard navigation if needed
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
                        } flex items-center justify-start py-2 gap-2 h-auto normal-case`}
                        aria-pressed={theme === themeName} // Accessibility
                      >
                        <div
                          className={`w-6 h-6 mask mask-squircle flex items-center justify-center ${
                            darkThemes.includes(themeName)
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-black' // Use base colors for consistency
                          }`}
                        >
                          {themeIconify[themeName] ? (
                            <Icon icon={themeIconify[themeName]} className="m-auto self-center" />
                          ) : (
                            <span className="text-sm">{themeEmoji[themeName] || '🎨'}</span>
                          )}
                        </div>
                        <span className="text-sm">
                          {themeName === 'system' ? 'System (OS)' : getDisplayThemeName(themeName)}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Save History Toggle */}
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
          {/* --- End Interface Settings Card --- */}
        </div>

        {/* Toast Notification */}
        {savedStatus === 'saved' && (
          <div className="toast toast-top toast-center z-50">
            <div role="alert" className="alert alert-success shadow-lg">
              <Icon icon="mdi:check-circle-outline" className="h-6 w-6" />
              <span>Changes saved!</span>
            </div>
          </div>
        )}
        {savedStatus === 'error' && (
          <div className="toast toast-top toast-center z-50">
            <div role="alert" className="alert alert-error shadow-lg">
              <Icon icon="mdi:alert-circle-outline" className="h-6 w-6" />
              <span>Failed to save changes.</span>
            </div>
          </div>
        )}

        {/* Sidebar (Recent Chats, Account Actions) */}
        <div>
          {/* Organization Stats Card (New) */}
          <div className="card bg-base-100 shadow-sm mb-4">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title text-base">Organization Stats</h2>
              <div className="stats shadow bg-base-200 stats-vertical w-full">
                <div className="stat p-3">
                  <div className="stat-title text-xs">Organizations</div>
                  <div className="stat-value text-lg">
                    {organizations.length} / {maxOrganizations}
                  </div>
                  <div className="stat-desc text-xs">
                    {organizations.length >= maxOrganizations ? (
                      <span className="text-warning">Limit reached</span>
                    ) : (
                      <span>{maxOrganizations - organizations.length} remaining</span>
                    )}
                  </div>
                </div>
                <div className="stat p-3">
                  <div className="stat-title text-xs">Agents</div>
                  <div className="stat-value text-lg">
                    {agents.length} / {maxAgents}
                  </div>
                  <div className="stat-desc text-xs">For current organization</div>
                </div>
              </div>
              <div className="divider my-1"></div>
              <h3 className="text-sm font-medium mb-2">Organizations</h3>
              <div className="space-y-2">
                {organizations.map(org => (
                  <div
                    key={org.id}
                    className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                      org.id === currentOrganization.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-base-200'
                    }`}
                    onClick={() => switchOrganization(org.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="avatar placeholder">
                        <div
                          className={`${
                            org.id === currentOrganization.id ? 'bg-base-300' : 'bg-base-200'
                          } text-base-content w-6 h-6 rounded-full`}
                        >
                          <span className="text-xs">{org.name.charAt(0)}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{org.name}</span>
                    </div>
                    <div className="text-xs text-base-content/70">
                      {org.id === currentOrganization.id && (
                        <Icon icon="mdi:check-circle" className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </div>
                ))}
                {organizations.length < maxOrganizations && (
                  <button onClick={handleAddOrganization} className="btn btn-sm btn-outline w-full">
                    <Icon icon="mdi:plus" className="w-4 h-4" />
                    New Organization
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Chats */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title">Recent Chats</h2>
              {recentChats.length > 0 ? (
                <ul className="divide-y divide-base-200">
                  {recentChats.map(chat => (
                    <li key={chat.id} className="py-3">
                      <a
                        href={`/chat/${chat.id}`}
                        className="block hover:bg-base-200 rounded-md p-2 -m-2 transition-colors duration-150"
                      >
                        <h3 className="font-medium text-sm">{chat.title}</h3>
                        <div className="text-xs text-base-content/70 flex justify-between mt-1">
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
              <div className="card-actions mt-4"></div>
              <a href="/chat" className="btn btn-sm btn-ghost w-full">
                View All Chats
              </a>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card bg-base-100 shadow-sm mt-4 md:mt-6">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title">Account Actions</h2>
              <div className="py-2">
                <button className="btn btn-sm btn-outline btn-error w-full">
                  <Icon icon="mdi:delete-sweep-outline" className="mr-1" />
                  Delete All Chat History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Modal */}
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSave={handleSaveAgent}
        agent={currentAgent}
        title={agentModalTitle}
      />

      {/* Organization Modal */}
      <OrganizationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onSave={handleSaveOrganization}
        editOrganization={currentEditOrg}
        title={orgModalTitle}
      />

      {/* Error toast for settings */}
      {saveError && (
        <div className="toast toast-top toast-center z-50">
          <div role="alert" className="alert alert-error shadow-lg">
            <Icon icon="mdi:alert-circle-outline" className="h-6 w-6" />
            <div>
              <h3 className="font-bold">Error saving settings</h3>
              <p className="text-sm">{saveError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
