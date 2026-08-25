import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const json = await request.json();
    const { id } = await context.params;
    const updated = await prisma.ctfEvent.update({
      where: { id },
      data: {
        name: json.name,
        organizer: json.organizer,
        date: json.date ? new Date(json.date) : undefined,
        placement: json.placement,
        team: json.team,
        writeupUrl: json.writeupUrl,
        categories: Array.isArray(json.categories) ? json.categories : undefined,
        points: typeof json.points === 'number' ? json.points : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    await prisma.ctfEvent.delete({ where: { id } });
    return new NextResponse('Deleted', { status: 200 });
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
