import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const events = await prisma.ctfEvent.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json(events);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const created = await prisma.ctfEvent.create({
      data: {
        name: json.name || 'New CTF',
        organizer: json.organizer || 'Unknown',
        date: json.date ? new Date(json.date) : new Date(),
        placement: json.placement ?? null,
        team: json.team ?? null,
        writeupUrl: json.writeupUrl ?? null,
        categories: Array.isArray(json.categories) ? json.categories : [],
        points: typeof json.points === 'number' ? json.points : null,
      },
    });
    return NextResponse.json(created);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


