
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const newProject = await prisma.project.create({
      data: json,
    });
    return NextResponse.json(newProject);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
