/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { SHADOW_TRACKS } from '@/lib/shadow-challenges';

let client = 0;
const request = (body: unknown, ip = `test-${++client}`) => new NextRequest('https://example.com/api/ctf/verify', { method: 'POST', headers: { 'x-forwarded-for': ip }, body: JSON.stringify(body) });
const rot = (text: string, shift: number) => text.replace(/[a-z]/g, (c) => String.fromCharCode((c.charCodeAt(0) - 97 + shift + 26) % 26 + 97));

test('every displayed cipher is solvable and completion never issues admin access', async () => {
  const cipher = SHADOW_TRACKS.cipher.puzzles;
  const archive = SHADOW_TRACKS.archive.puzzles;
  const signal = SHADOW_TRACKS.signal.puzzles;
  const decoded = {
    cipher: [rot(cipher[0].cipher, 13), Buffer.from(cipher[1].cipher, 'base64').toString(), Buffer.from(cipher[2].cipher, 'hex').toString(), rot(cipher[3].cipher, -3), cipher[4].cipher.split(' ').map((b) => String.fromCharCode(parseInt(b, 2))).join('')],
    archive: [decodeURIComponent(archive[0].cipher), archive[1].cipher.split('').reverse().join(''), Buffer.from(Buffer.from(archive[2].cipher, 'base64').toString(), 'hex').toString()],
    signal: [signal[0].cipher.split(' ').map((c) => ({ '.-.': 'r', '---': 'o', '-': 't' })[c]).join(''), signal[1].cipher.split(' ').map((b) => String.fromCharCode(Number(b))).join(''), signal[2].cipher.replace(/[a-z]/g, (c) => String.fromCharCode(219 - c.charCodeAt(0)))],
  };
  for (const [track, answers] of Object.entries(decoded)) {
    for (const [index, answer] of answers.entries()) {
      const response = await POST(request({ track, level: index + 1, answer: ` ${answer.toUpperCase()} ` }));
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.correct).toBe(true);
      expect(result.isLastLevel).toBe(index === answers.length - 1);
      expect(Boolean(result.flag)).toBe(index === answers.length - 1);
      expect(response.headers.has('set-cookie')).toBe(false);
      expect(response.headers.has('location')).toBe(false);
      expect(result).not.toHaveProperty('redirect');
    }
  }
});

test('wrong answers disclose no flags and malformed levels are rejected', async () => {
  expect(await (await POST(request({ level: 5, answer: 'admin' }))).json()).toEqual({ correct: false, isLastLevel: true });
  for (const body of [null, {}, { level: 1.5, answer: 'shadow' }, { track: 'other', level: 1, answer: 'x' }, { level: 99, answer: 'x' }, { level: 1, answer: 'x'.repeat(129) }]) {
    expect((await POST(request(body))).status).toBe(400);
  }
  expect((await POST(request({ level: 1, answer: 'x'.repeat(3000) }))).status).toBe(413);
});

test('attempt limit returns retry instructions and expires', async () => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(2000000000000);
  try {
    for (let i = 0; i < 20; i++) expect((await POST(request({ level: 1, answer: 'x' }, 'limited'))).status).toBe(200);
    const blocked = await POST(request({ level: 1, answer: 'shadow' }, 'limited'));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBe('60');
    clock.mockReturnValue(2000000060001);
    expect((await POST(request({ level: 1, answer: 'shadow' }, 'limited'))).status).toBe(200);
  } finally { clock.mockRestore(); }
});
