'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, GitFork, Pin, RefreshCw, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { api, errorMessage } from './api-client';
import { Badge, Btn, EmptyState, Field, Panel, TextArea, TextInput, Toggle, formatDate } from './ui';

interface Repo {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  readmeExcerpt: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  pushedAt: string;
  fork: boolean | null;
  archived: boolean;
  displayInPortfolio: boolean;
  customTitle: string | null;
  customDescription: string | null;
  customTags: string[];
  displayOrder: number | null;
}

interface SyncData {
  total: number;
  created: number;
  updated: number;
  removed: number;
  visible: number;
  readmeExcerpts: number;
  profileUpdated: string[];
  errors: { repository: string; error: string }[];
}

type Draft = { customTitle: string; customDescription: string; customTags: string; displayOrder: string };

export function GitHubPanel() {
  const { toast } = useToast();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [username, setUsername] = useState('');
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ customTitle: '', customDescription: '', customTags: '', displayOrder: '' });
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ repositories: Repo[]; stats: { lastSync: string | null } }>('/api/github/repos');
      setRepos(data.repositories);
      setLastSync(data.stats.lastSync);
    } catch (e) {
      toast({ title: 'Could not load repositories', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
    api<{ github?: string } | null>('/api/personal-data')
      .then((p) => {
        const m = p?.github?.match(/github\.com\/([A-Za-z0-9-]+)/i);
        if (m) setUsername(m[1]);
      })
      .catch(() => {});
  }, [load]);

  const sync = async () => {
    setSyncing(true);
    try {
      const { data } = await api<{ data: SyncData }>('/api/github/sync', { method: 'POST', body: { username: username || undefined } });
      toast({
        title: `Synced ${data.total} repositories`,
        description: `${data.created} new · ${data.updated} updated · ${data.removed} removed · ${data.visible} shown on the site${
          data.errors.length ? ` · ${data.errors.length} errors` : ''
        }`,
      });
      await load();
    } catch (e) {
      toast({ title: 'Sync failed', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const update = async (repo: Repo, body: Record<string, unknown>, message?: string) => {
    setBusy(repo.id);
    try {
      const { repository } = await api<{ repository: Repo }>(`/api/github/repos/${repo.id}`, { method: 'PUT', body });
      setRepos((prev) => prev.map((r) => (r.id === repo.id ? { ...r, ...repository } : r)));
      if (message) toast({ title: message });
      return true;
    } catch (e) {
      toast({ title: 'Not saved', description: errorMessage(e), variant: 'destructive' });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const remove = async (repo: Repo) => {
    if (!window.confirm(`Remove ${repo.name} from the database? It will come back on the next sync if it still exists on GitHub.`)) return;
    setBusy(repo.id);
    try {
      await api(`/api/github/repos/${repo.id}`, { method: 'DELETE' });
      setRepos((prev) => prev.filter((r) => r.id !== repo.id));
    } catch (e) {
      toast({ title: 'Not removed', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const openEditor = (repo: Repo) => {
    setOpen(open === repo.id ? null : repo.id);
    setDraft({
      customTitle: repo.customTitle ?? '',
      customDescription: repo.customDescription ?? '',
      customTags: repo.customTags.join(', '),
      displayOrder: repo.displayOrder === null ? '' : String(repo.displayOrder),
    });
  };

  const saveDraft = async (repo: Repo) => {
    const ok = await update(
      repo,
      {
        customTitle: draft.customTitle,
        customDescription: draft.customDescription,
        customTags: draft.customTags.split(',').map((t) => t.trim()).filter(Boolean),
        displayOrder: draft.displayOrder === '' ? null : Number(draft.displayOrder),
      },
      'Repository settings saved'
    );
    if (ok) setOpen(null);
  };

  const shown = useMemo(
    () => repos.filter((r) => (filter === 'all' ? true : filter === 'visible' ? r.displayInPortfolio : !r.displayInPortfolio)),
    [repos, filter]
  );
  const visibleCount = repos.filter((r) => r.displayInPortfolio).length;

  return (
    <Panel
      title="GitHub repositories"
      description={
        <>
          The site shows pinned repos first, then the <b>5 latest</b>; visitors can expand to see all {visibleCount} visible repos. Last sync:{' '}
          {formatDate(lastSync, { dateStyle: 'medium', timeStyle: 'short' })}
        </>
      }
      actions={
        <>
          <TextInput
            aria-label="GitHub username"
            placeholder="github username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-44 py-1.5"
          />
          <Btn onClick={sync} busy={syncing}>
            <RefreshCw className="h-3.5 w-3.5" /> Sync now
          </Btn>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'visible', 'hidden'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'border px-3 py-1 monofont text-[10px] uppercase tracking-[0.2em]',
              filter === f ? 'border-signal bg-signal text-ink' : 'border-signal/30 text-muted-foreground hover:text-signal'
            )}
          >
            {f} ({f === 'all' ? repos.length : f === 'visible' ? visibleCount : repos.length - visibleCount})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center monofont text-xs uppercase tracking-[0.3em] text-muted-foreground">loading…</p>
      ) : repos.length === 0 ? (
        <EmptyState>No repositories yet — press “Sync now”.</EmptyState>
      ) : (
        <ul className="divide-y divide-signal/20 border-y border-signal/20">
          {shown.map((repo) => (
            <li key={repo.id} className="py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-bone">{repo.customTitle || repo.name}</span>
                    {repo.displayOrder !== null && (
                      <Badge tone="red">
                        <Pin className="mr-1 h-3 w-3" />#{repo.displayOrder}
                      </Badge>
                    )}
                    {repo.fork && <Badge tone="muted">fork</Badge>}
                    {repo.archived && <Badge tone="muted">archived</Badge>}
                    {repo.language && <Badge tone="cyan">{repo.language}</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {repo.customDescription || repo.description || repo.readmeExcerpt || 'No description (add one on GitHub or a custom one here).'}
                  </p>
                  <p className="mt-1 flex items-center gap-3 monofont text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" />{repo.stargazersCount}</span>
                    <span className="inline-flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forksCount}</span>
                    <span>pushed {formatDate(repo.pushedAt)}</span>
                    <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-signal">
                      github <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Toggle
                    label={`Show ${repo.name} on the site`}
                    checked={repo.displayInPortfolio}
                    disabled={busy === repo.id}
                    onChange={(v) => update(repo, { displayInPortfolio: v }, v ? `${repo.name} is now shown` : `${repo.name} is hidden`)}
                  />
                  <Btn variant="ghost" size="sm" onClick={() => openEditor(repo)}>
                    {open === repo.id ? 'Close' : 'Customize'}
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => remove(repo)} aria-label={`Remove ${repo.name}`} className="hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Btn>
                </div>
              </div>

              {open === repo.id && (
                <div className="mt-3 grid gap-3 border border-signal/40 bg-ink/60 p-4 md:grid-cols-2">
                  <Field label="Custom title" htmlFor={`t-${repo.id}`}>
                    <TextInput id={`t-${repo.id}`} placeholder={repo.name} value={draft.customTitle} onChange={(e) => setDraft((d) => ({ ...d, customTitle: e.target.value }))} />
                  </Field>
                  <Field label="Pin position" htmlFor={`o-${repo.id}`} hint="Empty = sorted by latest activity. 0 = first.">
                    <TextInput id={`o-${repo.id}`} type="number" min={0} value={draft.displayOrder} onChange={(e) => setDraft((d) => ({ ...d, displayOrder: e.target.value }))} />
                  </Field>
                  <Field label="Custom description" htmlFor={`d-${repo.id}`} className="md:col-span-2">
                    <TextArea
                      id={`d-${repo.id}`}
                      rows={2}
                      placeholder={repo.description || repo.readmeExcerpt || ''}
                      value={draft.customDescription}
                      onChange={(e) => setDraft((d) => ({ ...d, customDescription: e.target.value }))}
                    />
                  </Field>
                  <Field label="Custom tags (comma separated)" htmlFor={`g-${repo.id}`} className="md:col-span-2">
                    <TextInput id={`g-${repo.id}`} value={draft.customTags} onChange={(e) => setDraft((d) => ({ ...d, customTags: e.target.value }))} />
                  </Field>
                  <div className="flex justify-end gap-2 md:col-span-2">
                    <Btn variant="ghost" onClick={() => setOpen(null)}>
                      Cancel
                    </Btn>
                    <Btn onClick={() => saveDraft(repo)} busy={busy === repo.id}>
                      Save
                    </Btn>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
