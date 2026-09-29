import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/admin-auth';
import { handleError, jsonError, readJson, revalidatePublic } from '@/lib/api';
import { importLinkedIn, parseLinkedInExport } from '@/lib/linkedin-import';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_TOTAL_CHARS = 3_000_000;

/**
 * POST { files: { "Positions.csv": "<csv text>", ... }, dryRun?: boolean, overwriteProfile?: boolean }
 * The browser unzips the LinkedIn export and only sends the CSVs we use.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  const body = (await readJson(request)) as
    | { files?: Record<string, unknown>; dryRun?: unknown; overwriteProfile?: unknown }
    | undefined;
  if (!body?.files || typeof body.files !== 'object') return jsonError('No LinkedIn files received.', 400);

  const files: Record<string, string> = {};
  let total = 0;
  for (const [name, content] of Object.entries(body.files)) {
    if (typeof content !== 'string') continue;
    total += content.length;
    files[name] = content;
  }
  if (total > MAX_TOTAL_CHARS) return jsonError('Files are too large.', 413);

  const parsed = parseLinkedInExport(files);
  if (parsed.filesFound.length === 0) {
    return jsonError(
      'None of the expected files were found (Profile.csv, Positions.csv, Education.csv, Skills.csv, Certifications.csv, Projects.csv).',
      400
    );
  }

  try {
    const summary = await importLinkedIn(prisma, parsed, {
      dryRun: body.dryRun === true,
      overwriteProfile: body.overwriteProfile !== false,
    });
    if (!summary.dryRun) revalidatePublic();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    return handleError(error, 'LinkedIn import');
  }
}
