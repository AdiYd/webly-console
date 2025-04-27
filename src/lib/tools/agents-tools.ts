import { z } from 'zod';
import { auth } from '@/auth';
import { serverLogger } from '@/utils/logger';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, generateObject } from 'ai';
import { Agent } from '@/context/OrganizationContext';
// Helper function to format errors consistently
const formatErrorResponse = (operation: string, error: any): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `Error during operation "${operation}": ${errorMessage}\n\nPlease check your parameters and try again.`;
};

/**
 * Tools for interacting with specialized agents
 */
export const agentsTools = (agents: any[]) => ({
  /**
   * Query an agent with a specific question to get a text response
   */
  queryAgent: {
    description:
      'Ask a question to a specialized agent (with predefined expertise) to get a natural language response',
    parameters: z.object({
      agentId: z.string().describe('ID of the agent to query'),
      question: z.string().describe('The question or request to send to the agent'),
      provider: z
        .enum(['openai', 'anthropic'])
        .default('openai')
        .optional()
        .describe('AI provider to use (default: openai)'),
      model: z
        .string()
        .default('gpt-4o')
        .optional()
        .describe(
          'Model to use. For OpenAI: gpt-4o, gpt-4-turbo, etc. For Anthropic: claude-3-opus-20240229, claude-3-sonnet, etc.'
        ),
      temperature: z
        .number()
        .min(0)
        .max(2)
        .default(0.7)
        .optional()
        .describe('Temperature for response generation (0-2, higher is more creative)'),
      includeAgentContext: z
        .boolean()
        .default(true)
        .optional()
        .describe("Whether to include the agent's name, role and description in the response"),
    }),
    execute: async ({
      agentId,
      question,
      provider = 'openai',
      model = 'gpt-4o',
      temperature = 0.7,
      includeAgentContext = true,
    }: any) => {
      try {
        // Find the agent by ID
        const agent = agents.find((a: Agent) => a.id === agentId);
        if (!agent) {
          return formatErrorResponse('queryAgent', 'No agent provided. Please specify an agent.');
        }

        serverLogger.info('Agents Tools', 'Querying agent', {
          agent,
          provider,
          model,
        });

        // Select the provider and model
        const aiModel =
          provider === 'anthropic'
            ? anthropic(model || 'claude-3-opus-20240229')
            : openai(model || 'gpt-4o');

        // Create a system prompt combining the agent's prompt with the question
        const systemPrompt =
          `You are ${agent.name}, a ${agent.role}.\n
           ${agent.description || ''}
           \n ${agent.prompt || '*****'}` ||
          agent.prompt ||
          `You are ${agent.name}, a ${agent.role}. ${agent.description || ''}`;

        // Generate text response
        const response = await generateText({
          model: aiModel,
          system: systemPrompt,
          messages: [{ role: 'user', content: question }],
          temperature,
        });

        // Format the response
        let formattedResponse = response.text || response;

        if (includeAgentContext) {
          formattedResponse = `**Response from ${agent.name} (${agent.role}):**\n\n${formattedResponse}`;
        }

        serverLogger.info('Agents Tools', 'Agent response generated', {
          agent: agent.name,
          agentName: agent.name,
          responseLength: formattedResponse.toString().length,
        });

        return formattedResponse;
      } catch (error) {
        serverLogger.error('Agents Tools', 'Error querying agent', {
          error,
          agentName: agents.find((a: Agent) => a.id === agentId)?.name,
          question,
        });
        return formatErrorResponse('queryAgent', error);
      }
    },
  },

  /**
   * Query an agent with a specific question to get a structured object response
   */
  queryAgentForObject: {
    description:
      'Ask a question to a specialized agent and receive a structured JSON object response based on a schema',
    parameters: z.object({
      agentId: z.string().describe('ID of the agent to query'),
      question: z.string().describe('The question or request to send to the agent'),
      schema: z
        .record(z.any())
        .describe(
          'JSON schema defining the structure of the expected response (e.g., { type: "object", properties: { name: { type: "string" }, age: { type: "number" } } })'
        ),
      provider: z
        .enum(['openai', 'anthropic'])
        .default('openai')
        .optional()
        .describe('AI provider to use (default: openai)'),
      model: z
        .string()
        .default('gpt-4o')
        .optional()
        .describe(
          'Model to use. For OpenAI: gpt-4o, gpt-4-turbo, etc. For Anthropic: claude-3-opus-20240229, claude-3-sonnet, etc.'
        ),
      temperature: z
        .number()
        .min(0)
        .max(2)
        .default(0.5)
        .optional()
        .describe(
          'Temperature for response generation (0-2, higher is more creative, default: 0.5)'
        ),
      maxRetries: z
        .number()
        .min(0)
        .max(3)
        .default(1)
        .optional()
        .describe('Maximum number of retry attempts if JSON generation fails (0-3, default: 1)'),
      includeRawText: z
        .boolean()
        .default(false)
        .optional()
        .describe('Whether to include the raw text response alongside the structured object'),
    }),
    execute: async ({
      agentId,
      question,
      schema,
      provider = 'openai',
      model = 'gpt-4o',
      temperature = 0.6,
      maxRetries = 1,
      includeRawText = false,
    }: any) => {
      try {
        // Find the agent by ID
        const agent = agents.find((a: Agent) => a.id === agentId);
        if (!agent) {
          return formatErrorResponse(
            'queryAgentForObject',
            'No agent provided. Please specify an agent.'
          );
        }

        // Validate schema
        if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
          return formatErrorResponse(
            'queryAgentForObject',
            'A valid JSON schema object is required'
          );
        }

        serverLogger.info('Agents Tools', 'Querying agent for structured object', {
          agent,
          provider,
          model,
          schemaProperties: Object.keys(schema.properties || {}),
        });

        // Select the provider and model
        const aiModel =
          provider === 'anthropic'
            ? anthropic(model || 'claude-3-opus-20240229')
            : openai(model || 'gpt-4o');

        // Create a system prompt combining the agent's prompt with the question
        const systemPrompt = `${
          `You are ${agent.name}, a ${agent.role}. ${agent.description || ''} \n\n ${
            agent.prompt || ''
          } ` || agent.prompt
        }
        
        You must respond with a valid JSON object according to the provided schema. Focus solely on generating accurate content without additional comments or explanations.`;
        // Add schema information to the question
        const enhancedQuestion = `${question}
        
        Please provide your response as a structured JSON object with these properties: ${Object.keys(
          schema.properties || {}
        ).join(', ')}`;

        let result;
        let error;
        let rawTextResponse = {};

        // Try to generate object with retries
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            if (attempt > 0) {
              serverLogger.warn('Agents Tools', `Retry attempt ${attempt} for object generation`, {
                agent,
              });
            }

            // Generate structured object response
            result = await generateObject({
              model: aiModel,
              system: systemPrompt,
              messages: [{ role: 'user', content: enhancedQuestion }],
              schema: schema,
              temperature,
            });

            // If we succeeded, break out of the retry loop
            if (result) break;
          } catch (err) {
            error = err;

            // For the last retry attempt, try to get at least a text response
            if (attempt === maxRetries) {
              try {
                rawTextResponse = await generateText({
                  model: aiModel,
                  system: systemPrompt,
                  messages: [{ role: 'user', content: enhancedQuestion }],
                  temperature,
                });
              } catch (textErr) {
                serverLogger.error('Agents Tools', 'Failed to get text response as fallback', {
                  error: textErr,
                });
              }
            }
          }
        }

        if (!result) {
          const errorMsg = formatErrorResponse(
            'queryAgentForObject',
            error || 'Failed to generate structured response'
          );

          if (rawTextResponse) {
            return `${errorMsg}\n\nHowever, the agent provided this text response instead:\n\n${rawTextResponse}`;
          }

          return errorMsg;
        }

        serverLogger.info('Agents Tools', 'Structured object response generated', {
          agent: agent.name,
          objectProperties: Object.keys(result),
        });

        // Format the response based on whether to include raw text
        const response = includeRawText
          ? {
              object: result,
              rawText: rawTextResponse || null,
              agent: {
                id: agent.id,
                name: agent.name,
                role: agent.role,
              },
            }
          : result;

        return JSON.stringify(response, null, 2);
      } catch (error) {
        serverLogger.error('Agents Tools', 'Error querying agent for object', {
          error,
          agent: agents.find((a: Agent) => a.id === agentId)?.name,
          question,
        });
        return formatErrorResponse('queryAgentForObject', error);
      }
    },
  },
});
