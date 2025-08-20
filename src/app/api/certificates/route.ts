
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany();
    return NextResponse.json(certificates);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const newCertificate = await prisma.certificate.create({
      data: json,
    });
    return NextResponse.json(newCertificate);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
