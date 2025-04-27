'use client';

import { useState, useEffect } from 'react';
import parse, { domToReact } from 'html-react-parser';
import { motion } from 'framer-motion';

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
    jsxLength: jsxString.length,
    logicKeys: Object.keys(logic || {}),
  });

  // Initialize dynamic states from logic.states
  const initialStates = logic?.states || {};
  const [formState, setFormState] = useState<Record<string, any>>(initialStates);

  useEffect(() => {
    console.log('ComponentRenderer: Initial form state', initialStates);
  }, []);

  // Helpers
  const handleInputChange = (id: string, value: any) => {
    console.log('ComponentRenderer: Input change', { id, value });
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = (actionName: string) => {
    console.log('ComponentRenderer: Action triggered', { actionName });
    const action = logic.actions?.[actionName];
    if (!action) {
      console.warn('ComponentRenderer: No action found with name', actionName);
      return;
    }

    if (action.actionType === 'submitForm') {
      console.log('ComponentRenderer: Submitting form', { formState });
      if (onSubmit) {
        try {
          onSubmit(formState);
        } catch (error) {
          console.error('ComponentRenderer: Error in form submission', error);
        }
      } else {
        console.warn('ComponentRenderer: No onSubmit handler provided');
      }
    } else {
      console.log('ComponentRenderer: Unhandled action type', action.actionType);
    }
    // Future: Add more action types if needed
  };

  // Parser
  const parsedContent = parse(jsxString, {
    replace: (domNode: any) => {
      if (!domNode.attribs) return;

      const { id, className } = domNode.attribs;

      if (id) {
        console.log('ComponentRenderer: Parsing node with ID', { id, type: domNode.name });

        const actionEntry = Object.entries(logic.actions || {}).find(([_, a]) => a.targetId === id);

        if (actionEntry) {
          const [actionName] = actionEntry;
          console.log('ComponentRenderer: Found action for node', { id, actionName });

          // Buttons
          if (domNode.name === 'button') {
            return (
              <button key={id} className={className} onClick={() => handleAction(actionName)}>
                {domToReact(domNode.children)}
              </button>
            );
          }
        }

        // Inputs
        if (domNode.name === 'input') {
          console.log('ComponentRenderer: Setting up input with current value', {
            id,
            currentValue: formState[id] || '',
          });

          return (
            <input
              key={id}
              {...domNode.attribs}
              className={className}
              value={formState[id] || ''}
              onChange={e => handleInputChange(id, e.target.value)}
            />
          );
        }

        // Future expansion: textarea, select, etc.
      }
    },
  });

  console.log('ComponentRenderer: Finished parsing JSX');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {parsedContent}
    </motion.div>
  );
}
