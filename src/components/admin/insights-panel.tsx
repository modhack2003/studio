'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from './api-client';
import { Btn, Panel, Toggle, formatDate } from './ui';
import { useToast } from '@/hooks/use-toast';
type State = { enabled: boolean; autoPublish: boolean; lastSuccess: string | null; lastError: string | null; lastCreated: number; running: boolean };
export function InsightsPanel({ onImported }: { onImported: () => void }) {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const load = useCallback(async () => {
    try { setState(await api<State>('/api/insights')); setError(null); }
    catch (e) { setError(errorMessage(e)); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function settings(body: Partial<Pick<State, 'enabled' | 'autoPublish'>>) {
    setBusy(true);
    try { setState(await api<State>('/api/insights', { method: 'PATCH', body })); setError(null); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  async function sync(backfill: boolean) {
    setBusy(true);
    try {
      const result = await api<{ created: number; skipped: boolean }>('/api/insights', { method: 'POST', body: { backfill } });
      toast({ title: result.skipped ? 'Import is already running' : `${result.created} Security Insights imported`, description: backfill ? 'Past-month imports are saved as drafts.' : 'Review the blog list below.' });
      setError(null); onImported(); await load();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <Panel title="Security Insights automation" description="Checks CISA’s Known Exploited Vulnerabilities catalog daily, around 10:30–11:30 AM IST. Imports up to 3 briefs; the first run adds up to 8 drafts from the past 30 days. Your edits are preserved." className="mb-5">
    {!state ? <Btn variant="outline" onClick={() => void load()}>Reload automation settings</Btn> : <>
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2"><Toggle label="Daily Security Insights collection" checked={state.enabled} disabled={busy} onChange={v => void settings({ enabled: v })} /><span className="text-xs">Daily collection</span></div>
        <div className="flex items-center gap-2"><Toggle label="Auto-publish new Security Insights" checked={state.autoPublish} disabled={busy} onChange={v => void settings({ autoPublish: v })} /><span className="text-xs">Auto-publish new briefs</span></div>
        <Btn busy={busy} onClick={() => void sync(false)}>Sync now</Btn>
        <Btn disabled={busy} variant="outline" onClick={() => void sync(true)}>Import past month</Btn>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{state.autoPublish ? 'New briefs publish automatically. Past-month imports always remain drafts.' : 'New briefs are saved as drafts for review.'} Last success: {formatDate(state.lastSuccess, { dateStyle: 'medium', timeStyle: 'short' })} · {state.lastCreated} added.{state.running && ' An import is running.'}</p>
      {state.lastError && <p role="alert" className="mt-2 text-xs text-destructive">{state.lastError}</p>}
    </>}
    {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
  </Panel>;
}
