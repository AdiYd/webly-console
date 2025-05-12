import { NextRequest } from 'next/server';
// Import streamText and specific provider integrations with tools
import { streamText, Message as AIMessage, tool, Tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { z } from 'zod'; // Import zod for schema validation
import { auth } from '@/auth'; // Import auth for session handling
import { serverLogger } from '@/utils/logger';
import { Agent } from '@/context/OrganizationContext';
import { firestoreTools } from '@/lib/tools/firestore-tools-minimized';
import { getAdminFirebase } from '@/lib/firebase/firebase-admin';
import { agentsTools } from '@/lib/tools/agents-tools';

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

// Interface for attachments matching client-side expectations
interface Attachment {
  type: string; // 'image' or 'document'/'file'
  name?: string;
  contentType?: string;
  url?: string;
  image?: string; // URL for the image (data URL or remote URL)
  file?: {
    name: string;
    url: string;
    type: string;
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    serverLogger.error('ChatAPI', 'Unauthorized request attempt');
    return new Response(
      JSON.stringify({
        error:
          'Unauthorized user, please <a href="/login">log in</a> or <a href="/signup">sign up</a>',
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
      agents,
      attachments, // Extract attachments from the request body
    } = body;

    serverLogger.info('ChatAPI', 'Received request', {
      provider,
      model,
      systemPrompt,
      messageCount: messages?.length,
      hasattachments: !!attachments?.length,
    });

    if (!messages || !Array.isArray(messages)) {
      serverLogger.error('ChatAPI', 'Invalid message format');
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Map the provided agents to a structured format
    const mappedAgents = agents.map((agent: Agent) => {
      return {
        id: agent.id || 'unknown',
        name: agent.name || agent.id || 'Unknown Agent',
        role: agent.role || 'Specialized Agent',
        description: agent.description || '',
        prompt: agent.prompt || ``,
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
    ${mappedAgents
      .map((agent: Agent) => `- Role: ${agent.role} - (call with id: ${agent.id})`)
      .join('\n')}
    
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

    // Create pattern for interactive UI in form of react components
    const interactiveUIPattern = `
        🎨 Dynamic UI Injection for Live Streaming

        If there are more information to gather from the client or to show the client, always create dynamic, interactive UI components inside the conversation and engage with the client in a visual way by using this format:

        1. You can provide an UI component (such as a form, card, options, etc.), wrap a JSON object inside triple brackets: [[[ ... ]]].
        2. The JSON object must contain:
          - "jsxString": A string of JSX-like HTML that defines the visual structure using TailwindCSS and DaisyUI classes.
          - "logic": A JSON object defining states and actions (e.g., button clicks, form submissions).

        Example:

        Here is the form you requested:

        [[[
        {
          "jsxString": "<div className='card w-full max-w-md bg-base-100 shadow-xl p-6'> \
            <h2 className='text-2xl font-bold mb-4'>User Information</h2> \
            <input id='name' type='text' placeholder='Name' className='input input-bordered w-full mb-3' /> \
            <input id='email' type='email' placeholder='Email' className='input input-bordered w-full mb-3' /> \
            <button id='submitBtn' className='btn btn-primary w-full'>Submit</button> \
          </div>",
          "logic": {
            "states": {
              "name": "",
              "email": ""
            },
            "actions": {
              "submitForm": {
                "targetId": "submitBtn",
                "collectFrom": ["name", "email"],
                "actionType": "submitForm"
              }
            }
          }
        }
        ]]]

        Please fill out the form!

        ---

        📋 Important Rules:

        - Always use [[[ ... ]]] to wrap interactive UI injections.
        - Only TailwindCSS and DaisyUI classes are allowed for styling.
        - Do not embed full React components or JavaScript functions inside the JSX.
        - Separate dynamic behavior (states, actions) inside the "logic" section.
        - Use HTML-like tags: <div>, <input>, <button>, <select>, etc.
        - Insert UI elements naturally where they enhance conversation (e.g., after a user request or a helpful suggestion).

        ---

        🎨 Tips for Better Design:

        - Use nice card layouts: \`card\`, \`shadow-md\`, \`rounded-lg\`, \`p-6\`
        - Add margin or padding using \`mb-4\`, \`gap-4\`
        - Choose typography classes like \`text-lg\`, \`text-2xl\`, \`font-bold\`
        - Always prefer clean, mobile-responsive structures.

        ---

        ✅ Summary:

        Use this format to dynamically create smooth, beautiful, live interactive UI inside the chat — enriching the conversation and making it engaging for the client.
        Use it wisely and creatively, every time the client asking to see or show data or requested to chose, input or select data!
        `;

    const finalPrompt = `
    ${firestoreSystemPrompt}
    \n
    ${agentsSystemPrompt}
    \n
    ${interactiveUIPattern}
    \n\n
    ${systemPrompt}
    `;
    // Handle pending attachments - add them to the last user message
    let messagesWithAttachments = [...messages];

    if (attachments && attachments.length > 0) {
      serverLogger.info('ChatAPI', 'Found pending attachments in body', {
        count: attachments.length,
        types: attachments.map((a: any) => a.type),
      });

      // Find the last user message in the array
      const lastUserMessageIndex = messagesWithAttachments
        .map((msg, index) => ({ role: msg.role, index }))
        .filter(item => item.role === 'user')
        .pop()?.index;

      if (lastUserMessageIndex !== undefined) {
        serverLogger.debug('ChatAPI', 'Adding attachments to last user message', {
          messageIndex: lastUserMessageIndex,
          attachmentCount: attachments.length,
        });

        // Clone the message to avoid mutations
        const updatedMessage = {
          ...messagesWithAttachments[lastUserMessageIndex],
          attachments: attachments,
        };

        // Replace the message in the array
        messagesWithAttachments[lastUserMessageIndex] = updatedMessage;

        // Log the updated message to confirm attachments are added
        serverLogger.debug('ChatAPI', 'Updated message with attachments', {
          role: updatedMessage.role,
          content: updatedMessage.content?.substring(0, 30) + '...',
          attachmentCount: updatedMessage.attachments?.length,
        });
      } else {
        serverLogger.warn('ChatAPI', 'No user message found to attach files to');
      }
    }

    // Process messages to handle attachments
    const processedMessages = messagesWithAttachments.map(message => {
      // Skip messages without attachments
      if (!message.attachments || message.attachments.length === 0) {
        return message;
      }

      serverLogger.debug('ChatAPI', 'Processing message with attachments', {
        role: message.role,
        attachmentCount: message.attachments.length,
      });

      // Create a new message with processed attachments
      const processedMessage = { ...message };

      const contentParts = [];

      // First, add the text content if it exists
      if (message.content && message.content.trim()) {
        contentParts.push({
          type: 'text',
          text: message.content,
        });
      }

      message.attachments.forEach((attachment: Attachment, index: number) => {
        // Log the attachment details for debugging
        serverLogger.debug('ChatAPI', `Processing attachment ${index + 1}`, {
          type: attachment.type,
          name: attachment.name,
        });

        // Handle image attachments
        if (attachment.type === 'image' && (attachment.image || attachment.url)) {
          try {
            // Format for Vercel AI SDK
            const imageUrl = attachment.image || attachment.url;

            if (!imageUrl) {
              serverLogger.error('ChatAPI', `Image attachment ${index + 1} missing URL`);
              return;
            }

            // Create a URL object to validate the URL
            const url = new URL(imageUrl);

            // Add the image as a content part
            contentParts.push({
              type: 'image',
              image: url.toString(),
            });

            serverLogger.info(
              'ChatAPI',
              `Successfully added image attachment ${index + 1} to content`,
              {
                protocol: url.protocol,
                origin: url.origin.substring(0, 20) + '...',
              }
            );
          } catch (error) {
            serverLogger.error('ChatAPI', `Failed to process image attachment ${index + 1}`, {
              error: error instanceof Error ? error.message : 'Unknown error',
              name: attachment.name,
            });
          }
        }

        // Handle document attachments (currently not supported in the API)
        if (attachment.type === 'document' || attachment.type === 'file') {
          serverLogger.debug('ChatAPI', `Document attachment ${index + 1} received`, {
            name: attachment.name,
            type: attachment.contentType,
          });
          serverLogger.warn(
            'ChatAPI',
            'Document attachments are not yet supported by the AI model'
          );
          // Not implemented yet - document processing for AI
        }
      });

      // Replace the original content with the array of parts if we have any parts
      if (contentParts.length > 0) {
        processedMessage.content = contentParts;

        // Remove the attachments property since we've incorporated them into the content
        delete processedMessage.attachments;

        serverLogger.debug('ChatAPI', 'Converted message to multimodal format', {
          role: processedMessage.role,
          textPartCount: contentParts.filter(part => part.type === 'text'),
          imagePart: contentParts.filter(part => part.type === 'image'),
        });
      }

      return processedMessage;
    });

    // Common set of tools for all providers that support tools
    const commonTools = { ...loggedFirestoreTools, ...agentsTools(agents) };

    // Use streamText for different providers
    let result;
    switch (provider) {
      case 'openai':
        serverLogger.info('ChatAPI', 'Using OpenAI provider', {
          model,
          imageSupport: ['gpt-4-vision', 'gpt-4o'].includes(model) ? 'Yes' : 'No',
        });

        // Check if the model supports images and if we have any image attachments
        if (['gpt-4-vision', 'gpt-4o'].includes(model)) {
          // Count image parts in content arrays
          const imagePartCount = processedMessages.reduce((count, msg) => {
            if (Array.isArray(msg.content)) {
              return count + msg.content.filter((part: any) => part.type === 'image').length;
            }
            return count;
          }, 0);
        }

        // Debug log to show the exact messages being sent to the AI
        serverLogger.debug(
          'ChatAPI',
          'Final messages being sent to AI',
          processedMessages.map(msg => ({
            role: msg.role,
            content: Array.isArray(msg.content)
              ? msg.content[1]
              : msg.content?.substring(0, 30) + '...',
            hasImageParts: Array.isArray(msg.content)
              ? msg.content.some((part: any) => part.type === 'image')
              : false,
          }))
        );

        result = streamText({
          model: openai(model),
          messages: processedMessages as AIMessage[],
          system: finalPrompt || undefined,
          temperature,
          ...(maxTokens ? { maxTokens } : {}),
          tools: commonTools,
          maxRetries: 3,
          maxSteps: 8,
        });
        break;

      case 'anthropic':
        serverLogger.info('ChatAPI', 'Using Anthropic provider', {
          model: 'claude-3-5-sonnet-20241022',
        });
        result = streamText({
          model: anthropic('claude-3-5-sonnet-20241022'),
          messages: processedMessages as AIMessage[],
          system: finalPrompt || undefined,
          temperature,
          ...(maxTokens ? { maxTokens } : {}),
          tools: commonTools,
          maxRetries: 3,
          maxSteps: 8,
        });
        break;

      case 'gemini':
        serverLogger.error('ChatAPI', 'Gemini integration not implemented');
        return new Response(
          JSON.stringify({
            error: 'Gemini integration using AI SDK tools not yet implemented',
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
            error: 'Grok integration using AI SDK tools not yet implemented',
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
