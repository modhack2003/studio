
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const skills = await prisma.skill.findFirst();
    return NextResponse.json(skills);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const existingSkills = await prisma.skill.findFirst();

    const { id, ...dataToUpdate } = json; // Omit 'id' from the data

    let updatedSkills;
    if (existingSkills) {
      updatedSkills = await prisma.skill.update({
        where: { id: existingSkills.id },
        data: dataToUpdate, // Use dataToUpdate
      });
    } else {
      updatedSkills = await prisma.skill.create({
        data: dataToUpdate, // Use dataToUpdate
      });
    }

    return NextResponse.json(updatedSkills);
  } catch (error) {
    console.error("Error updating skills data:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
