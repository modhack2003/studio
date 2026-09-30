import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { OBJECT_ID, handleError, jsonError, notFound, readJson } from '@/lib/api';
import { engagementUpdateSchema, zodMessage } from '@/lib/validators';

type Ctx = { params: Promise<{ id: string }> };

/** PATCH { status?, notes? } */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return jsonError('Invalid request id', 400);

  const parsed = engagementUpdateSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return jsonError(zodMessage(parsed.error), 400);
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  if (Object.keys(data).length === 0) return jsonError('Nothing to update', 400);

  try {
    if (!(await prisma.engagement.findUnique({ where: { id }, select: { id: true } }))) return notFound('Request');
    const item = await prisma.engagement.update({ where: { id }, data, omit: { ipHash: true } });
    return NextResponse.json(item);
  } catch (error) {
    return handleError(error, 'Request');
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return jsonError('Invalid request id', 400);
  try {
    const { count } = await prisma.engagement.deleteMany({ where: { id } });
    if (count === 0) return notFound('Request');
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, 'Request');
  }
}
