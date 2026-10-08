/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { requireAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { put, del } from '@vercel/blob';
import { revalidatePublic } from '@/lib/api';

jest.mock('@/lib/admin-auth', () => ({ requireAdminSession: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { personalData: { findFirst: jest.fn(), update: jest.fn() } } }));
jest.mock('@vercel/blob', () => ({ put: jest.fn(), del: jest.fn() }));
jest.mock('@/lib/api', () => ({
  revalidatePublic: jest.fn(),
  jsonError: (error: string, status: number) => Response.json({ error }, { status }),
  handleError: () => Response.json({ error: 'Failed' }, { status: 500 }),
}));
const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
afterAll(() => {
  if (originalToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = originalToken;
});
beforeEach(() => {
  jest.resetAllMocks();
  process.env.BLOB_READ_WRITE_TOKEN = 'test-only';
  jest.mocked(requireAdminSession).mockResolvedValue(null);
  jest.mocked(prisma.personalData.findFirst).mockResolvedValue({ id: 'profile' } as never);
  jest.mocked(put).mockResolvedValue({ url: 'https://example.public.blob.vercel-storage.com/profile/new.png' } as never);
  jest.mocked(del).mockResolvedValue(undefined);
});
function request(bytes: Uint8Array = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])) {
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(bytes)], { type: 'image/png' }), 'photo.png');
  return new NextRequest('http://localhost/api/profile/photo', { method: 'POST', body: form });
}
test('unauthenticated uploads never reach storage', async () => {
  jest.mocked(requireAdminSession).mockResolvedValue(Response.json({}, { status: 401 }) as never);
  expect((await POST(request())).status).toBe(401);
  expect(put).not.toHaveBeenCalled();
});
test('rejects unsupported and oversized files before storage writes', async () => {
  expect((await POST(request(new TextEncoder().encode('<svg>not a PNG</svg>')))).status).toBe(400);
  expect((await POST(request(new Uint8Array(4 * 1024 * 1024 + 1)))).status).toBe(413);
  expect(put).not.toHaveBeenCalled();
});
test('saves uploaded URL and revalidates public pages', async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ avatarUrl: 'https://example.public.blob.vercel-storage.com/profile/new.png' });
  expect(prisma.personalData.update).toHaveBeenCalledWith({ where: { id: 'profile' }, data: { avatarUrl: 'https://example.public.blob.vercel-storage.com/profile/new.png' } });
  expect(revalidatePublic).toHaveBeenCalledTimes(1);
});
test('cleans up only a new blob if saving the profile fails', async () => {
  jest.mocked(prisma.personalData.update).mockRejectedValue(new Error('database failure'));
  expect((await POST(request())).status).toBe(500);
  expect(del).toHaveBeenCalledWith('https://example.public.blob.vercel-storage.com/profile/new.png');
  expect(revalidatePublic).not.toHaveBeenCalled();
});
test('missing storage configuration gives an actionable error', async () => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  expect((await POST(request())).status).toBe(501);
  expect(put).not.toHaveBeenCalled();
});
