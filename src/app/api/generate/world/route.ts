// ============================================================
// API Route: AI World Building Suggestion
// POST /api/generate/world — Suggest world setting
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { buildWorldSuggestionPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre, writingStyle, title } = body;

    if (!genre || !writingStyle) {
      return NextResponse.json(
        { error: 'Genre and writingStyle are required' },
        { status: 400 }
      );
    }

    const prompt = buildWorldSuggestionPrompt({
      genre,
      writingStyle,
      title,
    });

    const worldDescription = await generateContent(prompt, {
      temperature: 0.8,
      maxOutputTokens: 2048,
    });

    return NextResponse.json({ worldDescription: worldDescription.trim() });
  } catch (error) {
    console.error('Error generating world:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate world description';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
