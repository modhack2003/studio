import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const json = await request.json();
    const { id: _omittedId, ...dataToUpdate } = json; // Omit 'id' from the data

    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedProject);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.project.delete({
      where: { id: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
