import { Agent } from '@/context/OrganizationContext';
import { tool } from 'ai';
import { clientLogger } from '@/utils/logger';

// Helper function to format errors consistently
const formatErrorResponse = (operation: string, error: any): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `Error during operation "${operation}": ${errorMessage}\n\nPlease check your parameters and try again.`;
};

/**
 * Creates tools for querying specialized agents
 * @param agents List of agents available to query
 * @returns Object containing agent query tools
 */
export const agentsTools = (agents: Agent[]) => {
  // If no agents, return a valid empty object (not undefined properties)
  if (!agents || agents.length === 0) {
    return {};
  }

  // Helper function to find an agent by ID
  const findAgentById = (agentId: string): Agent | undefined => {
    return agents.find(agent => agent.id === agentId);
  };

  // Tool to query agents with flexible output format options
  const queryAgentTool = tool({
    name: 'queryAgent',
    description: 'Query a specialized agent to get expert responses for specific domains',
    type: 'function',
    args: {
      properties: {
        operation: {
          type: 'string',
          enum: ['text', 'object'],
          description:
            'Type of response to get from the agent: "text" for natural language responses, "object" for structured data',
          default: 'text',
        },
        agentId: {
          type: 'string',
          description: 'ID of the agent to query',
          enum: agents.map(agent => agent.id),
        },
        query: {
          type: 'string',
          description: 'The query or task to send to the agent',
        },
        format: {
          type: 'string',
          description:
            'Optional format specification for object responses (only used when operation="object")',
          default: 'JSON',
        },
      },
      required: ['agentId', 'query'],
    },
    execute: async ({ operation = 'text', agentId, query, format = 'JSON' }) => {
      try {
        // Find the agent by ID
        const agent = findAgentById(agentId);
        if (!agent) {
          return formatErrorResponse(
            'queryAgent',
            `Agent with ID "${agentId}" not found. Available agents: ${agents
              .map(a => `${a.id} (${a.role})`)
              .join(', ')}`
          );
        }

        clientLogger.debug('Agent queried:', '', {
          operation,
          agentId,
          agentName: agent.name,
          query,
          format,
        });

        // Handle based on operation type
        if (operation === 'text') {
          // Return text response
          return `[Response from ${agent.name} (${agent.role})]: 
          
I've analyzed your query: "${query}"
          
Based on my specialized knowledge as ${agent.role}, here's my response:
          
This is a simulated response. In a production environment, this query would be processed using the specialized agent's prompt: "${
            agent.prompt || agent.description
          }".
          
Query complete.`;
        } else if (operation === 'object') {
          // Return structured data
          const simulatedResponse = {
            agent: {
              id: agent.id,
              name: agent.name,
              role: agent.role,
            },
            query: query,
            timestamp: new Date().toISOString(),
            response: {
              summary: `This is a simulated structured response from ${agent.name}`,
              confidence: 0.92,
              details: [
                "This would contain actual structured data based on the agent's expertise",
                'For example, a marketing agent might return campaign metrics',
                'A research agent might return citations and facts',
              ],
              format: format || 'JSON',
            },
          };

          return JSON.stringify(simulatedResponse, null, 2);
        } else {
          return formatErrorResponse(
            'queryAgent',
            `Invalid operation: ${operation}. Use "text" or "object".`
          );
        }
      } catch (error) {
        clientLogger.error('Error querying agent:', '', error);
        return formatErrorResponse('queryAgent', error);
      }
    },
  });

  // Return the agent tools
  return {
    queryAgent: queryAgentTool,
  };
};
