// ============================================================
// API Route: AI Character Suggestion
// POST /api/generate/characters — Generate character profiles
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { buildCharacterSuggestionPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre, writingStyle, worldDescription, coreIdea, count, role, existingCharacters } = body;

    if (!genre || !writingStyle) {
      return NextResponse.json(
        { error: 'Genre and writingStyle are required' },
        { status: 400 }
      );
    }

    const prompt = buildCharacterSuggestionPrompt({
      genre,
      writingStyle,
      worldDescription: worldDescription || '',
      coreIdea: coreIdea || '',
      count: count || 2,
      role: role || 'main',
      existingCharacters: existingCharacters || [],
    });

    const result = await generateContent(prompt, {
      temperature: 0.8,
      maxOutputTokens: 4096,
    });

    // Parse JSON response from Gemini
    let characters;
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        characters = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch {
      // Fallback
      characters = [
        {
          name: 'Nhân vật vô danh',
          description: 'Mô tả nhân vật này',
          backstory: 'Lý lịch nhân vật này',
          role: role || 'main',
        },
      ];
    }

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error generating characters:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate characters';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
