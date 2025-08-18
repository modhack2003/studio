import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const education = await prisma.education.findUnique({
      where: { id: id },
    });
    if (!education) {
      return new NextResponse('Education not found', { status: 404 });
    }
    return NextResponse.json(education);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const json = await request.json();
    const { id: omittedId, ...dataToUpdate } = json;

    const updatedEducation = await prisma.education.update({
      where: { id: id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedEducation);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.education.delete({
      where: { id: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}