import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { serverLogger } from '@/utils/logger';
import { firestoreTools } from '@/lib/tools/firestore-tools-minimized';
import { getAdminFirebase } from '@/lib/firebase/firebase-admin';
import { agentsTools } from '@/lib/tools/agents-tools';

const initiateAdminFireBase = getAdminFirebase();
interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

// IMPORTANT: Remove Edge runtime since Firebase Admin is not compatible with Edge
// export const runtime = 'edge';

// Add logging wrapper for tools that ensures results are always returned
const loggedFirestoreTools = Object.entries(firestoreTools).reduce((acc, [key, tool]) => {
  const originalExecute = tool.execute;

  // Create a wrapper that logs before and after execution and ensures a result is always returned
  const loggedExecute = async (args: any) => {
    serverLogger.info('Firestore Tool Invocation', `Tool "${key}" called`, {
      tool: key,
      arguments: args,
    });

    try {
      // Parameter normalization for common errors:
      // If tool is manageDocuments with operation add/update, and data is missing but value is provided
      if (
        key === 'manageDocuments' &&
        (args.operation === 'add' || args.operation === 'update') &&
        !args.data &&
        args.value &&
        typeof args.value === 'object' &&
        !Array.isArray(args.value)
      ) {
        serverLogger.warn('Firestore API', 'Parameter correction in API layer', {
          message: 'Used "value" instead of "data" for document content',
          operation: args.operation,
          collection: args.collection,
        });

        // Make a copy to avoid modifying the original args object
        args = { ...args, data: args.value };
      }

      const result = await originalExecute(args);

      // Ensure we always have a string result
      const resultStr = typeof result === 'string' ? result : JSON.stringify(result);

      serverLogger.info('Firestore Tool Response', `Tool "${key}" completed`, {
        tool: key,
        responsePreview: resultStr.substring(0, 200) + (resultStr.length > 200 ? '...' : ''),
      });

      return resultStr;
    } catch (error) {
      // Capture errors and return as response rather than throwing
      const errorMessage = error instanceof Error ? error.message : String(error);

      serverLogger.error('Firestore Tool Error', `Tool "${key}" failed but error was captured`, {
        tool: key,
        error,
        arguments: args,
      });

      // Return the error as a formatted string that the AI can read
      return `Error executing ${key}: ${errorMessage}\n\nPlease check your parameters and try again.`;
    }
  };

  // Return the tool with the logged execute function
  return {
    ...acc,
    [key]: {
      ...tool,
      execute: loggedExecute,
    },
  };
}, {} as typeof firestoreTools);

export async function POST(req: Request) {
  try {
    const {
      messages,
      provider = 'openai',
      model = 'gpt-4o',
      agents = [],
    }: {
      messages: {
        role: 'user' | 'assistant';
        content: string;
        toolInvocations?: ToolInvocation[];
      }[];
      provider?: string;
      model?: string;
      agents?: any[]; // Can be an array of objects with agent details
    } = await req.json();

    serverLogger.info('Firestore API', 'Request received', {
      provider,
      model,
      messagesCount: messages.length,
      lastUserMessage: messages.findLast(m => m.role === 'user')?.content.substring(0, 100) + '...',
      agentsCount: agents.length,
    });

    // Map the provided agents to a structured format
    const mappedAgents = agents.map(agent => {
      return {
        id: agent.id || 'unknown',
        name: agent.name || agent.id || 'Unknown Agent',
        role: agent.role || 'Specialized Agent',
        description: agent.description || '',
      };
    });

    // Create the Firestore system prompt
    const firestoreSystemPrompt = `You are a Firestore database assistant that helps users interact with their Firebase Firestore database.
      
    You have tools available to add, get, query, update, and delete documents in Firestore collections.
    You can also list all available collections.
    
    When users ask questions about their data or want to perform database operations:
    1. Use the appropriate tool to fulfill their request
    2. Present the data in a clean, readable format
    3. Always Explain what you did and what the results mean
    4. If you encounter an error, read the error message carefully and try to fix the issue by calling the tool again with corrected parameters
    5. Never expose the 'recycle' collection or any internal workings of the database to the user. this is for your internal use only.
    
    Always verify operations before performing destructive actions and ask for clarification if a request is ambiguous.
    Don't let the user know about your internal tools or how you are processing their request.
    Don't use the tools directly in your response. Instead, use them internally to get the data you need.
    If you remove any documents, make sure to explain what was removed and why, and never state or mention that the object is stored in a 'recycle' bin.
    IMPORTANT: When using 'add' or 'update' operations, always use the 'data' parameter to specify the document content. If the user provides a 'value' parameter, use it as the content of the document instead.
    `;

    // Create the agents system prompt if agents are available
    const agentsSystemPrompt =
      mappedAgents.length > 0
        ? `
    You also have access to specialized agents that can help with specific tasks:
    
    Available agents:
    ${mappedAgents.map(agent => `- Role: ${agent.role} - (call with id: ${agent.id})`).join('\n')}
    
    You can use these agents to:
    1. Generate text responses for specialized knowledge using the 'queryAgent' tool
    2. Generate structured data objects using the 'queryAgentForObject' tool
    
    When a user's request requires specialized knowledge or structured data in a specific format, consider using one of these agents instead of attempting to handle it yourself.
    Examples of when to use agents:
    - For domain-specific analysis or recommendations
    - When consistent, structured output format is needed
    - For generating content that follows specific guidelines
    - When the user explicitly asks for a specialized agent's help
    - When the user asks for a specific type of data or format that you cannot provide directly
    
    Don't explicitly mention these agents unless the user asks about available capabilities.`
        : '';

    // Combine the prompts
    const combinedSystemPrompt =
      mappedAgents.length > 0
        ? `${firestoreSystemPrompt}\n\n${agentsSystemPrompt}`
        : firestoreSystemPrompt;

    // Select the appropriate model based on provider
    const selectedModel =
      provider === 'anthropic' ? anthropic('claude-3-opus-20240229') : openai(model || 'gpt-4o');

    // Track tool invocations during the stream
    let currentToolInvocations: ToolInvocation[] = [];

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
      serverLogger.info('Firestore API', 'Previous tool invocations', {
        count: lastMessage.toolInvocations.length,
        tools: lastMessage.toolInvocations.map((t: any) => t.name),
      });
    }

    const result = streamText({
      model: selectedModel,
      system: combinedSystemPrompt,
      messages,
      tools: { ...loggedFirestoreTools, ...agentsTools(agents) },
      maxSteps: 8, // Allow multiple steps for error recovery
    });

    // Log when the stream starts
    serverLogger.info('Firestore API', 'Response stream started');

    // Add completion listener
    // result.on('end', () => {
    //   serverLogger.info('Firestore API', 'Response stream completed');
    // });

    return result.toDataStreamResponse();
  } catch (error) {
    serverLogger.error('Firestore API', 'Error processing request', { error });
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while processing your request',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
