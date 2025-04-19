import { NextRequest } from 'next/server';
// Import streamText and specific provider integrations with tools
import { streamText, Message as AIMessage, tool, Tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { z } from 'zod'; // Import zod for schema validation

import { auth } from '@/auth'; // Import auth for session handling

// API key validation helper remains the same
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

// Example AI tool for weather information (placeholder)
const weatherTool = tool({
  // name: 'weather',
  description: 'Get the weather in a location (fahrenheit)',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => {
    // This is a mock implementation
    console.log(`Getting weather for ${location}`);
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
  // name: 'getCurrentTime',
  description: 'Get the current time in a specific timezone',
  parameters: z.object({
    timezone: z
      .string()
      .optional()
      .describe('The timezone to get current time for, defaults to UTC'),
  }),
  execute: async ({ timezone = 'UTC' }) => {
    console.log(`Getting time for timezone: ${timezone}`);
    return {
      timezone,
      currentTime: new Date().toLocaleString('en-US', { timeZone: timezone }),
    };
  },
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
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
    } = body;

    console.log('Received request:', {
      provider,
      model,
      temperature,
      systemPrompt,
      maxTokens,
      agents,
      messages: messages[messages.length - 1],
      messageCount: messages?.length,
    });
    console.log('Messages parts: ', messages[messages.length - 1]?.parts);
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Common set of tools for all providers that support tools
    const commonTools = {
      weather: weatherTool,
      getCurrentTime: timeTool,
      // Add more tools as needed
    };

    // Use streamText for different providers
    let result;
    switch (provider) {
      case 'openai':
        result = streamText({
          model: openai(model),
          messages: messages as AIMessage[],
          system: systemPrompt || undefined,
          temperature,
          ...(maxTokens ? { maxTokens } : {}),
          tools: commonTools, // Add tools to OpenAI
        });
        break;

      case 'anthropic':
        result = streamText({
          model: anthropic('claude-3-5-sonnet-20241022'),
          messages: messages as AIMessage[],
          system: systemPrompt || undefined,
          temperature,
          ...(maxTokens ? { maxTokens } : {}),
          // Note: Add tools only if the model supports them (may vary by provider)
          // ...(model.includes('claude-3') ? { tools: commonTools } : {}),
        });
        break;

      case 'gemini': // Use 'gemini' consistently
        // placeholder for Google Gemini integration
        // Note: Google Gemini may not support tools in the same way as OpenAI or Anthropic
        return new Response(
          JSON.stringify({
            error: 'Gemini integration using AI SDK tools not yet implemented',
          }),
          {
            status: 501,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      // Add case for 'grok' if a Vercel AI SDK integration exists
      case 'grok': {
        // Placeholder for Grok integration - would need actual implementation
        return new Response(
          JSON.stringify({
            error: 'Grok integration using AI SDK tools not yet implemented',
          }),
          {
            status: 501,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // Return the stream response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
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
