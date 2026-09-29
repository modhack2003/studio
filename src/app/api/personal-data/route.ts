import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { handleError, jsonError, readJson, revalidatePublic } from '@/lib/api';
import { personalDataSchema, zodMessage } from '@/lib/validators';

export async function GET() {
  try {
    const personalData = await prisma.personalData.findFirst();
    return NextResponse.json(personalData);
  } catch (error) {
    return handleError(error, 'Profile');
  }
}

/** Creates the profile if none exists yet, otherwise updates it. */
export async function PUT(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  const parsed = personalDataSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return jsonError(zodMessage(parsed.error), 400);

  try {
    const existing = await prisma.personalData.findFirst({ select: { id: true } });
    const saved = existing
      ? await prisma.personalData.update({ where: { id: existing.id }, data: parsed.data })
      : await prisma.personalData.create({ data: parsed.data });
    revalidatePublic();
    return NextResponse.json(saved);
  } catch (error) {
    return handleError(error, 'Profile');
  }
}
