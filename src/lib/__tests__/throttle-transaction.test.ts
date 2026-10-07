/** @jest-environment node */
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { throttleTransaction } from '@/lib/throttle-transaction';

jest.mock('@/lib/prisma', () => ({
  prisma: { throttleGuard: { upsert: jest.fn() }, $transaction: jest.fn() },
}));

const transaction = jest.mocked(prisma.$transaction);
const upsert = jest.mocked(prisma.throttleGuard.upsert);
const conflict = (code: string) => new Prisma.PrismaClientKnownRequestError('conflict', { code, clientVersion: '6' });

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

test('retries an aborted transaction with a fresh guard before calling the work again', async () => {
  const update = jest.fn().mockResolvedValue({});
  const tx = { throttleGuard: { update } } as unknown as Prisma.TransactionClient;
  const work = jest.fn().mockRejectedValueOnce(conflict('P2034')).mockResolvedValueOnce('accepted');
  transaction.mockImplementation(async (callback) => (callback as (db: Prisma.TransactionClient) => Promise<string>)(tx));
  const result = throttleTransaction('contact', work);
  await jest.runAllTimersAsync();
  await expect(result).resolves.toBe('accepted');
  expect(update).toHaveBeenCalledTimes(2);
  expect(work).toHaveBeenCalledTimes(2);
  expect(update.mock.invocationCallOrder[0]).toBeLessThan(work.mock.invocationCallOrder[0]);
  expect(update.mock.invocationCallOrder[1]).toBeLessThan(work.mock.invocationCallOrder[1]);
});

test('retries concurrent first-use guard creation', async () => {
  upsert.mockRejectedValueOnce(conflict('P2002'));
  transaction.mockResolvedValue('accepted');
  const result = throttleTransaction('admin-login', jest.fn());
  await jest.runAllTimersAsync();
  await expect(result).resolves.toBe('accepted');
  expect(upsert).toHaveBeenCalledTimes(2);
  expect(transaction).toHaveBeenCalledTimes(1);
});

test('fails closed after bounded conflict retries', async () => {
  transaction.mockRejectedValue(conflict('P2034'));
  const result = throttleTransaction('contact', jest.fn());
  const assertion = expect(result).rejects.toMatchObject({ code: 'P2034' });
  await jest.runAllTimersAsync();
  await assertion;
  expect(transaction).toHaveBeenCalledTimes(8);
});

test('propagates non-retryable database failures', async () => {
  const failure = new Error('database unavailable');
  transaction.mockRejectedValue(failure);
  await expect(throttleTransaction('contact', jest.fn())).rejects.toBe(failure);
  expect(transaction).toHaveBeenCalledTimes(1);
});
