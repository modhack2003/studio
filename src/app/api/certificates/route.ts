
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany();
    return NextResponse.json(certificates);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const json = await request.json();

    // Input validation
    const name = typeof json.name === 'string' ? json.name.trim() : '';
    const issuer = typeof json.issuer === 'string' ? json.issuer.trim() : '';
    const year = typeof json.year === 'number' ? json.year : new Date().getFullYear();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newCertificate = await prisma.certificate.create({
      data: { name, issuer, year },
    });
    return NextResponse.json(newCertificate);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
