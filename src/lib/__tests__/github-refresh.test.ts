/** @jest-environment node */
import { Prisma, type PrismaClient } from '@prisma/client';
import { refreshGitHub } from '../github-refresh';
import { syncGitHub } from '../github-sync';
jest.mock('../github-sync', () => ({ syncGitHub: jest.fn() }));
const upsert = jest.fn();
const updateMany = jest.fn();
const db = { gitHubSyncState: { upsert, updateMany } } as unknown as PrismaClient;
beforeEach(() => jest.resetAllMocks());
test('skips fresh or already-running automatic sync without fetching GitHub', async () => {
  updateMany.mockResolvedValue({ count: 0 });
  expect(await refreshGitHub(db, { username: 'owner', automatic: true })).toEqual({ skipped: true, data: null });
  expect(syncGitHub).not.toHaveBeenCalled();
  const where = updateMany.mock.calls[0][0].where;
  expect(where.AND).toHaveLength(3);
});
test('records success and releases only its own lease', async () => {
  updateMany.mockResolvedValue({ count: 1 });
  jest.mocked(syncGitHub).mockResolvedValue({ errors: [] } as never);
  await refreshGitHub(db, { username: 'owner', automatic: true });
  expect(syncGitHub).toHaveBeenCalledWith(db, { username: 'owner', withProfile: false });
  expect(updateMany.mock.calls[1][0].data).toMatchObject({ username: 'owner', lastSuccess: expect.any(Date), lastError: null });
  expect(updateMany.mock.calls[2][0]).toMatchObject({ where: { lockToken: updateMany.mock.calls[0][0].data.lockToken }, data: { lockedUntil: null, lockToken: null } });
});
test('releases failed syncs and does not record a successful refresh', async () => {
  updateMany.mockResolvedValue({ count: 1 });
  jest.mocked(syncGitHub).mockRejectedValue(new Error('offline'));
  await expect(refreshGitHub(db, { username: 'owner' })).rejects.toThrow('offline');
  expect(updateMany.mock.calls[1][0].data.lastSuccess).toBeUndefined();
  expect(updateMany.mock.calls[2][0].data.lockToken).toBeNull();
});
test('handles two instances bootstrapping the same singleton', async () => {
  upsert.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '6' }));
  updateMany.mockResolvedValue({ count: 0 });
  await expect(refreshGitHub(db, { username: 'owner' })).resolves.toMatchObject({ skipped: true });
});
