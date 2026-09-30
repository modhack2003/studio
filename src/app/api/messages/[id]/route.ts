import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { OBJECT_ID, handleError, jsonError, notFound, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ id: string }> };

/** PATCH { read: boolean } */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return jsonError('Invalid message id', 400);
  const body = (await readJson(request)) as { read?: unknown } | undefined;
  if (typeof body?.read !== 'boolean') return jsonError('"read" must be true or false', 400);
  try {
    if (!(await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } }))) return notFound('Message');
    const message = await prisma.contactMessage.update({ where: { id }, data: { read: body.read } });
    return NextResponse.json(message);
  } catch (error) {
    return handleError(error, 'Message');
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return jsonError('Invalid message id', 400);
  try {
    const { count } = await prisma.contactMessage.deleteMany({ where: { id } });
    if (count === 0) return notFound('Message');
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, 'Message');
  }
}
