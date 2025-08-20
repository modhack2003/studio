
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const education = await prisma.education.findMany();
    return NextResponse.json(education);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const newEducation = await prisma.education.create({
      data: json,
    });
    return NextResponse.json(newEducation);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
