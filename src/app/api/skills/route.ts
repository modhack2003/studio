import { NextRequest, NextResponse } from 'next/server';
import { organizeSkills } from '@/lib/skill-groups';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { handleError, jsonError, readJson, revalidatePublic } from '@/lib/api';
import { skillsSchema, zodMessage } from '@/lib/validators';

export async function GET() {
  try {
    const skills = await prisma.skill.findFirst();
    return NextResponse.json(skills);
  } catch (error) {
    return handleError(error, 'Skills');
  }
}

/** Creates the skills record if none exists yet, otherwise updates it. */
export async function PUT(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  const parsed = skillsSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return jsonError(zodMessage(parsed.error), 400);

  try {
    const data = organizeSkills(parsed.data);
    const existing = await prisma.skill.findFirst({ select: { id: true } });
    const saved = existing
      ? await prisma.skill.update({ where: { id: existing.id }, data })
      : await prisma.skill.create({ data });
    revalidatePublic();
    return NextResponse.json(saved);
  } catch (error) {
    return handleError(error, 'Skills');
  }
}
