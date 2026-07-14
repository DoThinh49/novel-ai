// ============================================================
// API Route: AI Text Rewrite Tool
// POST /api/tools/rewrite — Rewrite selected text with custom style
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { buildRewritePrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, style, instructions } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const prompt = buildRewritePrompt({
      text,
      style,
      instructions,
    });

    const rewrittenText = await generateContent(prompt, {
      temperature: 0.8,
      maxOutputTokens: 4096,
    });

    return NextResponse.json({ rewrittenText: rewrittenText.trim() });
  } catch (error) {
    console.error('Error rewriting text:', error);
    const message = error instanceof Error ? error.message : 'Failed to rewrite text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
