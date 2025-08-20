
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const personalData = await prisma.personalData.findFirst();
    return NextResponse.json(personalData);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const existingPersonalData = await prisma.personalData.findFirst();

    const { id: _id, ...dataToUpdate } = json; // Destructure to omit 'id'

    let updatedPersonalData;
    if (existingPersonalData) {
      updatedPersonalData = await prisma.personalData.update({
        where: { id: existingPersonalData.id },
        data: dataToUpdate, // Use dataToUpdate
      });
    } else {
      updatedPersonalData = await prisma.personalData.create({
        data: dataToUpdate, // Use dataToUpdate
      });
    }

    return NextResponse.json(updatedPersonalData);
  } catch (_error) {
    console.error("Error updating personal data:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
