import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const events = await prisma.ctfEvent.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json(events);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const json = await request.json();
    const created = await prisma.ctfEvent.create({
      data: {
        name: typeof json.name === 'string' ? json.name.trim() : 'New CTF',
        organizer: typeof json.organizer === 'string' ? json.organizer.trim() : 'Unknown',
        date: json.date ? new Date(json.date) : new Date(),
        placement: typeof json.placement === 'string' ? json.placement.trim() : null,
        team: typeof json.team === 'string' ? json.team.trim() : null,
        writeupUrl: typeof json.writeupUrl === 'string' ? json.writeupUrl.trim() : null,
        categories: Array.isArray(json.categories) ? json.categories.filter((c: unknown) => typeof c === 'string') : [],
        points: typeof json.points === 'number' ? json.points : null,
      },
    });
    return NextResponse.json(created);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
