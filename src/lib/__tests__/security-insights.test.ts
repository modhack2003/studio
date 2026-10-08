/** @jest-environment node */
import type { PrismaClient } from '@prisma/client';
import { fetchCatalog, makeInsight, selectEntries, syncInsights, type KevEntry } from '../security-insights';
const originalFetch = global.fetch;
const now = new Date('2026-10-08T07:00:00Z');
const entry = (i = 1, dateAdded = '2026-10-07'): KevEntry => ({ cveID: `CVE-2026-${10000 + i}`, vendorProject: 'Vendor', product: 'Product', dateAdded, shortDescription: 'A vulnerability exists.', requiredAction: 'Apply vendor mitigations.', dueDate: '2026-10-20', knownRansomwareCampaignUse: 'Unknown' });
const feed = (entries: KevEntry[]) => { global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ vulnerabilities: entries }))); };
function database({ backfilled = true, publish = false } = {}) {
  const posts = new Map<string, { slug: string; content: string; title: string; published: boolean }>();
  const imports = new Map<string, { id: string }>();
  const state = { id: 'security-insights', enabled: true, autoPublish: publish, backfilledAt: backfilled ? now : null };
  const db = {
    insightSyncState: { upsert: jest.fn().mockResolvedValue(state), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    insightImport: {
      count: jest.fn().mockResolvedValue(0), findMany: jest.fn(async () => [...imports.values()]),
      upsert: jest.fn(async ({ create }) => { imports.set(create.id, create); return create; }),
    },
    blogPost: {
      findMany: jest.fn(async () => [...posts.values()]),
      upsert: jest.fn(async ({ create }) => { if (!posts.has(create.slug)) posts.set(create.slug, create); return posts.get(create.slug); }),
    },
  };
  return { db, posts, imports, client: db as unknown as PrismaClient };
}
beforeEach(() => { jest.useFakeTimers().setSystemTime(now); });
afterEach(() => { global.fetch = originalFetch; jest.useRealTimers(); });
test('month filtering excludes old and future entries; backfill spans weeks', () => {
  const entries = [entry(1), entry(2, '2026-09-30'), entry(3, '2026-09-22'), entry(4, '2026-09-12'), entry(5, '2026-08-01'), entry(6, '2026-10-09')];
  expect(selectEntries(entries, now, true).map(e => e.cveID)).toEqual(entries.slice(0, 4).map(e => e.cveID));
});
test('feed validates entries and rejects unsafe or excessive input', async () => {
  feed([entry()]); expect(await fetchCatalog()).toHaveLength(1);
  feed([{ ...entry(), cveID: 'bad/path' }]); await expect(fetchCatalog()).rejects.toThrow();
  global.fetch = jest.fn().mockResolvedValue(new Response('{}', { headers: { 'content-length': '9000000' } }));
  await expect(fetchCatalog()).rejects.toThrow('Catalog too large');
});
test('template removes markup, retains dates and explains uncertainty', () => {
  const post = makeInsight({ ...entry(), product: '<script>[click](evil)' });
  expect(post.content).not.toContain('<script>');
  expect(post.content).toContain('2026-10-07');
  expect(post.content).toContain('unknown');
  expect(post.content).toContain('Automated security brief');
});
test('daily imports create at most three drafts and retries preserve edits', async () => {
  const { client, db, posts } = database(); feed(Array.from({ length: 6 }, (_, i) => entry(i)));
  expect((await syncInsights(client)).created).toBe(3);
  for (const post of posts.values()) expect(post.published).toBe(false);
  const edited = [...posts.values()][0]; edited.title = 'My edited title';
  db.insightImport.count.mockResolvedValue(3);
  expect((await syncInsights(client)).created).toBe(0);
  expect(posts.get(edited.slug)?.title).toBe('My edited title');
});
test('first run backfills eight drafts even with auto-publish enabled', async () => {
  const { client, posts, db } = database({ backfilled: false, publish: true });
  feed(Array.from({ length: 12 }, (_, i) => entry(i)));
  expect((await syncInsights(client, { automatic: true })).created).toBe(8);
  for (const post of posts.values()) expect(post.published).toBe(false);
  expect(db.insightSyncState.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ backfilledAt: now }) }));
});
test('opt-in publishes only new daily briefs', async () => {
  const { client, posts } = database({ publish: true }); feed([entry()]);
  await syncInsights(client); expect([...posts.values()][0].published).toBe(true);
});
test('existing manual coverage and deleted imported posts are not recreated', async () => {
  const { client, posts, imports, db } = database();
  posts.set('manual', { slug: 'manual', title: 'Manual post', content: 'Discusses CVE-2026-10001.', published: false });
  imports.set('CVE-2026-10002', { id: 'CVE-2026-10002' });
  feed([entry(1), entry(2)]);
  expect((await syncInsights(client)).created).toBe(0);
  expect(db.blogPost.upsert).not.toHaveBeenCalled();
});
test('shared lease skips concurrent or paused automatic runs', async () => {
  const { client, db } = database(); db.insightSyncState.updateMany.mockResolvedValue({ count: 0 });
  expect((await syncInsights(client, { automatic: true })).skipped).toBe(true);
  expect(db.insightSyncState.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ enabled: true }) }));
  expect(db.blogPost.upsert).not.toHaveBeenCalled();
});
test('failure records an error and releases the shared lease', async () => {
  const { client, db } = database(); global.fetch = jest.fn().mockRejectedValue(new Error('Feed offline'));
  await expect(syncInsights(client)).rejects.toThrow('Feed offline');
  expect(db.insightSyncState.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ data: { lockedUntil: null, lockToken: null } }));
  expect(db.insightSyncState.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ lastError: expect.any(String) }) }));
});
