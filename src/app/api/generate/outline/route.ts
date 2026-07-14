// ============================================================
// API Route: AI Outline Generation
// POST /api/generate/outline — Generate and save project outline
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateContent } from '@/lib/gemini';
import { buildOutlinePrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, userRequirements, totalChapters } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const chaptersCount = totalChapters || 10; // Default to 10 chapters if not specified

    // Fetch project details with relations
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        characters: true,
        worldBuilding: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const prompt = buildOutlinePrompt({
      genre: project.genre,
      writingStyle: project.writingStyle,
      title: project.title,
      worldDescription: project.worldBuilding?.worldDescription || '',
      coreIdea: project.worldBuilding?.coreIdea || '',
      characters: project.characters.map((c) => ({
        name: c.name,
        role: c.role,
        description: c.description,
      })),
      totalChapters: chaptersCount,
      userRequirements: userRequirements || '',
    });

    const result = await generateContent(prompt, {
      temperature: 0.7, // Lower temperature for more structured adherence
      maxOutputTokens: 8192,
    });

    // Parse JSON response from Gemini
    let chapterOutlines;
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        chapterOutlines = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch {
      // Fallback fallback: create dummy outline
      chapterOutlines = Array.from({ length: chaptersCount }, (_, i) => ({
        chapterNumber: i + 1,
        title: `Chương ${i + 1}: Hành trình bắt đầu`,
        summary: `Tóm tắt nội dung chương ${i + 1} của truyện...`,
      }));
    }

    // Upsert Outline in database
    const outline = await prisma.outline.upsert({
      where: { projectId },
      update: {
        fullOutline: result,
        chapterOutlines: JSON.stringify(chapterOutlines),
        userRequirements: userRequirements || '',
        totalChapters: chaptersCount,
      },
      create: {
        projectId,
        fullOutline: result,
        chapterOutlines: JSON.stringify(chapterOutlines),
        userRequirements: userRequirements || '',
        totalChapters: chaptersCount,
      },
    });

    // Also populate pending chapters in the database
    // Delete existing pending chapters to rewrite them
    await prisma.chapter.deleteMany({
      where: {
        projectId,
        status: 'pending',
      },
    });

    // Bulk create pending chapters based on the generated outline
    await prisma.chapter.createMany({
      data: chapterOutlines.map((co: { chapterNumber: number; title: string; summary: string }) => ({
        projectId,
        chapterNumber: co.chapterNumber,
        title: co.title,
        content: '',
        summary: co.summary,
        status: 'pending',
      })),
    });

    return NextResponse.json({
      outline: {
        ...outline,
        chapterOutlines,
      },
    });
  } catch (error) {
    console.error('Error generating outline:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate outline';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
