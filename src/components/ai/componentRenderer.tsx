'use client';

import { useState, useEffect } from 'react';
import parse, { domToReact } from 'html-react-parser';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

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

  // Debug log for initial state
  useEffect(() => {
    console.log('ComponentRenderer: Form states initialized', initialStates);
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

  // Parser
  let parsedContent;
  try {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {parsedContent}
    </motion.div>
  );
}
