import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { handleError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { id: true, name: true, email: true, subject: true, message: true, read: true, createdAt: true },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return handleError(error, 'Messages');
  }
}
