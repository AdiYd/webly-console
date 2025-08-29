'use client';

import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor, EditingMode } from '../../context/EditorContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function EditorNavigation() {
  const { state, actions } = useEditor();
  const {
    editingMode,
    hasUnsavedChanges,
    isSaving,
    chatVisible,
    leftDrawerOpen,
    rightDrawerOpen,
    currentPage,
  } = state;

  const editingModes: Array<{
    id: EditingMode;
    label: string;
    icon: string;
    description: string;
  }> = [
    { id: 'preview', label: 'Preview', icon: 'mdi:eye', description: 'Preview your website' },
    { id: 'text', label: 'Text', icon: 'mdi:format-text', description: 'Edit text content' },
    { id: 'image', label: 'Images', icon: 'mdi:image', description: 'Manage images and media' },
    { id: 'theme', label: 'Theme', icon: 'mdi:palette', description: 'Customize colors and fonts' },
    {
      id: 'layout',
      label: 'Layout',
      icon: 'mdi:view-grid',
      description: 'Adjust layout and spacing',
    },
    // { id: 'ai', label: 'AI Edit', icon: 'mdi:robot', description: 'AI-powered editing' },
  ];

  const handleSave = async () => {
    await actions.handleSave();
  };

  return (
    <nav className="bg-base-200/40 rounded-b-2xl* shadow-lg backdrop-blur-lg border-b-[0.9px] border-zinc-400/40 sticky top-0 z-30">
      <div className="px-4 pt-1">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-base-300* rounded-lg flex items-center justify-center">
                <Icon
                  icon="game-icons:owl"
                  className="text-primary hover:text-secondary transition-colors text-lg"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-base-content">Webly Editor</h1>
                {/* <p className="text-xs text-base-content/60">{currentPage.page_name}</p> */}
              </div>
            </div>

            {/* Status Indicator */}
            {hasUnsavedChanges && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-warning rounded-full"
                title="Unsaved changes"
              />
            )}
          </div>

          {/* Center Section - Editing Modes */}
          <div className="flex relative items-center">
            <div className="tabs align-bottom bg-transparent* tabs-sm* tabs-lifted p-1 pb-0">
              {editingModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => actions.setEditingMode(mode.id)}
                  className={`tab bg-transparent !rounded-t-3xl gap-2 ${
                    editingMode === mode.id ? 'tab-active' : 'hover:opacity-70'
                  }`}
                  title={mode.description}
                >
                  <Icon icon={mode.icon} className="text-sm" />
                  <span className="hidden md:inline">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* History Controls */}
            <div className="join border* border-zinc-400/40*">
              <button
                className="btn btn-ghost btn-sm join-item disabled:opacity-0"
                onClick={actions.undo}
                disabled={state.historyIndex < 0 && state.history.length === 0} // Can undo if we have history OR if we're at current state with history
                title="Undo (Ctrl+Z)"
              >
                <Icon icon="mdi:undo" className="text-lg" />
              </button>
              <button
                className="btn btn-ghost btn-sm join-item disabled:opacity-0"
                onClick={actions.redo}
                disabled={
                  state.historyIndex >= state.history.length - 1 || state.historyIndex === -1
                } // Can't redo if at latest state or current state
                title="Redo (Ctrl+Shift+Z)"
              >
                <Icon icon="mdi:redo" className="text-lg" />
              </button>
            </div>

            {/* View Controls (mobile/Tablet/Desktop) */}
            <div className="join border border-zinc-400/40">
              <button
                onClick={() => actions.setScreenMode('desktop')}
                className={`btn btn-ghost btn-sm join-item ${
                  state.screenMode === 'desktop' ? 'btn-active' : ''
                }`}
                title="Desktop"
              >
                <Icon icon="streamline:screen-1-remix" className="text-sm" />
              </button>
              <button
                onClick={() => actions.setScreenMode('mobile')}
                className={`btn btn-ghost btn-sm join-item ${
                  state.screenMode === 'mobile' ? 'btn-active' : ''
                }`}
                title="Mobile"
              >
                <Icon icon="radix-icons:mobile" className="text-sm" />
              </button>
            </div>
            {/* View Controls */}
            <div className="join border border-zinc-400/40">
              <button
                className={`btn btn-ghost btn-sm join-item ${leftDrawerOpen ? 'btn-active' : ''}`}
                onClick={() => actions.setLeftDrawer(!leftDrawerOpen)}
                title={leftDrawerOpen ? 'Close left panel' : 'Open left panel'}
              >
                <Icon icon="mdi:dock-left" className="text-lg" />
              </button>
              <button
                className={`btn btn-ghost btn-sm join-item ${chatVisible ? 'btn-active' : ''}`}
                onClick={() => actions.setChatVisible(!chatVisible)}
                title="Toggle AI chat"
              >
                <Icon icon="carbon:ai" className="text-lg" />
              </button>
              <button
                className={`btn btn-ghost btn-sm join-item ${rightDrawerOpen ? 'btn-active' : ''}`}
                onClick={() => actions.setRightDrawer(!rightDrawerOpen)}
                title={rightDrawerOpen ? 'Close right panel' : 'Open right panel'}
              >
                <Icon icon="mdi:dock-right" className="text-lg" />
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`btn btn-neutral btn-sm gap-2 ${isSaving ? 'loading' : ''}`}
              title="Save changes (Ctrl+S)"
            >
              {!isSaving && <Icon icon="mdi:content-save" className="text-lg" />}
              <span>Save</span>
            </button>
            <ThemeToggle />
            {/* Options Menu */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                <Icon icon="mdi:dots-vertical" className="text-lg" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a onClick={() => console.log('Export website')}>
                    <Icon icon="mdi:download" />
                    Export Website
                  </a>
                </li>
                <li>
                  <a onClick={() => console.log('Preview in new tab')}>
                    <Icon icon="mdi:open-in-new" />
                    Preview in New Tab
                  </a>
                </li>
                <li>
                  <a onClick={() => actions.resetState()}>
                    <Icon icon="mdi:refresh" />
                    Reset Settings
                  </a>
                </li>
                <li>
                  <a onClick={() => console.log('Settings')}>
                    <Icon icon="mdi:cog" />
                    Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
