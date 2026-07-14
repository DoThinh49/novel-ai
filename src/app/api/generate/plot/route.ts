// ============================================================
// API Route: AI Plot Idea Suggestion
// POST /api/generate/plot — Suggest story outline / core plot idea
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { buildPlotIdeaSuggestionPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre, writingStyle, title, worldDescription, characters } = body;

    if (!genre || !writingStyle) {
      return NextResponse.json(
        { error: 'Genre and writingStyle are required' },
        { status: 400 }
      );
    }

    const prompt = buildPlotIdeaSuggestionPrompt({
      genre,
      writingStyle,
      title,
      worldDescription,
      characters,
    });

    const plotIdea = await generateContent(prompt, {
      temperature: 0.8,
      maxOutputTokens: 2048,
    });

    return NextResponse.json({ plotIdea: plotIdea.trim() });
  } catch (error) {
    console.error('Error generating plot idea:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate plot idea';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
