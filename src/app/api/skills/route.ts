
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const skills = await prisma.skill.findFirst();
    return NextResponse.json(skills);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const json = await request.json();
    const existingSkills = await prisma.skill.findFirst();

    const { id: _id, ...dataToUpdate } = json; // Omit 'id' from the data

    // Validate arrays
    if (dataToUpdate.languages && !Array.isArray(dataToUpdate.languages)) {
      return NextResponse.json({ error: 'Languages must be an array' }, { status: 400 });
    }
    if (dataToUpdate.tools && !Array.isArray(dataToUpdate.tools)) {
      return NextResponse.json({ error: 'Tools must be an array' }, { status: 400 });
    }
    if (dataToUpdate.areas && !Array.isArray(dataToUpdate.areas)) {
      return NextResponse.json({ error: 'Areas must be an array' }, { status: 400 });
    }

    let updatedSkills;
    if (existingSkills) {
      updatedSkills = await prisma.skill.update({
        where: { id: existingSkills.id },
        data: dataToUpdate,
      });
    } else {
      updatedSkills = await prisma.skill.create({
        data: dataToUpdate,
      });
    }

    return NextResponse.json(updatedSkills);
  } catch (_error) {
    console.error("Error updating skills data:", _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
