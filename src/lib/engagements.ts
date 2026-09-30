/**
 * Option lists shared by the public request forms, the API validators and the admin panel.
 * Client-safe: no server imports.
 */

export const VAPT_SERVICES = [
  {
    id: 'web',
    label: 'Web Application',
    jp: 'ウェブ',
    desc: 'OWASP Top 10, authentication & session flaws, access control and business logic.',
  },
  {
    id: 'api',
    label: 'API Security',
    jp: 'エーピーアイ',
    desc: 'REST & GraphQL — BOLA/IDOR, broken auth, mass assignment, rate limiting.',
  },
  {
    id: 'mobile',
    label: 'Mobile App',
    jp: 'モバイル',
    desc: 'Android & iOS — local storage, transport security, reversing and the backend it talks to.',
  },
  {
    id: 'network',
    label: 'Network & Infra',
    jp: 'ネットワーク',
    desc: 'External & internal hosts, exposed services, misconfigurations and privilege escalation paths.',
  },
  {
    id: 'cloud',
    label: 'Cloud Review',
    jp: 'クラウド',
    desc: 'AWS / Azure / GCP — IAM, storage exposure, public services and hardening gaps.',
  },
  {
    id: 'code',
    label: 'Secure Code Review',
    jp: 'コード',
    desc: 'Manual review of critical code paths, backed by static analysis.',
  },
] as const;

export type VaptServiceId = (typeof VAPT_SERVICES)[number]['id'];
export const VAPT_SERVICE_IDS = VAPT_SERVICES.map((s) => s.id) as [VaptServiceId, ...VaptServiceId[]];

export const VAPT_TIMELINES = [
  { id: 'asap', label: 'As soon as possible' },
  { id: '2-weeks', label: 'Within 2 weeks' },
  { id: 'month', label: 'Within a month' },
  { id: 'flexible', label: 'Flexible' },
] as const;
export const VAPT_TIMELINE_IDS = VAPT_TIMELINES.map((t) => t.id) as [string, ...string[]];

export const PROGRAM_TYPES = [
  { id: 'private', label: 'Private program' },
  { id: 'public', label: 'Public program' },
  { id: 'vdp', label: 'VDP (no bounty)' },
  { id: 'event', label: 'Live hacking event' },
] as const;
export const PROGRAM_TYPE_IDS = PROGRAM_TYPES.map((t) => t.id) as [string, ...string[]];

export const INVITE_PLATFORMS = ['HackerOne', 'Bugcrowd', 'Intigriti', 'YesWeHack', 'Self-hosted', 'Other'] as const;

export const ENGAGEMENT_STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'completed', label: 'Completed' },
  { id: 'declined', label: 'Declined' },
] as const;
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number]['id'];
export const ENGAGEMENT_STATUS_IDS = ENGAGEMENT_STATUSES.map((s) => s.id) as [EngagementStatus, ...EngagementStatus[]];

export type EngagementKind = 'vapt' | 'bounty';

/** Short human reference shown to the requester and in the admin panel, e.g. VAPT-3F9A2C. */
export function engagementRef(kind: string, id: string): string {
  return `${kind === 'vapt' ? 'VAPT' : 'BB'}-${id.slice(-6).toUpperCase()}`;
}

export const labelOf = <T extends { id: string; label: string }>(list: readonly T[], id: string | null | undefined) =>
  list.find((x) => x.id === id)?.label ?? id ?? '';
