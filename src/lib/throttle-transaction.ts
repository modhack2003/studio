import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const MAX_ATTEMPTS = 8;

/** Serialize each throttle's check and write across all app instances.
 * MongoDB snapshot transactions alone allow two count-then-insert operations
 * to both succeed. Updating a shared document first forces a write conflict;
 * the losing transaction retries with a fresh snapshot. Never fail open.
 * Callbacks must only perform transactional database work (no external effects).
 */
export async function throttleTransaction<T>(
  scope: 'admin-login' | 'contact' | 'engagement',
  work: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      // Bootstrap outside the transaction so its collection already exists.
      await prisma.throttleGuard.upsert({
        where: { id: scope }, create: { id: scope }, update: {},
      });
      return await prisma.$transaction(async (tx) => {
        await tx.throttleGuard.update({
          where: { id: scope }, data: { version: { increment: 1 } },
        });
        return work(tx);
      });
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2034' || error.code === 'P2002');
      if (!retryable || attempt >= MAX_ATTEMPTS - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.min(10 * 2 ** attempt, 250) + Math.random() * 20));
    }
  }
}
