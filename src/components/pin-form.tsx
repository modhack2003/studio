'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { KeyRound, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinFormProps {
  onSuccess: () => void;
  notice?: string | null;
}

/** Admin PIN login. All checks (PIN, lockout, session) happen on the server. */
export function PinForm({ onSuccess, notice }: PinFormProps) {
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= lockedUntil) {
        setLockedUntil(null);
        setError(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const locked = lockedUntil !== null && lockedUntil > now;
  const remaining = locked ? Math.ceil((lockedUntil! - now) / 1000) : 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pin || busy || locked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; retryAfter?: number };
      if (res.ok) {
        setPin('');
        onSuccess();
        return;
      }
      if (res.status === 429) setLockedUntil(Date.now() + (data.retryAfter ?? 900) * 1000);
      setError(data.error ?? 'Login failed.');
      setPin('');
      inputRef.current?.focus();
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleSubmit} className="clip-notch border border-signal/60 bg-card">
        <div className="flex items-center justify-between border-b border-signal/40 px-5 py-3 monofont text-[10px] uppercase tracking-[0.3em] text-signal">
          <span>{'// secure_terminal'}</span>
          <span className="flex items-center gap-2 text-cyan">
            <span className="h-1.5 w-1.5 animate-blink bg-cyan" /> tls
          </span>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-signal bg-signal/10">
              {locked ? <Lock className="h-6 w-6 text-signal" /> : <KeyRound className="h-6 w-6 text-signal" />}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase leading-none text-bone">Admin access</h1>
              <p className="mt-1 text-xs text-muted-foreground">Enter your access PIN (6–12 digits).</p>
            </div>
          </div>

          {notice && (
            <p className="border border-cyan/40 bg-cyan/10 px-3 py-2 text-xs text-cyan" role="status">
              {notice}
            </p>
          )}

          <div className="relative">
            <input
              ref={inputRef}
              id="pin"
              name="pin"
              type={show ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\s/g, '').slice(0, 32))}
              disabled={busy || locked}
              aria-label="Admin PIN"
              aria-invalid={!!error}
              aria-describedby={error ? 'pin-error' : undefined}
              placeholder="••••••"
              className={cn(
                'w-full border bg-ink px-4 py-4 text-center font-display text-3xl tracking-[0.5em] text-bone outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-signal disabled:opacity-50',
                error ? 'border-destructive' : 'border-signal/40'
              )}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 monofont text-[10px] uppercase tracking-widest text-muted-foreground hover:text-signal"
            >
              {show ? 'hide' : 'show'}
            </button>
          </div>

          {error && (
            <p id="pin-error" role="alert" className="flex items-start gap-2 text-sm text-destructive">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {error}
                {locked && (
                  <span className="ml-1 monofont tabular-nums">
                    ({Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')})
                  </span>
                )}
              </span>
            </p>
          )}

          <button
            type="submit"
            disabled={busy || locked || pin.length < 4}
            className="bracket flex w-full items-center justify-center gap-3 bg-signal px-6 py-4 monofont text-xs font-bold uppercase tracking-[0.25em] text-ink transition-colors hover:bg-bone disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? 'Verifying…' : locked ? 'Locked' : 'Authorize'}
          </button>

          <p className="monofont text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground">
            5 wrong attempts lock this device for 15 minutes. Every attempt is logged.
          </p>
        </div>
      </form>
    </div>
  );
}
