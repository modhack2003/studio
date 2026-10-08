import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { handleError, jsonError, revalidatePublic } from '@/lib/api';
import { MAX_PHOTO_BYTES, photoFormat } from '@/lib/profile-photo';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return jsonError('Photo storage is not configured. Connect Vercel Blob or paste a public image URL in Profile.', 501);
  }
  try {
    const personal = await prisma.personalData.findFirst({ select: { id: true } });
    if (!personal) return jsonError('Save your profile first, then upload a photo.', 400);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !file.size) return jsonError('Choose a photo to upload.', 400);
    if (file.size > MAX_PHOTO_BYTES) return jsonError('Photo too large (max 4 MB).', 413);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = photoFormat(bytes);
    if (!format) return jsonError('Only JPG, PNG and WebP photos are allowed.', 400);
    const blob = await put(`profile/photo-${Date.now()}.${format.extension}`, new Blob([bytes], { type: format.contentType }), {
      access: 'public',
      contentType: format.contentType,
      addRandomSuffix: true,
    });
    try {
      await prisma.personalData.update({ where: { id: personal.id }, data: { avatarUrl: blob.url } });
    } catch (error) {
      // Remove only this failed upload; never delete previously saved photos.
      await del(blob.url).catch(() => undefined);
      throw error;
    }
    revalidatePublic();
    return NextResponse.json({ avatarUrl: blob.url });
  } catch (error) {
    return handleError(error, 'Profile photo');
  }
}
