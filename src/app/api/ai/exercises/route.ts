import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/service';
import { auth } from '../../../../auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { topic, difficulty, count } = body;

    // Validate inputs
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Create AI service instance
    const aiService = new AIService();

    // Create prompt for exercise generation
    const prompt = `Generate ${count || 3} ${difficulty || 'medium'} math exercises about ${topic}. 
    For each exercise, provide a question, the correct answer, and a hint.
    Return the result as a JSON array with objects containing 'question', 'answer', 'difficulty', and 'hint' properties.`;

    // Generate AI completion
    const response = await aiService.generateCompletion(prompt);

    // Check for errors
    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // In a real implementation, we would parse the AI's JSON response
    // For now, we'll return simulated data
    const exercises = Array.from({ length: count || 3 }, (_, i) => ({
      question: `Sample ${topic} question #${i + 1} (${difficulty || 'medium'} difficulty)`,
      answer: `Sample answer for question #${i + 1}`,
      difficulty: difficulty || 'medium',
      hint: `Here's a helpful hint for question #${i + 1}`
    }));

    // Return successful response
    return NextResponse.json({
      exercises,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Error in AI math exercise generator endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}