# Security Insights automation

Uses the official CISA KEV JSON mirror. No AI key, paid scheduler, or browser/PIN automation is needed. Costs remain subject to existing Vercel Functions and database quotas.

- Daily Vercel cron: `/api/cron/security-insights`, `0 5 * * *` (05:00 UTC / approximately 10:30–11:30 IST on Hobby).
- Uses the existing production `CRON_SECRET`; missing or incorrect authorization fails closed.
- First successful run backfills up to eight draft briefs from the preceding 30 days, distributed across weeks. Existing manual CVE coverage is skipped.
- Subsequent runs create at most three briefs per UTC day. Imports default to unpublished drafts.
- Admin → Blog: daily collection switch, optional auto-publish switch, Sync now, Import past month, last success and errors.
- Past-month imports always remain drafts, including when auto-publish is enabled.
- A shared ten-minute MongoDB lease prevents concurrent cron/admin imports. Automatic retries have a twenty-minute cooldown. The endpoint runs for at most five minutes.
- Stable slugs and a durable CVE ledger prevent duplicates, preserve edits, and keep deleted imported posts from returning. Legacy manually created posts mentioning a CVE are recognized.
- Source strings are converted to plain text. The collector has a fixed source URL, no redirect following, a 20-second fetch deadline, an 8 MB body limit and schema validation.
- Briefs attribute CISA, distinguish catalog addition dates from publication dates, explain exploitation/ransomware uncertainty, and keep federal deadlines in context. Verify affected versions using vendor advisories before publishing.

## Deployment

Normal GitHub/Vercel deployment generates the Prisma client through the existing postinstall command. New MongoDB collections use string primary keys; no new secondary indexes or destructive schema migration are required. Existing posts and settings are unchanged. Do not run `prisma db push --accept-data-loss`.

Daily collection is enabled by default after deployment. Auto-publishing is disabled. The first cron initializes the collections and backfill automatically; Sync now can initialize them earlier.

## Verification

Unit tests cover source validation, date windows, budget limits, draft defaults, opt-in publishing, legacy coverage, deletion tracking, lease skips, failures, admin authentication and cron authentication. CI runs `scripts/test-insights.ts` against a disposable MongoDB replica set to verify atomic concurrency, persisted caps and editorial preservation. It cannot connect to production.
