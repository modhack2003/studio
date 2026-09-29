import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Primitives                                                                  */
/* -------------------------------------------------------------------------- */
const str = (max: number) => z.string().trim().max(max);
const reqStr = (max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} is too long (max ${max} characters)`);

/** Optional string: '' / null / undefined → null */
const optStr = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null));

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

/** Optional URL (http/https or site-relative path). '' → null */
const optUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (typeof v === 'string' ? v.trim() : ''))
  .refine((v) => v === '' || v.startsWith('/') || isHttpUrl(v), 'Must be a valid http(s) URL')
  .transform((v) => (v === '' ? null : v));

/** URL that may be blank but is stored as a string ('' allowed) */
const urlOrEmpty = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (typeof v === 'string' ? v.trim() : ''))
  .refine((v) => v === '' || v.startsWith('/') || v.startsWith('mailto:') || isHttpUrl(v), 'Must be a valid URL');

const tags = z
  .union([z.array(z.string()), z.string(), z.null(), z.undefined()])
  .transform((v) => {
    const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
    const seen = new Set<string>();
    return arr
      .map((t) => t.trim())
      .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
      .slice(0, 60);
  });

const optInt = (min: number, max: number) =>
  z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v, ctx) => {
      if (v === null || v === undefined || v === '') return null;
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isInteger(n) || n < min || n > max) {
        ctx.addIssue({ code: 'custom', message: `Must be a whole number between ${min} and ${max}` });
        return z.NEVER;
      }
      return n;
    });

/** Accepts YYYY, YYYY-MM, YYYY-MM-DD or ISO strings. '' → null */
const optDate = z
  .union([z.string(), z.date(), z.null(), z.undefined()])
  .transform((v, ctx) => {
    if (v === null || v === undefined || v === '') return null;
    if (v instanceof Date) return v;
    const s = v.trim();
    let d: Date;
    if (/^\d{4}$/.test(s)) d = new Date(Date.UTC(Number(s), 0, 1));
    else if (/^\d{4}-\d{2}$/.test(s)) d = new Date(`${s}-01T00:00:00Z`);
    else d = new Date(s);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: 'custom', message: 'Invalid date' });
      return z.NEVER;
    }
    return d;
  });

const reqDate = optDate.default(null).refine((d) => d !== null, 'Date is required');

const bool = z.union([z.boolean(), z.string(), z.null(), z.undefined()]).transform((v) => v === true || v === 'true' || v === 'on');

/* -------------------------------------------------------------------------- */
/* Models                                                                      */
/* -------------------------------------------------------------------------- */
// NOTE (zod v4): object keys are only optional when the schema has .default()/.optional(),
// so every non-required field below carries an explicit default.
export const personalDataSchema = z.object({
  name: reqStr(120, 'Name'),
  title: str(200).default(''),
  bio: str(4000).default(''),
  github: urlOrEmpty.default(''),
  linkedin: urlOrEmpty.default(''),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email')
    .default(''),
  resumeUrl: urlOrEmpty.default(''),
  avatarUrl: optUrl.default(null),
  location: optStr(120).default(null),
});

export const skillsSchema = z.object({
  languages: tags.default([]),
  tools: tags.default([]),
  areas: tags.default([]),
});

export const projectSchema = z.object({
  title: reqStr(160, 'Title'),
  description: str(4000).default(''),
  tags: tags.default([]),
  link: optUrl.default(null),
});

export const certificateSchema = z.object({
  name: reqStr(200, 'Name'),
  issuer: str(200).default(''),
  year: optInt(1950, 2100)
    .default(null)
    .transform((v) => v ?? new Date().getFullYear()),
  url: optUrl.default(null),
});

export const educationSchema = z.object({
  institution: reqStr(200, 'Institution'),
  degree: str(200).default(''),
  duration: str(100).default(''),
});

export const experienceSchema = z.object({
  company: reqStr(200, 'Company'),
  role: reqStr(200, 'Role'),
  location: optStr(120).default(null),
  startDate: optDate.default(null),
  endDate: optDate.default(null),
  current: bool.default(false),
  description: optStr(6000).default(null),
});

export const ctfSchema = z.object({
  name: reqStr(200, 'Event name'),
  organizer: str(200).default(''),
  date: reqDate,
  placement: optStr(100).default(null),
  team: optStr(100).default(null),
  writeupUrl: optUrl.default(null),
  categories: tags.default([]),
  points: optInt(0, 10_000_000).default(null),
});

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const blogPostSchema = z
  .object({
    title: reqStr(200, 'Title'),
    slug: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => (typeof v === 'string' ? slugify(v) : ''))
      .default(''),
    excerpt: str(600).default(''),
    content: str(100_000).default(''),
    tags: tags.default([]),
    published: bool.default(false),
  })
  .transform((v) => ({ ...v, slug: v.slug || slugify(v.title) || `post-${Date.now()}` }));

export const repoSettingsSchema = z.object({
  displayInPortfolio: z.boolean().optional(),
  customTitle: optStr(160).optional(),
  customDescription: optStr(1000).optional(),
  customTags: tags.optional(),
  displayOrder: optInt(0, 9999).optional(),
});

export const contactSchema = z.object({
  name: reqStr(120, 'Name'),
  email: z.string().trim().max(200).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'),
  subject: reqStr(200, 'Subject'),
  message: reqStr(5000, 'Message'),
  website: z.string().optional(), // honeypot
});

/** Formats the first zod issue as a readable message. */
export function zodMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Invalid input';
  const path = issue.path.join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
}
