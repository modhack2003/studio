import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const json = await _request.json();
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

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.ctfEvent.delete({ where: { id } });
    return new NextResponse('Deleted', { status: 200 });
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


