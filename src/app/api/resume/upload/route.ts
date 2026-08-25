
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type — only allow PDFs
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size — max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Generate a unique file name to prevent collisions
    const filename = `resume-${Date.now()}.pdf`;

    // Upload file to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    const resumeUrl = blob.url;

    await prisma.personalData.updateMany({
      data: {
        resumeUrl,
      },
    });

    return NextResponse.json({ resumeUrl });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
