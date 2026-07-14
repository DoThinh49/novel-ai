// ============================================================
// API Route: Projects CRUD
// GET    /api/projects       — List all projects
// POST   /api/projects       — Create new project
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            chapters: true,
            characters: true,
          },
        },
        outline: {
          select: {
            totalChapters: true,
          },
        },
      },
    });

    const parsedProjects = projects.map((project) => {
      try {
        return {
          ...project,
          hashtags: JSON.parse(project.hashtags),
        };
      } catch {
        return {
          ...project,
          hashtags: [],
        };
      }
    });

    return NextResponse.json({ projects: parsedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST — Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, genre, hashtags, writingStyle } = body;

    const project = await prisma.project.create({
      data: {
        title: title || '',
        genre: genre || '',
        hashtags: JSON.stringify(hashtags || []),
        writingStyle: writingStyle || '',
        status: 'draft',
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
