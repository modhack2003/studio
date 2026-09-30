'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ExternalLink, RefreshCw, Reply, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ENGAGEMENT_STATUSES,
  PROGRAM_TYPES,
  VAPT_SERVICES,
  VAPT_TIMELINES,
  engagementRef,
  labelOf,
  type EngagementStatus,
} from '@/lib/engagements';
import { api, errorMessage } from './api-client';
import { Btn, EmptyState, Panel, TextArea, formatDate } from './ui';

interface Engagement {
  id: string;
  kind: 'vapt' | 'bounty';
  status: EngagementStatus;
  name: string;
  email: string;
  company: string | null;
  message: string;
  services: string[];
  target: string | null;
  timeline: string | null;
  budget: string | null;
  nda: boolean;
  authorized: boolean;
  programUrl: string | null;
  platform: string | null;
  programType: string | null;
  rewards: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLE: Record<EngagementStatus, string> = {
  new: 'border-signal bg-signal text-ink',
  reviewing: 'border-amber-400 text-amber-400',
  accepted: 'border-cyan text-cyan',
  completed: 'border-bone/60 text-bone/80',
  declined: 'border-muted-foreground/40 text-muted-foreground',
};

const serviceLabels = (ids: string[]) => ids.map((id) => labelOf(VAPT_SERVICES, id)).join(' · ');

function summary(e: Engagement) {
  if (e.kind === 'vapt') return serviceLabels(e.services) || 'VAPT request';
  return [labelOf(PROGRAM_TYPES, e.programType), e.platform].filter(Boolean).join(' · ') || 'Program invite';
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  if (children === null || children === undefined || children === '') return null;
  return (
    <div className="contents">
      <dt className="monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-bone">{children}</dd>
    </div>
  );
}

export function RequestsPanel({ onNewCountChange }: { onNewCountChange?: (n: number) => void }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<'all' | 'vapt' | 'bounty'>('all');
  const [status, setStatus] = useState<'all' | EngagementStatus>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Engagement[]>('/api/engagements');
      setItems(data);
      setNotes(Object.fromEntries(data.map((d) => [d.id, d.notes ?? ''])));
    } catch (e) {
      toast({ title: 'Could not load requests', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    onNewCountChange?.(items.filter((i) => i.status === 'new').length);
  }, [items, onNewCountChange]);

  const update = async (item: Engagement, body: { status?: EngagementStatus; notes?: string }, message: string) => {
    setBusy(item.id);
    try {
      const saved = await api<Engagement>(`/api/engagements/${item.id}`, { method: 'PATCH', body });
      setItems((prev) => prev.map((x) => (x.id === item.id ? saved : x)));
      toast({ title: message });
    } catch (e) {
      toast({ title: 'Not saved', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: Engagement) => {
    if (!window.confirm(`Delete ${engagementRef(item.kind, item.id)} from ${item.company || item.name}? This cannot be undone.`)) return;
    setBusy(item.id);
    try {
      await api(`/api/engagements/${item.id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      if (open === item.id) setOpen(null);
    } catch (e) {
      toast({ title: 'Not deleted', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const counts = useMemo(
    () => ({ all: items.length, vapt: items.filter((i) => i.kind === 'vapt').length, bounty: items.filter((i) => i.kind === 'bounty').length }),
    [items]
  );
  const shown = items.filter((i) => (kind === 'all' || i.kind === kind) && (status === 'all' || i.status === status));

  return (
    <Panel
      title="Requests"
      description="VAPT requests and bug bounty program invites sent from the site. Only you can see these."
      actions={
        <Btn variant="ghost" size="sm" onClick={load} aria-label="Reload">
          <RefreshCw className="h-3.5 w-3.5" />
        </Btn>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['vapt', 'VAPT'],
              ['bounty', 'Bounty invites'],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'border px-3 py-1 monofont text-[10px] uppercase tracking-[0.2em]',
                kind === k ? 'border-signal bg-signal text-ink' : 'border-signal/30 text-muted-foreground hover:text-signal'
              )}
            >
              {l} ({counts[k]})
            </button>
          ))}
        </div>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="border border-signal/30 bg-ink px-3 py-1.5 monofont text-[10px] uppercase tracking-[0.2em] text-bone"
        >
          <option value="all">Any status</option>
          {ENGAGEMENT_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({items.filter((i) => i.status === s.id).length})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="py-8 text-center monofont text-xs uppercase tracking-[0.3em] text-muted-foreground">loading…</p>
      ) : items.length === 0 ? (
        <EmptyState>No requests yet — they appear here when someone uses the VAPT or invite forms.</EmptyState>
      ) : shown.length === 0 ? (
        <EmptyState>Nothing matches these filters.</EmptyState>
      ) : (
        <ul className="divide-y divide-signal/20 border-y border-signal/20">
          {shown.map((e) => {
            const ref = engagementRef(e.kind, e.id);
            const isOpen = open === e.id;
            return (
              <li key={e.id}>
                <button type="button" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen} className="flex w-full items-start gap-3 py-3 text-left">
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 border px-1.5 py-0.5 monofont text-[9px] uppercase tracking-[0.15em]',
                      e.kind === 'vapt' ? 'border-signal/60 text-signal' : 'border-cyan/60 text-cyan'
                    )}
                  >
                    {e.kind === 'vapt' ? 'VAPT' : 'Bounty'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-sm', e.status === 'new' ? 'font-semibold text-bone' : 'text-bone/80')}>
                      {e.company || e.name}
                      <span className="ml-2 monofont text-[10px] text-muted-foreground">{ref}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{summary(e)}</span>
                  </span>
                  <span className="hidden shrink-0 monofont text-[10px] text-muted-foreground sm:block">
                    {formatDate(e.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className={cn('shrink-0 border px-2 py-0.5 monofont text-[10px] uppercase tracking-[0.15em]', STATUS_STYLE[e.status] ?? STATUS_STYLE.new)}>
                    {labelOf(ENGAGEMENT_STATUSES, e.status)}
                  </span>
                </button>

                {isOpen && (
                  <div className="mb-4 space-y-5 border border-signal/30 bg-ink/60 p-4">
                    <dl className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2">
                      <Detail label="From">
                        {e.name} ·{' '}
                        <a href={`mailto:${e.email}`} className="text-cyan underline">
                          {e.email}
                        </a>
                      </Detail>
                      <Detail label="Company">{e.company}</Detail>
                      <Detail label="Received">{formatDate(e.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</Detail>
                      {e.kind === 'vapt' ? (
                        <>
                          <Detail label="Scope">{serviceLabels(e.services)}</Detail>
                          <Detail label="Target">{e.target}</Detail>
                          <Detail label="Timeline">{e.timeline ? labelOf(VAPT_TIMELINES, e.timeline) : null}</Detail>
                          <Detail label="Budget">{e.budget}</Detail>
                          <Detail label="NDA">{e.nda ? 'Requested' : 'Not requested'}</Detail>
                          <Detail label="Authorised">{e.authorized ? 'Confirmed by requester' : 'No'}</Detail>
                        </>
                      ) : (
                        <>
                          <Detail label="Program type">{e.programType ? labelOf(PROGRAM_TYPES, e.programType) : null}</Detail>
                          <Detail label="Platform">{e.platform}</Detail>
                          <Detail label="Rewards">{e.rewards}</Detail>
                          <Detail label="Program link">
                            {e.programUrl ? (
                              <a href={e.programUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan underline">
                                {e.programUrl} <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : null}
                          </Detail>
                        </>
                      )}
                    </dl>

                    <p className="whitespace-pre-wrap border-l-2 border-signal/60 pl-4 text-sm leading-relaxed text-bone/90">{e.message}</p>

                    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                      <label className="block space-y-1.5">
                        <span className="block monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Status</span>
                        <select
                          value={e.status}
                          disabled={busy === e.id}
                          onChange={(ev) => update(e, { status: ev.target.value as EngagementStatus }, `Marked as ${labelOf(ENGAGEMENT_STATUSES, ev.target.value)}`)}
                          className="w-full border border-signal/30 bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-signal"
                        >
                          {ENGAGEMENT_STATUSES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1.5">
                        <span className="block monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Private notes</span>
                        <TextArea
                          rows={3}
                          value={notes[e.id] ?? ''}
                          onChange={(ev) => setNotes((n) => ({ ...n, [e.id]: ev.target.value }))}
                          placeholder="Quote sent, call scheduled, scope questions…"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${ref} — ${e.kind === 'vapt' ? 'VAPT request' : 'bug bounty invite'}`)}`}
                        className="inline-flex items-center gap-2 bg-signal px-3 py-1.5 monofont text-[10px] uppercase tracking-[0.18em] text-ink hover:bg-bone"
                      >
                        <Reply className="h-3.5 w-3.5" /> Reply
                      </a>
                      <Btn
                        variant="outline"
                        size="sm"
                        busy={busy === e.id}
                        disabled={(notes[e.id] ?? '') === (e.notes ?? '')}
                        onClick={() => update(e, { notes: notes[e.id] ?? '' }, 'Notes saved')}
                      >
                        Save notes
                      </Btn>
                      <Btn variant="danger" size="sm" onClick={() => remove(e)} disabled={busy === e.id}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Btn>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
