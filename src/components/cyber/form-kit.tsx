'use client';

import { useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Check, CheckCircle, ChevronDown, Loader2, Plus, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* Shared building blocks for the public request forms (VAPT, bug bounty invite). */

const fieldClass =
  'peer w-full border-0 border-b border-signal/40 bg-transparent px-0 pb-2 pt-6 text-bone outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-signal focus:ring-0';
const labelClass =
  'pointer-events-none absolute left-0 top-0 monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors peer-focus:text-signal';

export function FormFrame({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="clip-notch border border-signal/50 bg-card">
      <div className="flex items-center justify-between border-b border-signal/40 px-6 py-3 monofont text-[10px] uppercase tracking-[0.3em] text-signal">
        <span>{title}</span>
        {badge && <span className="flex items-center gap-2 text-cyan">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string };

export function TextField({ id, label, required, className, ...props }: TextFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <input id={id} name={id} required={required} className={fieldClass} {...props} />
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-signal"> *</span>}
      </label>
    </div>
  );
}

type AreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string };

export function AreaField({ id, label, required, className, rows = 5, ...props }: AreaFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <textarea id={id} name={id} required={required} rows={rows} className={cn(fieldClass, 'resize-none')} {...props} />
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-signal"> *</span>}
      </label>
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClass, 'cursor-pointer appearance-none pr-8')}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink text-bone">
            {o.label}
          </option>
        ))}
      </select>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <ChevronDown aria-hidden className="pointer-events-none absolute bottom-3 right-0 h-4 w-4 text-signal" />
    </div>
  );
}

/** Multi-select toggle chips. */
export function ChipGroup({
  label,
  options,
  value,
  onToggle,
  error,
  required,
}: {
  label: string;
  options: readonly { id: string; label: string }[];
  value: readonly string[];
  onToggle: (id: string) => void;
  error?: string | null;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
        {required && <span className="text-signal"> *</span>}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.id)}
              className={cn(
                'inline-flex items-center gap-1.5 border px-3 py-1.5 monofont text-[11px] uppercase tracking-[0.12em] transition-colors',
                on ? 'border-signal bg-signal text-ink' : 'border-signal/40 text-bone/80 hover:border-signal hover:text-bone'
              )}
            >
              {on ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {o.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function CheckField({
  id,
  checked,
  onChange,
  children,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  error?: string | null;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
        <input id={id} name={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-signal/60',
            checked ? 'border-signal bg-signal' : error ? 'border-destructive' : 'border-signal/60'
          )}
        >
          {checked && <Check className="h-3 w-3 text-ink" />}
        </span>
        <span>{children}</span>
      </label>
      {error && (
        <p role="alert" className="mt-2 pl-7 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hidden field that only bots fill in. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="hp_field">Leave this field empty</label>
      <input id="hp_field" name="hp_field" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="bracket flex w-full items-center justify-center gap-3 bg-signal px-6 py-4 monofont text-xs font-bold uppercase tracking-[0.25em] text-ink transition-colors hover:bg-bone disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {busy ? 'Transmitting…' : children}
    </button>
  );
}

export function SuccessPanel({
  title,
  refCode,
  children,
  onReset,
  resetLabel = 'Send another',
}: {
  title: string;
  refCode: string;
  children: ReactNode;
  onReset: () => void;
  resetLabel?: string;
}) {
  return (
    <div role="status" className="clip-notch flex min-h-[460px] flex-col items-center justify-center border border-signal/50 bg-card p-10 text-center">
      <CheckCircle className="mb-6 h-14 w-14 text-signal" />
      <p className="monofont text-[10px] uppercase tracking-[0.35em] text-cyan">{'// transmission received'}</p>
      <h3 className="mt-3 font-display text-3xl font-bold uppercase text-bone">{title}</h3>
      <p className="mt-5 monofont text-xs uppercase tracking-[0.25em] text-muted-foreground">
        reference <span className="ml-2 bg-signal px-2 py-1 text-ink">{refCode}</span>
      </p>
      <div className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{children}</div>
      <button
        type="button"
        onClick={onReset}
        className="bracket mt-8 px-5 py-3 monofont text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-ink"
      >
        {resetLabel}
      </button>
    </div>
  );
}

/** POSTs a request to /api/engagements and tracks busy / sent / error state. */
export function useEngagementSubmit() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ ref: string; email: string } | null>(null);

  const submit = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ref?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Could not send your request. Please try again.');
      setSent({ ref: data.ref ?? '—', email: String(payload.email ?? '') });
      return true;
    } catch (e) {
      toast({
        title: 'Request not sent',
        description: e instanceof Error ? e.message : 'Could not send your request. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { busy, sent, submit, reset: () => setSent(null) };
}
