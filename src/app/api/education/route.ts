
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const education = await prisma.education.findMany();
    return NextResponse.json(education);
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
    const institution = typeof json.institution === 'string' ? json.institution.trim() : '';
    const degree = typeof json.degree === 'string' ? json.degree.trim() : '';
    const duration = typeof json.duration === 'string' ? json.duration.trim() : '';

    if (!institution) {
      return NextResponse.json({ error: 'Institution is required' }, { status: 400 });
    }

    const newEducation = await prisma.education.create({
      data: { institution, degree, duration },
    });
    return NextResponse.json(newEducation);
  } catch (_error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
