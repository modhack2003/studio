'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Laptop, LogOut, ShieldAlert, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { api, errorMessage } from './api-client';
import { Badge, Btn, Field, Panel, TextInput, formatDate } from './ui';

interface Overview {
  pin: { source: 'database' | 'env' | 'none'; weak: boolean };
  failures24h: number;
  sessions: { id: string; createdAt: string; lastSeenAt: string; expiresAt: string; ip: string | null; userAgent: string | null; current: boolean }[];
  attempts: { id: string; ip: string; success: boolean; userAgent: string | null; createdAt: string }[];
}

function device(ua: string | null) {
  if (!ua) return 'Unknown device';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return `${browser} on ${os}`;
}

export function SecurityPanel({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<Overview | null>(null);
  const [pins, setPins] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<Overview>('/api/admin/security'));
    } catch (e) {
      toast({ title: 'Could not load security info', description: errorMessage(e), variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const changePin = async (e: FormEvent) => {
    e.preventDefault();
    if (pins.next !== pins.confirm) {
      toast({ title: 'PINs do not match', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await api<{ signedOutSessions: number }>('/api/admin/security/pin', {
        method: 'POST',
        body: { currentPin: pins.current, newPin: pins.next },
      });
      setPins({ current: '', next: '', confirm: '' });
      toast({
        title: 'PIN changed',
        description: `Stored as a hash in the database. ${res.signedOutSessions} other session(s) signed out. ADMIN_PIN no longer works.`,
      });
      load();
    } catch (err) {
      toast({ title: 'PIN not changed', description: errorMessage(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async (scope: 'others' | 'all') => {
    try {
      const res = await api<{ signedOut: number }>(`/api/admin/sessions?scope=${scope}`, { method: 'DELETE' });
      toast({ title: `Signed out ${res.signedOut} session(s)` });
      if (scope === 'all') onLogout();
      else load();
    } catch (e) {
      toast({ title: 'Failed', description: errorMessage(e), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {data?.pin.weak && (
        <div className="flex items-start gap-3 border border-signal bg-signal/10 p-4 text-sm text-bone">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
          <p>
            Your current PIN is weak (short or easy to guess). Set a new 6–12 digit PIN below — it is stored hashed in the database and
            replaces the <code className="monofont">ADMIN_PIN</code> environment variable.
          </p>
        </div>
      )}

      <Panel
        title="Change PIN"
        description={
          data
            ? `Current PIN source: ${data.pin.source === 'database' ? 'database (hashed)' : data.pin.source === 'env' ? 'ADMIN_PIN env variable' : 'not configured'}`
            : undefined
        }
      >
        <form onSubmit={changePin} className="grid gap-4 md:grid-cols-3">
          {(
            [
              ['current', 'Current PIN'],
              ['next', 'New PIN (6–12 digits)'],
              ['confirm', 'Confirm new PIN'],
            ] as const
          ).map(([k, label]) => (
            <Field key={k} label={label} htmlFor={`pin-${k}`}>
              <TextInput
                id={`pin-${k}`}
                type="password"
                inputMode="numeric"
                autoComplete={k === 'current' ? 'current-password' : 'new-password'}
                required
                value={pins[k]}
                onChange={(e) => setPins((p) => ({ ...p, [k]: e.target.value.replace(/\s/g, '') }))}
              />
            </Field>
          ))}
          <div className="md:col-span-3 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">Repeated (111111), sequential (123456) and common PINs are rejected.</p>
            <Btn type="submit" busy={saving}>
              Update PIN
            </Btn>
          </div>
        </form>
      </Panel>

      <Panel
        title="Active sessions"
        description="Sessions expire after 12 h, or 2 h without activity."
        actions={
          <>
            <Btn variant="outline" size="sm" onClick={() => signOut('others')}>
              Sign out other devices
            </Btn>
            <Btn variant="danger" size="sm" onClick={() => signOut('all')}>
              <LogOut className="h-3.5 w-3.5" /> Sign out everywhere
            </Btn>
          </>
        }
      >
        <ul className="divide-y divide-signal/20 border-y border-signal/20">
          {data?.sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="flex items-center gap-3">
                <Laptop className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="text-bone">{device(s.userAgent)}</span>
                  <span className="ml-2 monofont text-xs text-muted-foreground">{s.ip}</span>
                </span>
                {s.current && <Badge tone="cyan">this device</Badge>}
              </span>
              <span className="monofont text-[10px] text-muted-foreground">
                active {formatDate(s.lastSeenAt, { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Login history" description={data ? `${data.failures24h} failed attempt(s) in the last 24 h.` : undefined}>
        <ul className="divide-y divide-signal/20 border-y border-signal/20">
          {data?.attempts.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 py-2 text-sm">
              <span className="flex items-center gap-2">
                {a.success ? <CheckCircle2 className="h-4 w-4 text-cyan" /> : <XCircle className="h-4 w-4 text-destructive" />}
                <span className={cn(a.success ? 'text-bone' : 'text-destructive')}>{a.success ? 'Success' : 'Wrong PIN'}</span>
                <span className="monofont text-xs text-muted-foreground">{a.ip}</span>
                <span className="hidden text-xs text-muted-foreground md:inline">{device(a.userAgent)}</span>
              </span>
              <span className="monofont text-[10px] text-muted-foreground">{formatDate(a.createdAt, { dateStyle: 'short', timeStyle: 'medium' })}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
