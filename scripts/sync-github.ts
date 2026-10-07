/**
 * Sync GitHub → MongoDB from the command line (same logic as the admin "Sync now" button).
 *   DATABASE_URL=... npx tsx scripts/sync-github.ts [username]
 */
import { PrismaClient } from '@prisma/client';
import { resolveGitHubUsername } from '../src/lib/github-sync';

import { refreshGitHub } from '../src/lib/github-refresh';

const prisma = new PrismaClient();

async function main() {
  const username = await resolveGitHubUsername(prisma, process.argv[2] ?? null);
  console.log(`Syncing GitHub user "${username}" …`);
  const result = await refreshGitHub(prisma, { username });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
