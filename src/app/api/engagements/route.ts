import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { throttleTransaction } from '@/lib/throttle-transaction';
import { requireAdminSession } from '@/lib/admin-auth';
import { getClientIp, hashIp } from '@/lib/auth';
import { handleError, jsonError, readJson } from '@/lib/api';
import { engagementRef } from '@/lib/engagements';
import { engagementSchema, zodMessage } from '@/lib/validators';

export const dynamic = 'force-dynamic';

const PER_IP_PER_HOUR = 4;
const GLOBAL_PER_HOUR = 40;

/**
 * Public: a VAPT request (kind "vapt") or a bug bounty program invite (kind "bounty").
 * Stored for the admin "Requests" tab; rate-limited per IP with a honeypot field.
 */
export async function POST(request: NextRequest) {
  const parsed = engagementSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return jsonError(zodMessage(parsed.error, { withPath: false }), 400);

  const { hp, ...data } = parsed.data;
  // Honeypot: bots fill the hidden field. Pretend it worked.
  if (hp) {
    return NextResponse.json({ success: true, ref: engagementRef(data.kind, randomBytes(12).toString('hex')) }, { status: 201 });
  }

  try {
    const ipHash = hashIp(getClientIp(request.headers));
    const created = await throttleTransaction('engagement', async (tx) => {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [mine, all] = await Promise.all([
        tx.engagement.count({ where: { ipHash, createdAt: { gt: hourAgo } } }),
        tx.engagement.count({ where: { createdAt: { gt: hourAgo } } }),
      ]);
      if (mine >= PER_IP_PER_HOUR || all >= GLOBAL_PER_HOUR) return null;

      return tx.engagement.create({
        data:
          data.kind === 'vapt'
            ? {
                kind: 'vapt',
                name: data.name,
                email: data.email,
                company: data.company,
                message: data.message,
                services: data.services,
                target: data.target,
                timeline: data.timeline,
                budget: data.budget,
                nda: data.nda,
                authorized: data.authorized,
                ipHash,
              }
            : {
                kind: 'bounty',
                name: data.name,
                email: data.email,
                company: data.company,
                message: data.message,
                services: [],
                programUrl: data.programUrl,
                platform: data.platform,
                programType: data.programType,
                rewards: data.rewards,
                ipHash,
              },
        select: { id: true, kind: true },
      });
    });
    if (!created) {
      return jsonError('Too many requests right now — please try again later or email me directly.', 429);
    }
    return NextResponse.json({ success: true, ref: engagementRef(created.kind, created.id) }, { status: 201 });
  } catch (error) {
    console.error('Engagement request failed:', error);
    return jsonError('Could not send your request right now. Please email me directly.', 503);
  }
}

/** Admin: every request, newest first. ?kind=vapt|bounty */
export async function GET(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;
  const kind = request.nextUrl.searchParams.get('kind');
  try {
    const items = await prisma.engagement.findMany({
      where: kind === 'vapt' || kind === 'bounty' ? { kind } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 300,
      omit: { ipHash: true },
    });
    return NextResponse.json(items);
  } catch (error) {
    return handleError(error, 'Requests');
  }
}
