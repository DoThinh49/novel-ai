// ============================================================
// API Route: AI Title Suggestion
// POST /api/generate/title — Generate novel title suggestions
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { buildTitleSuggestionPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre, hashtags, writingStyle } = body;

    if (!genre || !writingStyle) {
      return NextResponse.json(
        { error: 'Genre and writingStyle are required' },
        { status: 400 }
      );
    }

    const prompt = buildTitleSuggestionPrompt({
      genre,
      hashtags: hashtags || [],
      writingStyle,
    });

    const result = await generateContent(prompt, {
      temperature: 0.9, // Higher creativity for title suggestions
      maxOutputTokens: 2048,
    });

    // Parse JSON response from Gemini
    let titles;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch {
      // Fallback: return raw text as a single suggestion
      titles = [{ title: result.trim(), reason: 'AI generated' }];
    }

    return NextResponse.json({ titles });
  } catch (error) {
    console.error('Error generating titles:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate titles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
