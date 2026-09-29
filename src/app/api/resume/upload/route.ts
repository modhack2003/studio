import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { handleError, jsonError, revalidatePublic } from '@/lib/api';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return jsonError(
      'Resume upload needs BLOB_READ_WRITE_TOKEN (Vercel > Storage > Blob). You can also paste a resume link in the Profile tab.',
      501
    );
  }

  try {
    const personal = await prisma.personalData.findFirst({ select: { id: true } });
    if (!personal) return jsonError('Save your profile first, then upload the resume.', 400);

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return jsonError('No file uploaded.', 400);
    if (file.size > MAX_BYTES) return jsonError('File too large (max 4 MB).', 413);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPdf = bytes.length > 4 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
    if (!isPdf) return jsonError('Only PDF files are allowed.', 400);

    const blob = await put(`resume/resume-${Date.now()}.pdf`, new Blob([bytes], { type: 'application/pdf' }), {
      access: 'public',
      contentType: 'application/pdf',
    });

    await prisma.personalData.update({ where: { id: personal.id }, data: { resumeUrl: blob.url } });
    revalidatePublic();
    return NextResponse.json({ resumeUrl: blob.url });
  } catch (error) {
    return handleError(error, 'Resume');
  }
}
