'use client';

import { useState, useEffect } from 'react';
import parse, { domToReact } from 'html-react-parser';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { clientLogger } from '@/utils/logger';

// Types
interface ComponentRendererProps {
  jsxString: string;
  logic: {
    states?: Record<string, any>;
    actions?: {
      [actionName: string]: {
        targetId: string;
        collectFrom?: string | string[];
        actionType: 'submitForm' | 'customAction';
      };
    };
  };
  onSubmit?: (formData: Record<string, any>) => void;
}

export function ComponentRenderer({ jsxString, logic, onSubmit }: ComponentRendererProps) {
  console.log('ComponentRenderer: Initializing with', {
    jsxPreview: jsxString?.slice(0, 50) + '...',
    hasLogic: Boolean(logic),
    logicKeys: logic ? Object.keys(logic) : [],
  });

  // Handle potentially invalid inputs
  if (!jsxString) {
    return (
      <div className="p-4 border border-warning rounded-lg">
        <div className="flex items-center text-warning">
          <Icon icon="carbon:warning" className="mr-2" />
          <span>Missing JSX content</span>
        </div>
      </div>
    );
  }

  // Initialize dynamic states from logic.states
  const initialStates = logic?.states || {};
  const [formState, setFormState] = useState<Record<string, any>>(initialStates);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [componentType, setComponentType] = useState<'form' | 'card' | 'list' | 'standard'>(
    'standard'
  );

  // Prepare component when jsxString is ready
  useEffect(() => {
    if (jsxString) {
      try {
        // Clean JSX string if needed
        let cleanedJsx = jsxString;
        if (jsxString.includes('\\n') || jsxString.includes('\\t') || jsxString.includes('\\r')) {
          clientLogger.debug('ComponentRenderer: Cleaning JSX string', 'jsxString', jsxString);
          cleanedJsx = jsxString.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '');
        }

        // Try to determine component type for appropriate placeholder
        if (
          cleanedJsx.includes('<form') ||
          (cleanedJsx.includes('input') &&
            cleanedJsx.includes('button') &&
            cleanedJsx.includes('submit')) ||
          (logic?.actions && Object.values(logic.actions).some(a => a.actionType === 'submitForm'))
        ) {
          setComponentType('form');
        } else if (cleanedJsx.includes('card')) {
          setComponentType('card');
        } else if (cleanedJsx.includes('list') || cleanedJsx.includes('table')) {
          setComponentType('list');
        }

        // Add a slight delay to simulate loading and allow for transitions
        // This ensures the loader is visible for at least 800ms for better UX
        const timer = setTimeout(() => {
          setIsReady(true);
        }, 800);

        return () => clearTimeout(timer);
      } catch (error) {
        clientLogger.error('ComponentRenderer: Error preparing JSX', 'data:', error);
        setParseError(
          `Error preparing component: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }, [jsxString, logic]);

  // Debug log for initial state
  useEffect(() => {
    clientLogger.debug('ComponentRenderer: Form states initialized', 'initialState', initialStates);
  }, [initialStates]);

  // Helpers
  const handleInputChange = (id: string, value: any) => {
    console.log('ComponentRenderer: Input change', { id, value });
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = (actionName: string) => {
    console.log('ComponentRenderer: Action triggered', { actionName });
    const action = logic?.actions?.[actionName];
    if (!action) {
      console.warn('ComponentRenderer: No action found with name', actionName);
      return;
    }

    if (action.actionType === 'submitForm') {
      console.log('ComponentRenderer: Submitting form', { formState });
      if (onSubmit) {
        try {
          // If collectFrom specified, only send those fields
          if (action.collectFrom) {
            const fieldsToCollect = Array.isArray(action.collectFrom)
              ? action.collectFrom
              : [action.collectFrom];

            const collectedData = fieldsToCollect.reduce((acc, field) => {
              acc[field] = formState[field] || '';
              return acc;
            }, {} as Record<string, any>);

            console.log('ComponentRenderer: Collected specific fields', collectedData);
            onSubmit(collectedData);
          } else {
            // Otherwise send all form state
            onSubmit(formState);
          }
        } catch (error) {
          console.error('ComponentRenderer: Error in form submission', error);
        }
      } else {
        console.warn('ComponentRenderer: No onSubmit handler provided');
      }
    } else {
      console.log('ComponentRenderer: Unhandled action type', action.actionType);
    }
  };

  // Clean up JSX string if needed
  const cleanJsxString = useEffect(() => {
    // Fix common issues in JSX strings
    if (jsxString.includes('\\n') || jsxString.includes('\\t') || jsxString.includes('\\r')) {
      console.log('ComponentRenderer: Cleaning JSX string with escaped characters');
      try {
        // Replace escaped newlines and tabs with actual ones for better rendering
        const cleaned = jsxString.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '');

        jsxString = cleaned;
      } catch (error) {
        console.error('ComponentRenderer: Error cleaning JSX string', error);
      }
    }
  }, [jsxString]);

  // Parser with optimized rendering
  let parsedContent;
  try {
    if (!isReady) {
      // We'll render loading skeletons outside this block using AnimatePresence
      parsedContent = null;
    } else {
      parsedContent = parse(jsxString, {
        replace: (domNode: any) => {
          if (!domNode.attribs) return;

          const { id, class: htmlClass, className, onclick, onClick } = domNode.attribs || {};
          // Handle both class and className
          const finalClassName = className || htmlClass;

          // Handle both onclick and onClick
          const hasClickHandler = onclick || onClick;

          if (id) {
            // Log when we find an element with an ID for debugging
            if (Math.random() < 0.1) {
              // Only log some to reduce spam
              console.log('ComponentRenderer: Found element with ID', {
                id,
                type: domNode.name,
                hasClass: !!finalClassName,
                hasClickHandler,
              });
            }

            // Buttons with actions
            const actionEntry = Object.entries(logic?.actions || {}).find(
              ([_, a]) => a.targetId === id
            );

            if (actionEntry) {
              const [actionName] = actionEntry;
              if (domNode.name === 'button') {
                return (
                  <button
                    key={id}
                    id={id}
                    className={finalClassName || 'btn'}
                    onClick={() => handleAction(actionName)}
                  >
                    {domToReact(domNode.children)}
                  </button>
                );
              }
            }

            // Inputs
            if (domNode.name === 'input') {
              return (
                <input
                  key={id}
                  {...domNode.attribs}
                  className={finalClassName || 'input input-bordered'}
                  value={formState[id] || ''}
                  onChange={e => handleInputChange(id, e.target.value)}
                />
              );
            }

            // Handle more input types
            if (domNode.name === 'textarea') {
              return (
                <textarea
                  key={id}
                  {...domNode.attribs}
                  className={finalClassName || 'textarea textarea-bordered'}
                  value={formState[id] || ''}
                  onChange={e => handleInputChange(id, e.target.value)}
                >
                  {domToReact(domNode.children)}
                </textarea>
              );
            }

            if (domNode.name === 'select') {
              return (
                <select
                  key={id}
                  {...domNode.attribs}
                  className={finalClassName || 'select select-bordered'}
                  value={formState[id] || ''}
                  onChange={e => handleInputChange(id, e.target.value)}
                >
                  {domToReact(domNode.children)}
                </select>
              );
            }
          }
        },
      });
    }
  } catch (error: any) {
    console.error('ComponentRenderer: Error parsing JSX', error);
    setParseError(`Error parsing component: ${error?.message}`);
    parsedContent = null;
  }

  if (parseError) {
    return (
      <div className="p-4 border border-error rounded-lg">
        <div className="flex items-center text-error">
          <Icon icon="carbon:error" className="mr-2" />
          <span>{parseError}</span>
        </div>
        <div className="mt-2 p-2 bg-base-300 rounded text-xs overflow-auto">
          <code>{jsxString}</code>
        </div>
      </div>
    );
  }

  // Render appropriate loading state or the component
  return (
    <AnimatePresence mode="wait">
      {!isReady ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {/* Different skeletal loaders based on component type */}
          {componentType === 'form' ? (
            <div className="card bg-base-100 shadow-sm p-4 overflow-hidden">
              <div className="h-6 w-2/3 bg-base-200 rounded-md mb-4 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-10 bg-base-200 rounded-md animate-pulse"></div>
                <div className="h-10 bg-base-200 rounded-md animate-pulse"></div>
                <div className="h-10 w-1/3 bg-primary/30 rounded-md animate-pulse ml-auto"></div>
              </div>
              <div className="flex justify-center mt-6">
                <div className="loading loading-ring loading-md text-primary"></div>
              </div>
            </div>
          ) : componentType === 'card' ? (
            <div className="card bg-base-100 shadow-sm p-4 overflow-hidden">
              <div className="h-32 bg-base-200 rounded-md mb-4 animate-pulse"></div>
              <div className="h-6 w-1/2 bg-base-200 rounded-md mb-3 animate-pulse"></div>
              <div className="h-4 bg-base-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 bg-base-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 w-2/3 bg-base-200 rounded-md mb-4 animate-pulse"></div>
              <div className="flex justify-center">
                <div className="loading loading-ring loading-md text-primary"></div>
              </div>
            </div>
          ) : componentType === 'list' ? (
            <div className="card bg-base-100 shadow-sm p-4 overflow-hidden">
              <div className="h-8 bg-base-200 rounded-md mb-4 animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-base-200 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-base-200 rounded-md animate-pulse mb-1"></div>
                      <div className="h-3 w-2/3 bg-base-200 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <div className="loading loading-ring loading-md text-primary"></div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-sm p-4 overflow-hidden">
              <div className="h-16 bg-base-200 rounded-md mb-4 animate-pulse"></div>
              <div className="h-4 bg-base-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 bg-base-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 w-2/3 bg-base-200 rounded-md mb-4 animate-pulse"></div>
              <div className="flex justify-center">
                <div className="loading loading-ring loading-md text-primary"></div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {parsedContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
