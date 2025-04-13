import { NextRequest, NextResponse } from 'next/server';
import { AIService, AIMessage } from '@/lib/ai/service';
import { auth } from '../../../../auth';

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { messages, model, provider, temperature, maxTokens } = body;

    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Create AI service instance
    const aiService = new AIService({
      model: model,
      provider: provider,
      temperature: temperature,
      maxTokens: maxTokens,
    });

    // Generate AI completion
    const response = await aiService.generateChatCompletion(messages);

    // Check for errors
    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // Return successful response
    return NextResponse.json({
      text: response.text,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}