import { NextRequest } from 'next/server';
// Import streamText and specific provider integrations with tools
import { streamText, Message as AIMessage, tool, Tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { z } from 'zod'; // Import zod for schema validation
import { auth } from '@/auth'; // Import auth for session handling
import { serverLogger } from '@/utils/logger';
import { Console } from 'console';
import { getAdminFirebase } from '@/lib/firebase/firebase-admin';

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

// Example AI tool for weather information (placeholder)
const weatherTool = tool({
  description: 'Get the weather in a location (fahrenheit)',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => {
    serverLogger.debug('weatherTool', `Getting weather for ${location}`);
    const temperature = Math.round(Math.random() * (90 - 32) + 32);
    return {
      location,
      temperature,
      conditions: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 100),
    };
  },
});

// Example AI tool for current time (placeholder)
const timeTool = tool({
  description: 'Get the current time in a specific timezone',
  parameters: z.object({
    timezone: z
      .string()
      .optional()
      .describe('The timezone to get current time for, defaults to UTC'),
  }),
  execute: async ({ timezone = 'UTC' }) => {
    serverLogger.debug('timeTool', `Getting time for timezone: ${timezone}`);
    return {
      timezone,
      currentTime: new Date().toLocaleString('en-US', { timeZone: timezone }),
    };
  },
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    serverLogger.error('ChatAPI', 'Unauthorized request attempt');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
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
    const commonTools = {
      weather: weatherTool,
      getCurrentTime: timeTool,
    };

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
          system: systemPrompt || undefined,
          temperature,
          ...(maxTokens ? { maxTokens } : {}),
          // tools: commonTools,
        });
        break;

      case 'anthropic':
        serverLogger.info('ChatAPI', 'Using Anthropic provider', {
          model: 'claude-3-5-sonnet-20241022',
        });
        result = streamText({
          model: anthropic('claude-3-5-sonnet-20241022'),
          messages: processedMessages as AIMessage[],
          system: systemPrompt || undefined,
          temperature,
          ...(maxTokens ? { maxTokens } : {}),
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
    return result.toDataStreamResponse();
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
