// Uses the disposable CI database only; never production DATABASE_URL.
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { syncInsights } from '../src/lib/security-insights';
const url = process.env.INSIGHTS_TEST_DATABASE_URL;
if (!url || !/^mongodb:\/\/127\.0\.0\.1:27017\/studio_insights_test\?replicaSet=rs0$/.test(url)) throw new Error('Disposable insights database URL required');
const db = new PrismaClient({ datasourceUrl: url });
const originalFetch = global.fetch;
async function main() {
  await db.blogPost.deleteMany(); await db.insightImport.deleteMany(); await db.insightSyncState.deleteMany();
  const date = new Date().toISOString().slice(0, 10);
  const entries = Array.from({ length: 20 }, (_, i) => ({ cveID: `CVE-2026-${90000 + i}`, vendorProject: 'Test', product: 'Product', dateAdded: date, shortDescription: 'Test only.', requiredAction: 'Test vendor update.', dueDate: date, knownRansomwareCampaignUse: 'Unknown' }));
  global.fetch = async () => new Response(JSON.stringify({ vulnerabilities: entries }));
  const first = await Promise.all([syncInsights(db, { automatic: true }), syncInsights(db, { automatic: true })]);
  assert.equal(first.filter(r => r.skipped).length, 1, 'shared Mongo lease must skip one overlapping request');
  assert.equal(await db.blogPost.count(), 8);
  assert.equal(await db.blogPost.count({ where: { published: true } }), 0);
  const edited = await db.blogPost.findFirstOrThrow();
  await db.blogPost.update({ where: { id: edited.id }, data: { title: 'Manual edit' } });
  assert.equal((await syncInsights(db)).created, 3);
  assert.equal((await syncInsights(db)).created, 0, 'daily cap persists across invocations');
  assert.equal((await db.blogPost.findUniqueOrThrow({ where: { id: edited.id } })).title, 'Manual edit');
  await db.blogPost.delete({ where: { id: edited.id } });
  await syncInsights(db, { backfill: true });
  assert.equal(await db.blogPost.findUnique({ where: { slug: edited.slug } }), null, 'deleted imports must stay deleted');
  await db.insightSyncState.update({ where: { id: 'security-insights' }, data: { enabled: false } });
  assert.equal((await syncInsights(db, { automatic: true })).skipped, true);
  console.log('Security Insights Mongo integration passed: lease, backfill, daily cap, edits, deletion and pause.');
}
main().finally(async () => { global.fetch = originalFetch; await db.$disconnect(); }).catch(error => { console.error(error); process.exitCode = 1; });
