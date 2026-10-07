import type { Prisma } from '@prisma/client';
import { organizeSkills } from '@/lib/skill-groups';

/**
 * Imports the CSV files from a LinkedIn "Get a copy of your data" export.
 * Supported files: Profile.csv, Positions.csv, Education.csv, Skills.csv,
 * Certifications.csv, Projects.csv (others are ignored).
 */

export const LINKEDIN_FILES = ['Profile.csv', 'Positions.csv', 'Education.csv', 'Skills.csv', 'Certifications.csv', 'Projects.csv'];

/* -------------------------------------------------------------------------- */
/* CSV                                                                         */
/* -------------------------------------------------------------------------- */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (inQuotes) throw new SyntaxError('The CSV contains an unclosed quoted field. Please export it again.');
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Converts CSV text to objects keyed by normalised header, locating the header row by a key column. */
export function csvRecords(text: string, keyColumn: string): Record<string, string>[] {
  const rows = parseCsv(text);
  const key = norm(keyColumn);
  const headerIdx = rows.findIndex((r) => r.some((h) => norm(h) === key));
  if (headerIdx === -1) return [];
  const headers = rows[headerIdx].map(norm);
  return rows.slice(headerIdx + 1).map((r) => {
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => {
      rec[h] = (r[i] ?? '').trim();
    });
    return rec;
  });
}

