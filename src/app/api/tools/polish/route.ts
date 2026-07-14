// ============================================================
// API Route: AI Text Polish Tool
// POST /api/tools/polish — Polish text and correct grammar errors
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { buildPolishPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, instructions } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const prompt = buildPolishPrompt({
      text,
      instructions,
    });

    const polishedText = await generateContent(prompt, {
      temperature: 0.5, // Lower temperature for focus on correction
      maxOutputTokens: 4096,
    });

    return NextResponse.json({ polishedText: polishedText.trim() });
  } catch (error) {
    console.error('Error polishing text:', error);
    const message = error instanceof Error ? error.message : 'Failed to polish text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
