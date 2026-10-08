'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Eye, Flag, Lock, RotateCcw } from 'lucide-react';
import { SHADOW_TRACKS, type ShadowTrack } from '@/lib/shadow-challenges';

export function CryptoPuzzle({ track = 'cipher' }: { track?: ShadowTrack }) {
  const challenge = SHADOW_TRACKS[track];
  const [level, setLevel] = useState(1);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [flag, setFlag] = useState('');
  const pending = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const puzzle = challenge.puzzles[level - 1];
  const solved = flag ? challenge.puzzles.length : level - 1;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending.current || !answer.trim() || flag) return;
    pending.current = true;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/ctf/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, level, answer }), signal: AbortSignal.timeout(10000),
      });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || 'Verification unavailable. Try again.'); return; }
      if (!result.correct) {
        setAttempts((value) => value + 1);
        if (attempts >= 2) setHint(true);
        setMessage('Signal mismatch. Try another answer.');
      } else if (result.isLastLevel && result.flag) {
        setFlag(result.flag);
        setAnswer('');
      } else {
        setLevel((value) => value + 1);
        setAnswer(''); setHint(false); setAttempts(0);
        setMessage('Lock opened. Next signal ready.');
      }
    } catch { setMessage('Uplink interrupted. Your progress is intact; try again.'); }
    finally { pending.current = false; setBusy(false); }
  };
  const reset = () => { setLevel(1); setAnswer(''); setHint(false); setAttempts(0); setFlag(''); setMessage(''); };

  return (
    <section className="overflow-hidden border border-signal/50 bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-signal/30 px-5 py-3 monofont text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><span>Access protocol // {track}</span><span className="text-cyan">{flag ? 'Signal recovered' : 'Awaiting response'}</span></div>
      <div className="grid md:grid-cols-[220px_1fr]">
        <aside className="border-b border-signal/30 p-6 md:border-b-0 md:border-r">
          <Lock className="mb-4 h-8 w-8 text-signal" />
          <p className="monofont text-[10px] uppercase tracking-widest text-muted-foreground">Sequence status</p>
          <p className="mt-2 font-display text-4xl text-bone">{String(solved).padStart(2, '0')}<span className="text-xl text-muted-foreground"> / {String(challenge.puzzles.length).padStart(2, '0')}</span></p>
          <div role="progressbar" aria-label="Locks solved" aria-valuemin={0} aria-valuemax={challenge.puzzles.length} aria-valuenow={solved} className="mt-4 h-1 bg-signal/15"><div className="h-full bg-cyan transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${solved / challenge.puzzles.length * 100}%` }} /></div>
          <ol className="mt-6 space-y-3 monofont text-[10px] uppercase tracking-wider text-muted-foreground">{challenge.puzzles.map((item, index) => <li key={item.title} aria-current={!flag && index === level - 1 ? 'step' : undefined} className={index < solved ? 'text-cyan' : index === level - 1 ? 'text-bone' : ''}>{String(index + 1).padStart(2, '0')}{' // '}{item.title} {index < solved ? '✓' : ''}</li>)}</ol>
        </aside>
        <div className="min-w-0 p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold uppercase text-bone sm:text-4xl">{challenge.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{challenge.subtitle}</p>
          {flag ? <div className="mt-8 space-y-5" role="status"><Flag className="h-8 w-8 text-cyan" /><h2 className="font-display text-2xl uppercase text-cyan">Transmission complete</h2><code className="block break-all border border-cyan/40 bg-cyan/5 p-4 text-sm text-bone">{flag}</code><p className="text-sm text-muted-foreground">You reached the end of this simulation. The terminal has no administrative privileges.</p><div className="flex flex-wrap gap-4"><button onClick={reset} className="flex items-center gap-2 monofont text-xs text-signal"><RotateCcw size={14} /> Restart sequence</button><Link href={track === 'archive' ? '/root' : '/admin/backup'} className="monofont text-xs text-cyan">Follow another signal →</Link></div></div> : <>
            <h2 className="mt-8 monofont text-sm uppercase tracking-wider text-signal">Lock {level}{' // '}{puzzle.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{puzzle.description}</p>
            <pre className="mt-5 whitespace-pre-wrap break-all border border-signal/30 bg-ink p-5 font-mono text-sm leading-7 text-cyan sm:text-base">{puzzle.cipher}</pre>
            <form onSubmit={submit} className="mt-6 space-y-3"><label htmlFor="shadow-answer" className="block monofont text-xs uppercase tracking-widest text-muted-foreground">Decoded answer</label><div className="flex flex-col gap-3 sm:flex-row"><input ref={input} id="shadow-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required maxLength={128} autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={busy} aria-describedby="shadow-status" className="min-w-0 flex-1 border border-signal/40 bg-ink px-4 py-3 font-mono text-sm text-bone outline-none focus:border-cyan" placeholder="Recover the plaintext…" /><button disabled={busy || !answer.trim()} className="bg-signal px-5 py-3 monofont text-xs uppercase tracking-widest text-ink transition-colors hover:bg-bone disabled:opacity-40">{busy ? 'Checking…' : '>_ Verify'}</button></div></form>
            <p id="shadow-status" role="status" aria-live="polite" className="mt-3 min-h-6 text-sm text-bone/80">{message}</p>
            <div className="mt-2 flex justify-between gap-3"><button aria-expanded={hint} onClick={() => setHint((value) => !value)} className="flex items-center gap-2 monofont text-xs text-cyan"><Eye size={14} /> {hint ? 'Hide clue' : 'Reveal clue'}</button><span className="monofont text-[10px] text-muted-foreground">ATTEMPTS // {attempts}</span></div>
            {hint && <p className="mt-4 border-l-2 border-cyan bg-cyan/5 p-4 text-sm text-bone/80">{puzzle.hint}</p>}
            <p className="mt-7 border-t border-signal/20 pt-4 monofont text-[10px] leading-5 text-muted-foreground">Decode in order. Answers ignore letter case and outer whitespace. A clue appears after three wrong answers.</p>
          </>}
        </div>
      </div>
    </section>
  );
}
