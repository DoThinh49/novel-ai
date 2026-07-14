// ============================================================
// API Route: Projects CRUD
// GET    /api/projects       — List all projects of current user
// POST   /api/projects       — Create new project for current user
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET — List projects of current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
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
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { title, genre, hashtags, writingStyle } = body;

    const project = await prisma.project.create({
      data: {
        title: title || '',
        genre: genre || '',
        hashtags: JSON.stringify(hashtags || []),
        writingStyle: writingStyle || '',
        status: 'draft',
        userId: userId,
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
