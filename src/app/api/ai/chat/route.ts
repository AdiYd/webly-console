import { NextRequest } from 'next/server';
// Import streamText and specific provider integrations with tools
import { streamText, Message, tool, Tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

import { auth } from '@/auth'; // Import auth for session handling
import { serverLogger } from '@/utils/logger';
import { firestoreTools } from '@/lib/tools/firestore-tools';
import { getAdminFirebase } from '@/lib/firebase/firebase-admin';

const initiateAdminFireBase = getAdminFirebase();
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
        serverLogger.warn('Chat API', 'Parameter correction in API layer', {
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

// API key validation helper
const getApiKey = (provider: string): string => {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY || '';
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || '';
    case 'gemini': // Use 'gemini' consistently
      return process.env.GOOGLE_API_KEY || '';
    case 'grok': // Grok might need a specific SDK or custom handling
      return process.env.GROK_API_KEY || '';
    default:
      throw new Error(`No API key found for provider: ${provider}`);
  }
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    serverLogger.error('ChatAPI', 'Unauthorized request attempt');
    return new Response(
      JSON.stringify({
        error:
          'Unauthorized user, please <a class="link font-semibold hover:opacity-60" href="/auth/signin">log in</a> or <a class="link font-semibold hover:opacity-60" href="/auth/signup">sign up</a>',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await req.json();
    const {
      messages,
      model = 'gpt-4o',
      provider = 'openai',
      temperature = 0.7,
      systemPrompt = '',
      maxTokens,
    } = body;

    serverLogger.info('ChatAPI', 'Received request', {
      provider,
      model,
      systemPrompt,
      messageCount: messages?.length,
    });

    if (!messages || !Array.isArray(messages)) {
      serverLogger.error('ChatAPI', 'Invalid message format');
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const finalPrompt = `
    ${systemPrompt}
    `;

    // Create commonTools with only defined tools
    const commonTools = {
      ...loggedFirestoreTools,
    };

    // Use streamText for different providers
    let modelProvider;
    switch (provider) {
      case 'openai':
        serverLogger.info('ChatAPI', 'Using OpenAI provider', {
          model,
          imageSupport: ['gpt-4-vision', 'gpt-4o'].includes(model) ? 'Yes' : 'No',
        });
        modelProvider = openai(model);
        break;

      case 'anthropic':
        serverLogger.info('ChatAPI', 'Using Anthropic provider', {
          model: 'claude-3-5-sonnet-20241022',
        });
        modelProvider = anthropic('claude-3-5-sonnet-20241022');
        break;

      case 'gemini':
        serverLogger.error('ChatAPI', 'Gemini integration not implemented');
        return new Response(
          JSON.stringify({
            error: 'Gemini integration using AI SDK tools not yet supported',
          }),
          {
            status: 501,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'grok':
        serverLogger.error('ChatAPI', 'Grok integration not implemented');
        return new Response(
          JSON.stringify({
            error: 'Grok integration using AI SDK tools not yet supported',
          }),
          {
            status: 501,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      default:
        serverLogger.error('ChatAPI', `Unsupported provider: ${provider}`);
        return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // Return the stream response
    serverLogger.info('ChatAPI', 'Streaming response back to client');
    try {
      const result = streamText({
        model: modelProvider,
        messages: messages as Message[],
        system: finalPrompt || '',
        temperature,
        ...(maxTokens ? { maxTokens } : {}),
        tools: commonTools,
        maxRetries: 3,
        maxSteps: 8,
      });
      const streamResponse = result.toDataStreamResponse();
      if (!streamResponse) {
        throw new Error('Failed to generate stream response');
      }

      return streamResponse;
    } catch (error) {
      serverLogger.error('ChatAPI', 'Error generating stream response', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Failed to generate stream response',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    serverLogger.error('ChatAPI', 'Error in chat endpoint', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
