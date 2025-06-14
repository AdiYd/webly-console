import { NextRequest } from 'next/server';
// Import streamText and specific provider integrations with tools
import { streamText, Message, tool, Tool, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

import { auth } from '@/auth'; // Import auth for session handling
import { serverLogger } from '@/utils/logger';
import { firestoreTools } from '@/lib/tools/firestore-tools';
import { getAdminFirebase } from '@/lib/firebase/firebase-admin';
import { prompts } from './prompts';

const initiateAdminFireBase = getAdminFirebase();
const loggedFirestoreTools = Object.entries(firestoreTools).reduce((acc, [key, tool]) => {
  const originalExecute = tool.execute;

  const loggedExecute = async (args: any) => {
    serverLogger.info('Firestore Tool Invocation', `Tool "${key}" called`, {
      tool: key,
      arguments: args,
    });

    try {
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

        args = { ...args, data: args.value };
      }

      const result = await originalExecute(args);
      const resultStr = typeof result === 'string' ? result : JSON.stringify(result);

      serverLogger.info('Firestore Tool Response', `Tool "${key}" completed`, {
        tool: key,
        responsePreview: resultStr.substring(0, 200) + (resultStr.length > 200 ? '...' : ''),
      });

      return resultStr;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      serverLogger.error('Firestore Tool Error', `Tool "${key}" failed but error was captured`, {
        tool: key,
        error,
        arguments: args,
      });

      return `Error executing ${key}: ${errorMessage}\n\nPlease check your parameters and try again.`;
    }
  };

  return {
    ...acc,
    [key]: {
      ...tool,
      execute: loggedExecute,
    },
  };
}, {} as typeof firestoreTools);

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
      provider = 'openai',
      temperature = 0.7,
      systemPrompt = '',
      maxTokens,
      uiData,
    } = body;

    serverLogger.info('ChatAPI', 'Received request', {
      provider,
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

    const finalPrompt = `${systemPrompt}. \n ${prompts.ui} \n ${prompts.general}`;
    const commonTools = { ...loggedFirestoreTools };
    const processedMessages = messages.map(msg => {
      if (msg.role === 'user') {
        return {
          ...msg,
          content: msg.content.replace(/```UI[\s\S]*?```/g, `<-- UI COMPONENT -->`), // Replace UI code block with a placeholder
        };
      }
      return msg;
    });
    if (uiData) {
      processedMessages.push({
        role: 'user',
        content: `UI Data result: ${JSON.stringify(uiData, null, 2)}`,
      } as UIMessage);

      console.log('UI Data added to messages:', uiData);
    }

    // Use streamText for different providers
    let modelProvider;
    switch (provider) {
      case 'openai':
        modelProvider = openai('gpt-4o-mini');
        serverLogger.info('ChatAPI', 'Using OpenAI provider', { model: 'gpt-4o' });
        break;

      case 'anthropic':
        modelProvider = anthropic('claude-3-5-sonnet-20241022');
        serverLogger.info('ChatAPI', 'Using Anthropic provider', {
          model: 'claude-3-5-sonnet-20241022',
        });
        break;

      case 'gemini':
        serverLogger.error('ChatAPI', 'Gemini integration not implemented');
        return new Response(
          JSON.stringify({ error: 'Gemini integration using AI SDK tools not yet supported' }),
          { status: 501, headers: { 'Content-Type': 'application/json' } }
        );

      case 'grok':
        serverLogger.error('ChatAPI', 'Grok integration not implemented');
        return new Response(
          JSON.stringify({ error: 'Grok integration using AI SDK tools not yet supported' }),
          { status: 501, headers: { 'Content-Type': 'application/json' } }
        );

      default:
        serverLogger.error('ChatAPI', `Unsupported provider: ${provider}`);
        return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    serverLogger.info('ChatAPI', 'Streaming response back to client');

    try {
      const result = streamText({
        model: modelProvider,
        messages: processedMessages.slice(processedMessages.length - 9, processedMessages.length), // Limit to last 9 messages
        // ...(provider !== 'anthropic' && { system: finalPrompt }),
        ...(finalPrompt && { system: finalPrompt }),
        ...(maxTokens && { maxTokens }),
        ...(temperature && { temperature }),
        maxRetries: 3,
        maxSteps: 10,
      });

      const streamResponse = result.toDataStreamResponse();

      if (!streamResponse) {
        throw new Error('Failed to generate stream response');
      }

      return streamResponse;
    } catch (streamError) {
      serverLogger.error('ChatAPI', 'Stream generation error', {
        provider,
        error: streamError,
        errorMessage: streamError instanceof Error ? streamError.message : String(streamError),
      });

      return new Response(
        JSON.stringify({
          error: `Streaming error with ${provider}: ${
            streamError instanceof Error ? streamError.message : 'Unknown streaming error'
          }`,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    serverLogger.error('ChatAPI', 'General error in chat endpoint', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

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
