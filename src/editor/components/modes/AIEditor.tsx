'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';

const aiPrompts = [
  {
    id: 'enhance-text',
    title: 'Enhance Text Content',
    description: 'Improve copy, fix grammar, and make it more engaging',
    icon: 'mdi:text-box-edit',
    category: 'content',
  },
  {
    id: 'generate-images',
    title: 'Generate Images',
    description: 'Create AI-generated images that match your content',
    icon: 'mdi:image-auto',
    category: 'visual',
  },
  {
    id: 'improve-layout',
    title: 'Improve Layout',
    description: 'Suggest better layout and structure for this section',
    icon: 'mdi:view-grid-plus',
    category: 'design',
  },
  {
    id: 'add-interactions',
    title: 'Add Interactions',
    description: 'Add hover effects, animations, and micro-interactions',
    icon: 'mdi:cursor-pointer',
    category: 'interactive',
  },
  {
    id: 'optimize-seo',
    title: 'Optimize for SEO',
    description: 'Improve headings, meta tags, and content structure',
    icon: 'mdi:search-web',
    category: 'seo',
  },
  {
    id: 'accessibility',
    title: 'Improve Accessibility',
    description: 'Enhance accessibility with better markup and attributes',
    icon: 'mdi:human-accessible',
    category: 'accessibility',
  },
];

const recentSuggestions = [
  {
    id: 1,
    title: 'Make hero text more compelling',
    action: 'Enhanced hero headline with emotional hook',
    timestamp: '2 minutes ago',
    status: 'applied',
  },
  {
    id: 2,
    title: 'Add call-to-action buttons',
    action: 'Added prominent CTA with conversion-focused copy',
    timestamp: '5 minutes ago',
    status: 'pending',
  },
  {
    id: 3,
    title: 'Improve color contrast',
    action: 'Adjusted text colors for better accessibility',
    timestamp: '10 minutes ago',
    status: 'applied',
  },
];

export function AIEditor() {
  const { state, actions } = useEditor();
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { selectedSectionId, currentPage } = state;
  const selectedSection = currentPage.sections.find(s => s.id === selectedSectionId);

  const categories = [
    { id: 'all', name: 'All', icon: 'mdi:star' },
    { id: 'content', name: 'Content', icon: 'mdi:text-box' },
    { id: 'visual', name: 'Visual', icon: 'mdi:image' },
    { id: 'design', name: 'Design', icon: 'mdi:palette' },
    { id: 'interactive', name: 'Interactive', icon: 'mdi:gesture-tap' },
    { id: 'seo', name: 'SEO', icon: 'mdi:search-web' },
    { id: 'accessibility', name: 'A11y', icon: 'mdi:human-accessible' },
  ];

  const filteredPrompts =
    activeCategory === 'all'
      ? aiPrompts
      : aiPrompts.filter(prompt => prompt.category === activeCategory);

  const executeAIPrompt = async (promptId: string) => {
    if (!selectedSectionId) return;

    setIsGenerating(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // TODO: Implement actual AI integration
    console.log(`Executing AI prompt: ${promptId} on section: ${selectedSectionId}`);

    // Simulate applying changes
    actions.updateSection(selectedSectionId, {
      ...selectedSection!,
      lastAIEdit: {
        promptId,
        timestamp: new Date().toISOString(),
        changes: 'AI-generated improvements applied',
      },
    });

    setIsGenerating(false);
    actions.saveToHistory();
  };

  const executeCustomPrompt = async () => {
    if (!customPrompt.trim() || !selectedSectionId) return;

    setIsGenerating(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // TODO: Implement actual AI integration
    console.log(`Custom AI prompt: ${customPrompt}`);

    setCustomPrompt('');
    setIsGenerating(false);
    actions.saveToHistory();
  };

  if (!selectedSectionId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon icon="mdi:robot" className="text-6xl text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content mb-2">AI Editor</h3>
          <p className="text-base-content/60">Select a section to enhance it with AI</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Editor: {selectedSection?.section_name}</h3>
        <div className="badge badge-primary badge-outline">
          <Icon icon="mdi:robot" className="w-3 h-3 mr-1" />
          AI Enhanced
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h4 className="card-title text-base">Custom AI Prompt</h4>
          <div className="form-control">
            <textarea
              className="textarea textarea-bordered"
              placeholder="Describe what you want AI to do with this section... (e.g., 'Make the text more persuasive', 'Add a testimonial', 'Improve the visual hierarchy')"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>
          <div className="card-actions justify-end">
            <button
              className={`btn btn-primary ${isGenerating ? 'loading' : ''}`}
              onClick={executeCustomPrompt}
              disabled={!customPrompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Icon icon="mdi:magic-staff" className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            className={`btn btn-sm ${
              activeCategory === category.id ? 'btn-primary' : 'btn-outline'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <Icon icon={category.icon} className="w-4 h-4 mr-1" />
            {category.name}
          </button>
        ))}
      </div>

      {/* AI Prompts */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h4 className="card-title text-base">Quick AI Actions</h4>
          <div className="grid grid-cols-1 gap-3">
            {filteredPrompts.map(prompt => (
              <button
                key={prompt.id}
                className="btn btn-ghost h-auto p-4 justify-start text-left hover:bg-base-200"
                onClick={() => executeAIPrompt(prompt.id)}
                disabled={isGenerating}
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon icon={prompt.icon} className="text-primary text-xl flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">{prompt.title}</div>
                    <div className="text-sm text-base-content/60">{prompt.description}</div>
                  </div>
                  <Icon icon="mdi:chevron-right" className="text-base-content/40" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent AI Suggestions */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h4 className="card-title text-base">Recent AI Suggestions</h4>
          <div className="space-y-3">
            {recentSuggestions.map(suggestion => (
              <div
                key={suggestion.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-base-200/50"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    suggestion.status === 'applied' ? 'bg-success' : 'bg-warning'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-base-content/60">{suggestion.action}</div>
                  <div className="text-xs text-base-content/40 mt-1">{suggestion.timestamp}</div>
                </div>
                <div
                  className={`badge badge-sm ${
                    suggestion.status === 'applied' ? 'badge-success' : 'badge-warning'
                  }`}
                >
                  {suggestion.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <Icon icon="mdi:lightbulb" />
        <span>
          AI suggestions are context-aware and will adapt to your content and design goals.
        </span>
      </div>
    </motion.div>
  );
}
