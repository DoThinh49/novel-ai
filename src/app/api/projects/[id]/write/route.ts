// ============================================================
// API Route: AI Chapter Writing (Streaming Response)
// POST /api/projects/[id]/write — Stream generated chapter text
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateStream } from '@/lib/gemini';
import { buildChapterWritingPrompt } from '@/lib/prompts';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { chapterNumber } = body;

    if (chapterNumber === undefined) {
      return NextResponse.json(
        { error: 'chapterNumber is required' },
        { status: 400 }
      );
    }

    // 1. Fetch project details with all relations
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        characters: true,
        worldBuilding: true,
        chapters: {
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Find current chapter outline info from chapters array or database
    const currentChapter = project.chapters.find((c) => c.chapterNumber === chapterNumber);
    if (!currentChapter) {
      return NextResponse.json(
        { error: `Chapter ${chapterNumber} outline not found` },
        { status: 404 }
      );
    }

    // 2. Build Context based on contextMode
    const completedChapters = project.chapters.filter(
      (c) => c.chapterNumber < chapterNumber && c.status === 'completed'
    );

    let previousContext = '';
    const mode = project.contextMode || 'summary';

    if (mode === 'full') {
      previousContext = completedChapters
        .map((c) => `--- CHƯƠNG ${c.chapterNumber}: ${c.title} ---\n${c.content}`)
        .join('\n\n');
    } else if (mode === 'sliding_window') {
      const windowSize = project.contextChapterCount || 3;
      const windowChapters = completedChapters.slice(-windowSize);
      previousContext = windowChapters
        .map((c) => `--- CHƯƠNG ${c.chapterNumber}: ${c.title} ---\n${c.content}`)
        .join('\n\n');
    } else {
      // Default: 'summary' mode
      previousContext = completedChapters
        .map((c) => `--- TÓM TẮT CHƯƠNG ${c.chapterNumber}: ${c.title} ---\n${c.summary || 'Chương này không có tóm tắt.'}`)
        .join('\n\n');
    }

    // 3. Build Prompt
    const prompt = buildChapterWritingPrompt({
      genre: project.genre,
      writingStyle: project.writingStyle,
      title: project.title,
      worldDescription: project.worldBuilding?.worldDescription || '',
      characters: project.characters.map((c) => ({
        name: c.name,
        role: c.role,
        description: c.description,
        backstory: c.backstory,
      })),
      chapterNumber,
      chapterTitle: currentChapter.title,
      chapterOutline: currentChapter.summary, // Summary field holds the chapter outline from Step 3
      previousContext,
      contextMode: mode,
      totalChapters: project.chapters.length,
    });

    // 4. Generate Content Stream
    const stream = await generateStream(prompt, {
      temperature: 0.8, // Slightly higher temperature for creative writing flow
      maxOutputTokens: 8192,
    });

    // 5. Build Response Stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error('Error in chapter write stream:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error generating chapter writing stream:', error);
    const message = error instanceof Error ? error.message : 'Failed to write chapter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
