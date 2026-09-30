import { prisma } from '@/lib/prisma';
import { collectionHandlers } from '@/lib/api';
import {
  blogPostSchema,
  bountyFindingSchema,
  certificateSchema,
  ctfSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
} from '@/lib/validators';

/* Generic CRUD handlers, one set per collection. Route files re-export these. */

type D = Parameters<typeof collectionHandlers>[0]['delegate'];
const d = (model: unknown) => (() => model) as D;

export const projectHandlers = collectionHandlers({
  label: 'Project',
  delegate: d(prisma.project),
  schema: projectSchema,
});

export const certificateHandlers = collectionHandlers({
  label: 'Certificate',
  delegate: d(prisma.certificate),
  schema: certificateSchema,
  orderBy: { year: 'desc' },
});

export const educationHandlers = collectionHandlers({
  label: 'Education',
  delegate: d(prisma.education),
  schema: educationSchema,
});

export const ctfHandlers = collectionHandlers({
  label: 'CTF event',
  delegate: d(prisma.ctfEvent),
  schema: ctfSchema,
  orderBy: { date: 'desc' },
});

export const experienceHandlers = collectionHandlers({
  label: 'Experience',
  delegate: d(prisma.experience),
  schema: experienceSchema,
  orderBy: { startDate: 'desc' },
  prepare: (data, mode) => {
    const out = { ...data };
    if (out.current) out.endDate = null;
    if (mode === 'create' && !out.source) out.source = 'manual';
    return out;
  },
});

export const blogHandlers = collectionHandlers({
  label: 'Blog post',
  delegate: d(prisma.blogPost),
  schema: blogPostSchema,
  orderBy: { createdAt: 'desc' },
  privateList: true,
  prepare: async (data, mode, id) => {
    const out = { ...data };
    if (!out.published) {
      out.publishedAt = null;
    } else if (mode === 'create') {
      out.publishedAt = new Date();
    } else if (id) {
      // keep the original publish date when re-saving a published post
      const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
      if (!existing?.publishedAt) out.publishedAt = new Date();
    }
    return out;
  },
});

/** Admin-only list: private program names must never be served by a public endpoint. */
export const bountyHandlers = collectionHandlers({
  label: 'Bounty finding',
  delegate: d(prisma.bountyFinding),
  schema: bountyFindingSchema,
  orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  privateList: true,
});
