import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SHADOW_TRACKS } from '@/lib/shadow-challenges';

const solutions = {
  cipher: ['shadow', 'crow', 'genjutsu', 'cipher', 'escape'],
  archive: ['vault', 'archive', 'echo'],
  signal: ['root', 'spectre', 'trail'],
} as const;
const flags = { cipher: 'BIKRAM{the_shadow_was_a_decoy}', archive: 'BIKRAM{no_secrets_in_the_archive}', signal: 'BIKRAM{root_of_an_illusion}' };
const schema = z.object({
  track: z.enum(['cipher', 'archive', 'signal']).default('cipher'),
  level: z.number().int().min(1),
  answer: z.string().trim().min(1).max(128),
});
// Best-effort per-instance abuse control, not an authentication boundary.
const attempts = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 60000;
const MAX_KEYS = 2048;

export async function POST(request: NextRequest) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
  const ip = (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown').slice(0, 100);
  const entry = attempts.get(ip);
  if ((entry && entry.count >= 20) || (!entry && attempts.size >= MAX_KEYS)) {
    return NextResponse.json({ error: 'Too many attempts. Wait one minute and retry.' }, { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } });
  }
  attempts.set(ip, { count: (entry?.count || 0) + 1, until: entry?.until || now + WINDOW_MS });
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 2048) return NextResponse.json({ error: 'Answer payload too large.' }, { status: 413 });
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) return NextResponse.json({ error: 'Provide a valid track, integer level and answer (up to 128 characters).' }, { status: 400 });
    const { track, level, answer } = parsed.data;
    if (level > SHADOW_TRACKS[track].puzzles.length) return NextResponse.json({ error: 'Invalid level.' }, { status: 400 });
    const correct = answer.toLowerCase() === solutions[track][level - 1];
    const isLastLevel = level === solutions[track].length;
    // No sessions, credentials, redirects or database writes: these are game flags only.
    return NextResponse.json({ correct, isLastLevel, ...(correct && isLastLevel ? { flag: flags[track] } : {}) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Malformed challenge request.' }, { status: 400 });
  }
}
