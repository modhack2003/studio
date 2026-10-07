/** Run against a disposable local MongoDB replica set:
 * THROTTLE_TEST_DATABASE_URL='mongodb://127.0.0.1:27017/studio_throttle_test?replicaSet=rs0' npx tsx scripts/test-throttles.ts
 * This script clears only its dedicated test database collections.
 */
import assert from 'node:assert/strict';

async function main() {
  const uri = process.env.THROTTLE_TEST_DATABASE_URL;
  assert(uri, 'Set THROTTLE_TEST_DATABASE_URL to a disposable local replica set.');
  const target = new URL(uri);
  assert(['localhost', '127.0.0.1'].includes(target.hostname) && target.pathname === '/studio_throttle_test',
    'Refusing to run outside the dedicated local studio_throttle_test database.');
  process.env.DATABASE_URL = uri;
  process.env.ADMIN_PIN = '835194';
  const { prisma } = await import('../src/lib/prisma');
  const { checkAdminPin } = await import('../src/lib/admin-auth');
  const { throttleTransaction } = await import('../src/lib/throttle-transaction');
  const { POST: contact } = await import('../src/app/api/contact/route');
  const { NextRequest } = await import('next/server');

  const clear = async () => {
    await prisma.loginAttempt.deleteMany();
    await prisma.contactMessage.deleteMany();
    await prisma.adminCredential.deleteMany();
    await prisma.throttleGuard.deleteMany();
  };
  const failures = async (count: number, sameIp: boolean) => {
    await prisma.loginAttempt.createMany({ data: Array.from({ length: count }, (_, i) => ({
      ip: sameIp ? 'test-ip' : `seed-${i}`, success: false,
    })) });
  };
  const sendContact = (ip: string) => contact(new NextRequest('http://localhost/api/contact', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': ip },
    body: JSON.stringify({ name: 'Test User', email: 'test@example.com', subject: 'Testing', message: 'A concurrency regression test message.' }),
  }));
  try {
    await clear();
    await failures(4, true);
    const perIp = await Promise.allSettled(Array.from({ length: 12 }, () => checkAdminPin('wrong', 'test-ip', null)));
    assert.equal(await prisma.loginAttempt.count(), 5, 'concurrent guesses must stop at five failures');
    assert.equal(perIp.filter((r) => r.status === 'fulfilled' && r.value.ok === false).length, 1);
    assert.equal((await checkAdminPin('835194', 'test-ip', null)).ok, null, 'correct PIN must also respect lockout');

    await clear();
    await failures(39, false);
    await Promise.allSettled(Array.from({ length: 12 }, (_, i) => checkAdminPin('wrong', `parallel-${i}`, null)));
    assert.equal(await prisma.loginAttempt.count(), 40, 'global limit must hold across different IPs');

    await clear();
    await failures(4, true);
    assert.equal((await checkAdminPin('835194', 'test-ip', null)).ok, true);
    assert.equal((await checkAdminPin('wrong', 'test-ip', null)).throttle.remaining, 5, 'successful login resets per-IP failures');
    await prisma.loginAttempt.updateMany({ data: { createdAt: new Date(Date.now() - 31 * 60 * 1000) } });
    assert.equal((await checkAdminPin('wrong', 'test-ip', null)).throttle.remaining, 5, 'old attempts expire');

    await clear();
    const responses = await Promise.all(Array.from({ length: 12 }, () => sendContact('test-ip')));
    assert.equal(responses.filter((r) => r.status === 201).length, 5, 'only five same-IP contacts accepted');
    assert.equal(await prisma.contactMessage.count(), 5);
    assert(responses.every((r) => [201, 429, 503].includes(r.status)));

    await clear();
    await prisma.contactMessage.createMany({ data: Array.from({ length: 59 }, (_, i) => ({
      name: 'Test User', email: 'test@example.com', subject: 'Testing', message: 'seed', ipHash: `seed-${i}`,
    })) });
    const globalResponses = await Promise.all(Array.from({ length: 12 }, (_, i) => sendContact(`parallel-${i}`)));
    assert.equal(globalResponses.filter((r) => r.status === 201).length, 1, 'only one global contact slot remains');
    assert.equal(await prisma.contactMessage.count(), 60);

    await assert.rejects(throttleTransaction('contact', async (tx) => {
      await tx.contactMessage.deleteMany();
      throw new Error('rollback test');
    }), /rollback test/);
    assert.equal(await prisma.contactMessage.count(), 60, 'failed transactions must roll back');
    console.log('PASS: concurrent per-IP/global login and contact limits, lockout, success reset, expiry, rollback.');
  } finally {
    await clear();
    await prisma.$disconnect();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
