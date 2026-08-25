
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Auth check — only admins can create projects
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const json = await request.json();

    // Input validation — only allow known fields
    const title = typeof json.title === 'string' ? json.title.trim() : '';
    const description = typeof json.description === 'string' ? json.description.trim() : '';
    const tags = Array.isArray(json.tags) ? json.tags.filter((t: unknown) => typeof t === 'string').map((t: string) => t.trim()) : [];
    const link = typeof json.link === 'string' ? json.link.trim() : undefined;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: { title, description, tags, link },
    });
    return NextResponse.json(newProject);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
