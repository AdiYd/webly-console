'use client';

import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { useEditor } from '../../context/EditorContext';

export function LeftSidebar() {
  const { state, actions } = useEditor();
  const { currentPage, selectedSectionId, editingMode } = state;

  const handleSectionSelect = (sectionId: string) => {
    actions.setSelectedSection(selectedSectionId === sectionId ? null : sectionId);
  };

  const addNewSection = () => {
    // TODO: Implement add new section
    console.log('Add new section');
  };

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-base-content">Sections</h2>
          <button
            onClick={addNewSection}
            className="btn btn-primary btn-sm btn-circle"
            title="Add new section"
          >
            <Icon icon="mdi:plus" className="text-lg" />
          </button>
        </div>
        <p className="text-sm text-base-content/60 mt-1">{currentPage.sections.length} sections</p>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {currentPage.sections.map((section, index) => (
            <motion.div
              key={section.id || index}
              layout
              className={`card card-compact cursor-pointer transition-all duration-200 ${
                selectedSectionId === section.id
                  ? '!bg-primary/10 !border-primary/50 !border-2'
                  : 'bg-base-100 hover:bg-base-300/50'
              }`}
              onClick={() => handleSectionSelect(section.id || `section-${index}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`card-body`}>
                <div className="flex items-start gap-3">
                  {/* Section Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedSectionId === section.id
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-300 text-base-content'
                    }`}
                  >
                    <Icon icon={getSectionIcon(section.section_name)} className="text-sm" />
                  </div>

                  {/* Section Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-base-content truncate">
                      {section.section_name}
                    </h3>
                    {section.section_description && (
                      <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                        {section.section_description}
                      </p>
                    )}

                    {/* Section Stats */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="badge badge-ghost badge-xs">#{index + 1}</div>
                      {section.src?.html && <div className="badge badge-ghost badge-xs">HTML</div>}
                      {section.src?.js && <div className="badge badge-ghost badge-xs">JS</div>}
                      {section.src?.css && <div className="badge badge-ghost badge-xs">CSS</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-square">
                      <Icon icon="mdi:dots-vertical" className="text-xs" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48"
                    >
                      <li>
                        <a onClick={() => console.log('Edit section', section.id)}>
                          <Icon icon="mdi:pencil" />
                          Edit
                        </a>
                      </li>
                      <li>
                        <a onClick={() => console.log('Duplicate section', section.id)}>
                          <Icon icon="mdi:content-copy" />
                          Duplicate
                        </a>
                      </li>
                      <li>
                        <a onClick={() => console.log('Move up', section.id)}>
                          <Icon icon="mdi:arrow-up" />
                          Move Up
                        </a>
                      </li>
                      <li>
                        <a onClick={() => console.log('Move down', section.id)}>
                          <Icon icon="mdi:arrow-down" />
                          Move Down
                        </a>
                      </li>
                      <div className="divider my-1"></div>
                      <li>
                        <a
                          onClick={() => console.log('Delete section', section.id)}
                          className="text-error"
                        >
                          <Icon icon="mdi:delete" />
                          Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-base-300">
        <div className="text-xs text-base-content/60">
          Mode: <span className="text-primary font-medium capitalize">{editingMode}</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to get appropriate icon for section
function getSectionIcon(sectionName: string): string {
  const name = sectionName.toLowerCase();

  if (name.includes('hero')) return 'mdi:flag';
  if (name.includes('header') || name.includes('nav')) return 'mdi:navigation';
  if (name.includes('footer')) return 'mdi:page-layout-footer';
  if (name.includes('about')) return 'mdi:account-group';
  if (name.includes('service')) return 'mdi:cog';
  if (name.includes('portfolio') || name.includes('gallery')) return 'mdi:view-grid';
  if (name.includes('contact')) return 'mdi:email';
  if (name.includes('testimonial') || name.includes('review')) return 'mdi:format-quote-close';
  if (name.includes('feature')) return 'mdi:star';
  if (name.includes('pricing')) return 'mdi:currency-usd';
  if (name.includes('cta') || name.includes('call')) return 'mdi:bullhorn';

  return 'mdi:view-sequential';
}
