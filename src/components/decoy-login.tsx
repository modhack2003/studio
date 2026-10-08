'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Lock, Terminal } from 'lucide-react';

/** A local simulation: never sends, stores, or authenticates entered credentials. */
export function DecoyLogin({ title = 'Admin access', code = 'ADM-01', pinOnly = false }: { title?: string; code?: string; pinOnly?: boolean }) {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy || !password.trim() || (!pinOnly && !identity.trim())) return;
    setBusy(true);
    setFailed(false);
    // Discard the input immediately; retain only the simulated pending state.
    setPassword('');
    setIdentity('');
    timer.current = setTimeout(() => { setBusy(false); setFailed(true); }, 1100);
  };
  const inputClass = 'w-full border border-signal/40 bg-ink px-4 py-3 font-mono text-sm text-bone outline-none focus:border-cyan disabled:opacity-50';
  return (
    <section className="mx-auto max-w-md border border-signal/50 bg-card">
      <div className="flex items-center justify-between border-b border-signal/30 px-6 py-3 monofont text-[10px] uppercase tracking-widest text-muted-foreground"><span><Terminal className="mr-2 inline h-3 w-3" /> authentication terminal</span><span>{code}</span></div>
      <div className="p-6 sm:p-8">
        <Lock className="mb-5 h-9 w-9 text-signal" />
        <h1 className="font-display text-3xl font-bold uppercase text-bone">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Operator verification required.</p>
        <form onSubmit={submit} autoComplete="off" className="mt-7 space-y-5">
          {!pinOnly && <div><label htmlFor="decoy-identity" className="mb-2 block monofont text-xs uppercase text-muted-foreground">Operator ID</label><input id="decoy-identity" value={identity} onChange={(e) => setIdentity(e.target.value)} maxLength={80} required disabled={busy} autoComplete="off" spellCheck={false} className={inputClass} /></div>}
          <div><label htmlFor="decoy-password" className="mb-2 block monofont text-xs uppercase text-muted-foreground">{pinOnly ? 'PIN' : 'Password'}</label><input id="decoy-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} required disabled={busy} autoComplete="off" className={inputClass} /></div>
          <button type="submit" disabled={busy || !password.trim() || (!pinOnly && !identity.trim())} className="w-full bg-signal px-4 py-3 monofont text-xs uppercase tracking-widest text-ink transition-colors hover:bg-bone disabled:opacity-40">{busy ? 'Verifying operator…' : '>_ Authenticate'}</button>
          <p role="status" aria-live="polite" className="min-h-10 text-sm text-signal">{failed ? 'Access denied. Credentials could not be verified.' : busy ? 'Checking authorization…' : ''}</p>
        </form>
        <p className="border-t border-signal/20 pt-4 monofont text-[10px] uppercase tracking-widest text-muted-foreground">Restricted console // session unavailable</p>
      </div>
    </section>
  );
}
