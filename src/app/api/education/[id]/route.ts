import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const education = await prisma.education.findUnique({
      where: { id: id },
    });
    if (!education) {
      return new NextResponse('Education not found', { status: 404 });
    }
    return NextResponse.json(education);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const json = await request.json();
    const { id: _omittedId, ...dataToUpdate } = json;

    const updatedEducation = await prisma.education.update({
      where: { id: id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedEducation);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.education.delete({
      where: { id: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}