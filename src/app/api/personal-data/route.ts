
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const personalData = await prisma.personalData.findFirst();
    return NextResponse.json(personalData);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const json = await request.json();
    const existingPersonalData = await prisma.personalData.findFirst();

    const { id: _id, ...dataToUpdate } = json; // Destructure to omit 'id'

    // Sanitize string fields
    const allowedFields = ['name', 'title', 'bio', 'github', 'linkedin', 'email', 'resumeUrl'];
    const sanitized: Record<string, string> = {};
    for (const field of allowedFields) {
      if (field in dataToUpdate && typeof dataToUpdate[field] === 'string') {
        sanitized[field] = dataToUpdate[field].trim();
      }
    }

    let updatedPersonalData;
    if (existingPersonalData) {
      updatedPersonalData = await prisma.personalData.update({
        where: { id: existingPersonalData.id },
        data: sanitized,
      });
    } else {
      updatedPersonalData = await prisma.personalData.create({
        data: sanitized as { name: string; title: string; bio: string; github: string; linkedin: string; email: string; resumeUrl: string },
      });
    }

    return NextResponse.json(updatedPersonalData);
  } catch (error) {
    console.error("Error updating personal data:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