/** LinkedIn dates look like "Jan 2023", "2023", "1/15/23" or "Jan 15, 2023". */
export function parseLinkedInDate(value: string | undefined): Date | null {
  if (!value) return null;
  const s = value.trim();
  if (!s) return null;
  if (/^\d{4}$/.test(s)) return new Date(Date.UTC(Number(s), 0, 1));
  const monthYear = s.match(/^([A-Za-z]{3,9})\.?\s+(\d{4})$/);
  if (monthYear) {
    const d = new Date(`${monthYear[1].slice(0, 3)} 1, ${monthYear[2]} UTC`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function yearOf(value: string | undefined): number | null {
  const d = parseLinkedInDate(value);
  return d ? d.getUTCFullYear() : null;
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                     */
/* -------------------------------------------------------------------------- */
export interface ParsedLinkedIn {
  profile: { name?: string; headline?: string; summary?: string; location?: string } | null;
  positions: { company: string; role: string; description: string | null; location: string | null; startDate: Date | null; endDate: Date | null }[];
  education: { institution: string; degree: string; duration: string }[];
  skills: string[];
  certifications: { name: string; issuer: string; year: number; url: string | null }[];
  projects: { title: string; description: string; link: string | null }[];
  filesFound: string[];
}

function findFile(files: Record<string, string>, name: string): string | undefined {
  const target = name.toLowerCase();
  const key = Object.keys(files).find((k) => k.split('/').pop()?.toLowerCase() === target);
  return key ? files[key] : undefined;
}

export function parseLinkedInExport(files: Record<string, string>): ParsedLinkedIn {
  const out: ParsedLinkedIn = {
    profile: null,
    positions: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    filesFound: [],
  };

  const profileCsv = findFile(files, 'Profile.csv');
  if (profileCsv) {
    out.filesFound.push('Profile.csv');
    const rec = csvRecords(profileCsv, 'First Name')[0];
    if (rec) {
      const name = [rec.firstname, rec.lastname].filter(Boolean).join(' ').trim();
      out.profile = {
        name: name || undefined,
        headline: rec.headline || undefined,
        summary: rec.summary || undefined,
        location: rec.geolocation || rec.location || undefined,
      };
    }
  }

  const positionsCsv = findFile(files, 'Positions.csv');
  if (positionsCsv) {
    out.filesFound.push('Positions.csv');
    for (const r of csvRecords(positionsCsv, 'Company Name')) {
      if (!r.companyname || !r.title) continue;
      out.positions.push({
        company: r.companyname,
        role: r.title,
        description: r.description || null,
        location: r.location || null,
        startDate: parseLinkedInDate(r.startedon),
        endDate: parseLinkedInDate(r.finishedon),
      });
    }
  }

  const educationCsv = findFile(files, 'Education.csv');
  if (educationCsv) {
    out.filesFound.push('Education.csv');
    for (const r of csvRecords(educationCsv, 'School Name')) {
      if (!r.schoolname) continue;
      const start = yearOf(r.startdate);
      const end = yearOf(r.enddate);
      out.education.push({
        institution: r.schoolname,
        degree: [r.degreename, r.notes && r.notes.length < 80 ? r.notes : ''].filter(Boolean).join(' · '),
        duration: start && end ? `${start} - ${end}` : start ? `${start} - Present` : end ? String(end) : '',
      });
    }
  }

  const skillsCsv = findFile(files, 'Skills.csv');
  if (skillsCsv) {
    out.filesFound.push('Skills.csv');
    out.skills = csvRecords(skillsCsv, 'Name').map((r) => r.name).filter(Boolean);
  }

  const certsCsv = findFile(files, 'Certifications.csv');
  if (certsCsv) {
    out.filesFound.push('Certifications.csv');
    for (const r of csvRecords(certsCsv, 'Name')) {
      if (!r.name) continue;
      out.certifications.push({
        name: r.name,
        issuer: r.authority || '',
        year: yearOf(r.startedon) ?? yearOf(r.finishedon) ?? new Date().getFullYear(),
        url: r.url && /^https?:\/\//.test(r.url) ? r.url : null,
      });
    }
  }

  const projectsCsv = findFile(files, 'Projects.csv');
  if (projectsCsv) {
    out.filesFound.push('Projects.csv');
    for (const r of csvRecords(projectsCsv, 'Title')) {
      if (!r.title) continue;
      out.projects.push({
        title: r.title,
        description: r.description || '',
        link: r.url && /^https?:\/\//.test(r.url) ? r.url : null,
      });
    }
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Import                                                                      */
/* -------------------------------------------------------------------------- */
export interface ImportSummary {
  filesFound: string[];
  profile: string[];
  experience: { created: number; updated: number };
  education: { created: number; skipped: number };
  certificates: { created: number; updated: number };
  projects: { created: number; skipped: number };
  skills: { added: number };
  dryRun: boolean;
}

const key = (...parts: (string | null | undefined)[]) => JSON.stringify(parts.map((p) => (p ?? '').trim().toLowerCase()));

export async function importLinkedIn(
  prisma: Prisma.TransactionClient,
  parsed: ParsedLinkedIn,
  opts: { dryRun?: boolean; overwriteProfile?: boolean } = {}
): Promise<ImportSummary> {
  const dry = !!opts.dryRun;
  const summary: ImportSummary = {
    filesFound: parsed.filesFound,
    profile: [],
    experience: { created: 0, updated: 0 },
    education: { created: 0, skipped: 0 },
    certificates: { created: 0, updated: 0 },
    projects: { created: 0, skipped: 0 },
    skills: { added: 0 },
    dryRun: dry,
  };

  /* profile */
  if (parsed.profile) {
    const p = parsed.profile;
    const personal = await prisma.personalData.findFirst();
    const data: Record<string, string> = {};
    const set = (field: 'name' | 'title' | 'bio' | 'location', value: string | undefined, current: string | null | undefined) => {
      if (!value) return;
      if (!current || (opts.overwriteProfile && current !== value)) data[field] = value;
    };
    set('name', p.name, personal?.name);
    set('title', p.headline, personal?.title);
    set('bio', p.summary, personal?.bio);
    set('location', p.location, personal?.location);
    summary.profile = Object.keys(data);
    if (!dry && summary.profile.length) {
      if (personal) await prisma.personalData.update({ where: { id: personal.id }, data });
      else
        await prisma.personalData.create({
          data: {
            name: data.name || 'Your Name',
            title: data.title || '',
            bio: data.bio || '',
            location: data.location || null,
            github: '',
            linkedin: '',
            email: '',
            resumeUrl: '',
          },
        });
    }
  }

  /* experience */
  if (parsed.positions.length) {
    const existing = await prisma.experience.findMany();
    const byKey = new Map(existing.map((e) => [key(e.company, e.role, e.startDate?.toISOString().slice(0, 7)), e]));
    // Last row wins for repeated export records; preview and save use the same set.
    const positions = new Map(parsed.positions.map((pos) => [key(pos.company, pos.role, pos.startDate?.toISOString().slice(0, 7)), pos]));
    for (const pos of positions.values()) {
      const k = key(pos.company, pos.role, pos.startDate?.toISOString().slice(0, 7));
      const data = {
        company: pos.company,
        role: pos.role,
        description: pos.description,
        location: pos.location,
        startDate: pos.startDate,
        endDate: pos.endDate,
        current: !pos.endDate,
        source: 'linkedin',
      };
      const found = byKey.get(k);
      if (found) {
        summary.experience.updated++;
        if (!dry) await prisma.experience.update({ where: { id: found.id }, data });
      } else {
        summary.experience.created++;
        if (!dry) await prisma.experience.create({ data });
      }
    }
  }

  /* education */
  if (parsed.education.length) {
    const existing = await prisma.education.findMany();
    const keys = new Set(existing.map((e) => key(e.institution, e.degree)));
    const institutions = new Set(existing.map((e) => key(e.institution)));
    for (const edu of parsed.education) {
      if (keys.has(key(edu.institution, edu.degree)) || (!edu.degree && institutions.has(key(edu.institution)))) {
        summary.education.skipped++;
        continue;
      }
      summary.education.created++;
      keys.add(key(edu.institution, edu.degree));
      institutions.add(key(edu.institution));
      if (!dry) await prisma.education.create({ data: edu });
    }
  }

  /* certificates */
  if (parsed.certifications.length) {
    const existing = await prisma.certificate.findMany();
    const byName = new Map(existing.map((c) => [key(c.name), c]));
    const certifications = new Map(parsed.certifications.map((cert) => [key(cert.name), cert]));
    for (const cert of certifications.values()) {
      const found = byName.get(key(cert.name));
      if (found) {
        summary.certificates.updated++;
        if (!dry)
          await prisma.certificate.update({
            where: { id: found.id },
            data: { issuer: cert.issuer || found.issuer, year: cert.year, url: cert.url ?? found.url ?? null },
          });
      } else {
        summary.certificates.created++;
        if (!dry) await prisma.certificate.create({ data: cert });
      }
    }
  }

  /* projects */
  if (parsed.projects.length) {
    const existing = await prisma.project.findMany({ select: { title: true } });
    const titles = new Set(existing.map((p) => key(p.title)));
    for (const proj of parsed.projects) {
      if (titles.has(key(proj.title))) {
        summary.projects.skipped++;
        continue;
      }
      summary.projects.created++;
      titles.add(key(proj.title));
      if (!dry) await prisma.project.create({ data: { ...proj, tags: [] } });
    }
  }

  /* skills → existing categories, with known languages/tools classified */
  if (parsed.skills.length) {
    const skill = await prisma.skill.findFirst();
    const before = organizeSkills({ languages: skill?.languages ?? [], tools: skill?.tools ?? [], areas: skill?.areas ?? [] });
    const grouped = organizeSkills({ ...before, areas: [...before.areas, ...parsed.skills] });
    const count = (groups: typeof grouped) => groups.languages.length + groups.tools.length + groups.areas.length;
    summary.skills.added = count(grouped) - count(before);
    if (!dry) {
      if (skill) await prisma.skill.update({ where: { id: skill.id }, data: grouped });
      else if (count(grouped)) await prisma.skill.create({ data: grouped });
    }
  }

  return summary;
}
