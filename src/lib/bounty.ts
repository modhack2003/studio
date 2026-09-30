/**
 * Bug bounty helpers shared by the server (data loading / redaction) and the client (formatting).
 * Client-safe: no server imports.
 */

export const SEVERITIES = [
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
  { id: 'info', label: 'Info' },
] as const;
export type Severity = (typeof SEVERITIES)[number]['id'];
export const SEVERITY_IDS = SEVERITIES.map((s) => s.id) as [Severity, ...Severity[]];

export const FINDING_PLATFORMS = [
  'HackerOne',
  'Bugcrowd',
  'Intigriti',
  'YesWeHack',
  'Synack',
  'Open Bug Bounty',
  'Direct / VDP',
  'Other',
] as const;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'] as const;

const HOSTS: [RegExp, string][] = [
  [/(^|\.)hackerone\.com$/, 'HackerOne'],
  [/(^|\.)bugcrowd\.com$/, 'Bugcrowd'],
  [/(^|\.)intigriti\.com$/, 'Intigriti'],
  [/(^|\.)yeswehack\.com$/, 'YesWeHack'],
  [/(^|\.)synack\.com$/, 'Synack'],
  [/(^|\.)openbugbounty\.org$/, 'Open Bug Bounty'],
  [/(^|\.)hackenproof\.com$/, 'HackenProof'],
  [/(^|\.)immunefi\.com$/, 'Immunefi'],
  [/(^|\.)github\.com$/, 'GitHub'],
];

/** "https://hackerone.com/someone" → "HackerOne" (falls back to the hostname). */
export function platformFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    return HOSTS.find(([re]) => re.test(host))?.[1] ?? host;
  } catch {
    return url;
  }
}

export function formatMoney(amount: number, currency?: string | null): string {
  const cur = currency || 'USD';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount.toLocaleString('en-US')} ${cur}`;
  }
}

/* -------------------------------------------------------------------------- */
/* Public shape + stats (computed on the server, private names stripped)       */
/* -------------------------------------------------------------------------- */
export interface FindingRecord {
  id: string;
  title: string;
  program: string;
  privateProgram: boolean;
  platform: string | null;
  severity: string;
  vulnType: string | null;
  bounty: number | null;
  currency: string | null;
  cve: string | null;
  hallOfFame: boolean;
  date: Date | string | null;
  link: string | null;
  description: string | null;
}

export interface PublicFinding {
  id: string;
  title: string;
  /** null for private programs */
  program: string | null;
  privateProgram: boolean;
  platform: string | null;
  severity: Severity;
  vulnType: string | null;
  bounty: number | null;
  currency: string | null;
  cve: string | null;
  hallOfFame: boolean;
  date: string | null;
  /** null for private programs */
  link: string | null;
  description: string | null;
}

export interface BountyStats {
  findings: number;
  critHigh: number;
  programs: number;
  hallOfFame: number;
  cves: number;
  earned: { currency: string; amount: number }[];
  bySeverity: Record<Severity, number>;
  /** distinct public program names, most findings first */
  acknowledgedBy: string[];
}

const asSeverity = (s: string): Severity => (SEVERITY_IDS as readonly string[]).includes(s) ? (s as Severity) : 'medium';

export function toPublicFinding(f: FindingRecord): PublicFinding {
  const hidden = f.privateProgram;
  return {
    id: f.id,
    title: f.title,
    program: hidden ? null : f.program,
    privateProgram: hidden,
    platform: f.platform,
    severity: asSeverity(f.severity),
    vulnType: f.vulnType,
    bounty: f.bounty,
    currency: f.bounty != null ? f.currency || 'USD' : null,
    cve: f.cve,
    hallOfFame: f.hallOfFame,
    date: f.date ? new Date(f.date).toISOString() : null,
    link: hidden ? null : f.link,
    description: f.description,
  };
}

export function computeBountyStats(findings: FindingRecord[]): BountyStats {
  const bySeverity = Object.fromEntries(SEVERITY_IDS.map((s) => [s, 0])) as Record<Severity, number>;
  const earned = new Map<string, number>();
  const programs = new Set<string>();
  const publicPrograms = new Map<string, number>();

  for (const f of findings) {
    const sev = asSeverity(f.severity);
    bySeverity[sev] += 1;
    if (f.bounty && f.bounty > 0) {
      const cur = f.currency || 'USD';
      earned.set(cur, (earned.get(cur) ?? 0) + f.bounty);
    }
    const key = f.program.trim().toLowerCase();
    programs.add(key);
    if (!f.privateProgram) publicPrograms.set(f.program.trim(), (publicPrograms.get(f.program.trim()) ?? 0) + 1);
  }

  return {
    findings: findings.length,
    critHigh: bySeverity.critical + bySeverity.high,
    programs: programs.size,
    hallOfFame: findings.filter((f) => f.hallOfFame).length,
    cves: findings.filter((f) => f.cve).length,
    earned: [...earned.entries()].sort((a, b) => b[1] - a[1]).map(([currency, amount]) => ({ currency, amount })),
    bySeverity,
    acknowledgedBy: [...publicPrograms.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name),
  };
}
