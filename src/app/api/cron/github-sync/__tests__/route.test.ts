/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { refreshGitHub } from '@/lib/github-refresh';
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/lib/github-sync', () => ({ resolveGitHubUsername: jest.fn().mockResolvedValue('owner') }));
jest.mock('@/lib/github-refresh', () => ({ refreshGitHub: jest.fn() }));
jest.mock('@/lib/api', () => ({ revalidatePublic: jest.fn(), jsonError: (error: string, status: number) => Response.json({ error }, { status }) }));
const originalSecret = process.env.CRON_SECRET;
afterAll(() => { if (originalSecret === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = originalSecret; });
beforeEach(() => jest.clearAllMocks());
const request = (authorization?: string) => new NextRequest('http://localhost/api/cron/github-sync', { headers: authorization ? { authorization } : {} });
test('fails closed for missing or incorrect cron credentials', async () => {
  delete process.env.CRON_SECRET;
  expect((await GET(request('Bearer undefined'))).status).toBe(401);
  process.env.CRON_SECRET = 'test-secret';
  expect((await GET(request())).status).toBe(401);
  expect((await GET(request('Bearer wrong'))).status).toBe(401);
  expect(refreshGitHub).not.toHaveBeenCalled();
});
test('valid cron refreshes public repos without overwriting profile data', async () => {
  process.env.CRON_SECRET = 'test-secret';
  jest.mocked(refreshGitHub).mockResolvedValue({ skipped: false, data: { errors: [] } } as never);
  expect((await GET(request('Bearer test-secret'))).status).toBe(200);
  expect(refreshGitHub).toHaveBeenCalledWith({}, { username: 'owner', automatic: true, withProfile: false });
});
