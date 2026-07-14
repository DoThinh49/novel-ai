// ============================================================
// API Route: Project Detail Setup (Step 2)
// POST /api/projects/[id]/setup — Save characters and world details
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { worldDescription, coreIdea, settings, characters } = body;

    // Verify project exists
    const projectExists = await prisma.project.findUnique({
      where: { id },
    });

    if (!projectExists) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // 1. Upsert WorldBuilding
    const worldBuilding = await prisma.worldBuilding.upsert({
      where: { projectId: id },
      update: {
        worldDescription: worldDescription || '',
        coreIdea: coreIdea || '',
        settings: JSON.stringify(settings || {}),
      },
      create: {
        projectId: id,
        worldDescription: worldDescription || '',
        coreIdea: coreIdea || '',
        settings: JSON.stringify(settings || {}),
      },
    });

    // 2. Save Characters (Clean delete-and-insert for wizard style updates)
    if (characters && Array.isArray(characters)) {
      await prisma.character.deleteMany({
        where: { projectId: id },
      });

      if (characters.length > 0) {
        await prisma.character.createMany({
          data: characters.map((c) => ({
            projectId: id,
            name: c.name || 'Nhân vật mới',
            role: c.role || 'main',
            description: c.description || '',
            backstory: c.backstory || '',
          })),
        });
      }
    }

    // Fetch the updated project characters
    const updatedCharacters = await prisma.character.findMany({
      where: { projectId: id },
    });

    return NextResponse.json({
      success: true,
      worldBuilding: {
        ...worldBuilding,
        settings: settings || {},
      },
      characters: updatedCharacters,
    });
  } catch (error) {
    console.error('Error saving project setup:', error);
    const message = error instanceof Error ? error.message : 'Failed to save setup details';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
