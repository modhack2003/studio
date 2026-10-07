import { NextRequest, NextResponse } from 'next/server';
import { throttleTransaction } from '@/lib/throttle-transaction';
import { getClientIp, hashIp } from '@/lib/auth';
import { jsonError, readJson } from '@/lib/api';
import { contactSchema, zodMessage } from '@/lib/validators';

export const dynamic = 'force-dynamic';

const PER_IP_PER_HOUR = 5;
const GLOBAL_PER_HOUR = 60;

/** Public contact form → stored in the admin inbox. */
export async function POST(request: NextRequest) {
  const parsed = contactSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return jsonError(zodMessage(parsed.error), 400);

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (parsed.data.website) return NextResponse.json({ success: true });

  try {
    const ipHash = hashIp(getClientIp(request.headers));
    const accepted = await throttleTransaction('contact', async (tx) => {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [mine, all] = await Promise.all([
        tx.contactMessage.count({ where: { ipHash, createdAt: { gt: hourAgo } } }),
        tx.contactMessage.count({ where: { createdAt: { gt: hourAgo } } }),
      ]);
      if (mine >= PER_IP_PER_HOUR || all >= GLOBAL_PER_HOUR) return false;

      const { name, email, subject, message } = parsed.data;
      await tx.contactMessage.create({ data: { name, email, subject, message, ipHash } });
      return true;
    });
    if (!accepted) {
      return jsonError('Too many messages — please try again later or email me directly.', 429);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Contact form failed:', error);
    return jsonError('Could not send your message right now. Please email me directly.', 503);
  }
}
