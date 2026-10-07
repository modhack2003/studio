import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { OBJECT_ID, handleError, jsonError, notFound, readJson, revalidatePublic } from '@/lib/api';
import { repoSettingsSchema, zodMessage } from '@/lib/validators';

type Ctx = { params: Promise<{ id: string }> };

/** PUT — display settings: displayInPortfolio, customTitle, customDescription, customTags, displayOrder (pin). */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return jsonError('Invalid repository id', 400);

  const parsed = repoSettingsSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return jsonError(zodMessage(parsed.error), 400);

  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  try {
    if (!(await prisma.gitHubRepository.findUnique({ where: { id }, select: { id: true } }))) return notFound('Repository');
    const repository = await prisma.gitHubRepository.update({ where: { id }, data });
    revalidatePublic();
    return NextResponse.json({ success: true, repository });
  } catch (error) {
    return handleError(error, 'Repository');
  }
}

/** DELETE — removes the repo from the database (it comes back with default visibility on the next sync if still on GitHub). */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return jsonError('Invalid repository id', 400);
  try {
    const { count } = await prisma.gitHubRepository.deleteMany({ where: { id } });
    if (count === 0) return notFound('Repository');
    revalidatePublic();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, 'Repository');
  }
}
