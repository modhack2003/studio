'use client';

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border border-signal/40 bg-card', className)}>
      <header className="flex flex-col gap-3 border-b border-signal/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase text-bone">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

const inputBase =
  'w-full border border-signal/30 bg-ink px-3 py-2 text-sm text-bone outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-signal disabled:opacity-50';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(inputBase, className)} {...props} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...props },
  ref
) {
  return <textarea ref={ref} className={cn(inputBase, 'min-h-[90px] resize-y', className)} {...props} />;
});

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  busy?: boolean;
  size?: 'sm' | 'md';
};

export function Btn({ variant = 'primary', busy, size = 'md', className, children, disabled, ...props }: BtnProps) {
  const variants = {
    primary: 'bg-signal text-ink hover:bg-bone',
    outline: 'border border-signal/50 text-signal hover:bg-signal hover:text-ink',
    ghost: 'text-muted-foreground hover:text-signal',
    danger: 'border border-destructive/60 text-destructive hover:bg-destructive hover:text-ink',
  };
  return (
    <button
      type="button"
      disabled={disabled || busy}
      className={cn(
        'inline-flex items-center justify-center gap-2 monofont uppercase tracking-[0.18em] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2.5 text-[11px]',
        variants[variant],
        className
      )}
      {...props}
    >
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center border transition-colors disabled:opacity-50',
        checked ? 'border-signal bg-signal/30' : 'border-signal/30 bg-ink'
      )}
    >
      <span
        className={cn(
          'absolute h-4 w-4 transition-transform',
          checked ? 'translate-x-6 bg-signal' : 'translate-x-1 bg-muted-foreground'
        )}
      />
    </button>
  );
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'cyan' | 'red' | 'muted' }) {
  const tones = {
    default: 'border-signal/40 text-bone/80',
    cyan: 'border-cyan/50 text-cyan',
    red: 'border-signal bg-signal text-ink',
    muted: 'border-muted-foreground/30 text-muted-foreground',
  };
  return <span className={cn('inline-flex items-center border px-2 py-0.5 monofont text-[10px] uppercase tracking-wider', tones[tone])}>{children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-signal/30 px-6 py-10 text-center monofont text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </div>
  );
}

export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, opts);
}
