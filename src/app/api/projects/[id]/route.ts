import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const json = await request.json();
    const { id: omittedId, ...dataToUpdate } = json; // Omit 'id' from the data

    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedProject);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.project.delete({
      where: { id: id }, // Use the destructured id
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}