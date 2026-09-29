import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { OBJECT_ID, handleError, jsonError, readJson, revalidatePublic } from '@/lib/api';
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
    const repository = await prisma.gitHubRepository.update({ where: { id }, data });
    revalidatePublic();
    return NextResponse.json({ success: true, repository });
  } catch (error) {
    return handleError(error, 'Repository');
  }
}

/** DELETE — removes the repo from the database (it comes back, hidden, on the next sync only if still on GitHub). */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return jsonError('Invalid repository id', 400);
  try {
    await prisma.gitHubRepository.delete({ where: { id } });
    revalidatePublic();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, 'Repository');
  }
}
