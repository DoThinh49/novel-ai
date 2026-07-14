// ============================================================
// API Route: Project Chapters Operations
// PATCH  /api/projects/[id]/chapters  — Update chapter content/status
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateContent } from '@/lib/gemini';
import { buildChapterSummaryPrompt } from '@/lib/prompts';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { chapterNumber, content, status } = body;

    if (chapterNumber === undefined) {
      return NextResponse.json(
        { error: 'chapterNumber is required' },
        { status: 400 }
      );
    }

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
      where: {
        projectId_chapterNumber: {
          projectId,
          chapterNumber,
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    // Automatically generate summary if the chapter is completed
    if (status === 'completed' && content) {
      try {
        const prompt = buildChapterSummaryPrompt({
          chapterNumber,
          chapterTitle: chapter.title,
          chapterContent: content,
        });

        // Generate summary from Gemini
        const summary = await generateContent(prompt, {
          temperature: 0.5,
          maxOutputTokens: 512,
        });

        updateData.summary = summary.trim();
      } catch (err) {
        console.error('Failed to auto-summarize chapter:', err);
        // Save empty summary or keep previous, do not block completing chapter
      }
    }

    // Update chapter
    const updatedChapter = await prisma.chapter.update({
      where: {
        projectId_chapterNumber: {
          projectId,
          chapterNumber,
        },
      },
      data: updateData,
    });

    return NextResponse.json({ chapter: updatedChapter });
  } catch (error) {
    console.error('Error updating chapter:', error);
    const message = error instanceof Error ? error.message : 'Failed to update chapter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
