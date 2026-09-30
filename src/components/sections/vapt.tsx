'use client';

import { useState, type FormEvent } from 'react';
import { Check, Plus, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/cyber/primitives';
import {
  AreaField,
  CheckField,
  ChipGroup,
  FormFrame,
  Honeypot,
  SelectField,
  SubmitButton,
  SuccessPanel,
  TextField,
  useEngagementSubmit,
} from '@/components/cyber/form-kit';
import { VAPT_SERVICES, VAPT_TIMELINES, type VaptServiceId } from '@/lib/engagements';

const PROTOCOL = [
  { title: 'Scoping', text: 'Targets, rules of engagement and test windows agreed up front. NDA on request.' },
  { title: 'Recon', text: 'Map the attack surface — assets, endpoints, tech stack and entry points.' },
  { title: 'Exploitation', text: 'Manual testing backed by tooling: auth, access control, injection, business logic.' },
  { title: 'Reporting', text: 'Executive summary plus technical findings with CVSS scores, PoCs and fixes.' },
  { title: 'Re-test', text: 'Fixed issues are verified so you know the holes are actually closed.' },
];

const DELIVERABLES = ['Executive summary', 'CVSS-scored findings', 'Proof-of-concept steps', 'Remediation guidance', 'Re-test report'];

const SCOPE_OPTIONS = VAPT_SERVICES.map((s) => ({ id: s.id, label: s.label }));
const TIMELINE_OPTIONS = VAPT_TIMELINES.map((t) => ({ value: t.id, label: t.label }));

function ServiceCard({
  index,
  service,
  on,
  onToggle,
}: {
  index: number;
  service: (typeof VAPT_SERVICES)[number];
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden border p-5 text-left transition-all duration-300',
        on ? 'border-signal bg-signal text-ink' : 'border-signal/30 bg-card hover:-translate-y-1 hover:border-signal'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-2 -top-5 font-display text-[6rem] font-bold leading-none opacity-20 transition-opacity group-hover:opacity-40',
          on ? 'text-outline-ink' : 'text-outline-red'
        )}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="flex items-start justify-between">
        <span className={cn('monofont text-[10px] uppercase tracking-[0.3em]', on ? 'text-ink/70' : 'text-signal')}>
          svc_{String(index + 1).padStart(2, '0')}
        </span>
        <span className={cn('font-jp text-xs', on ? 'text-ink/70' : 'text-muted-foreground')}>{service.jp}</span>
      </span>
      <span className={cn('mt-4 font-display text-2xl font-bold uppercase leading-tight', on ? 'text-ink' : 'text-bone')}>
        {service.label}
      </span>
      <span className={cn('mt-2 text-sm leading-relaxed', on ? 'text-ink/80' : 'text-muted-foreground')}>{service.desc}</span>
      <span
        className={cn(
          'mt-auto inline-flex items-center gap-2 pt-5 monofont text-[10px] uppercase tracking-[0.25em]',
          on ? 'text-ink' : 'text-signal'
        )}
      >
        {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {on ? 'in scope' : 'add to scope'}
      </span>
    </button>
  );
}

export function VaptSection({ email }: { email?: string | null }) {
  const [services, setServices] = useState<VaptServiceId[]>([]);
  const [form, setForm] = useState({ name: '', email: '', company: '', target: '', timeline: 'flexible', budget: '', message: '' });
  const [nda, setNda] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState<{ services?: string; authorized?: string }>({});
  const { busy, sent, submit, reset } = useEngagementSubmit();

  const toggle = (id: string) => {
    setServices((prev) => (prev.includes(id as VaptServiceId) ? prev.filter((s) => s !== id) : [...prev, id as VaptServiceId]));
    setErrors((e) => ({ ...e, services: undefined }));
  };
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (services.length === 0) next.services = 'Pick at least one service.';
    if (!authorized) next.authorized = 'Please confirm you are authorised to request testing of these systems.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const ok = await submit({ kind: 'vapt', ...form, services, nda, authorized, hp });
    if (ok) {
      setForm({ name: '', email: '', company: '', target: '', timeline: 'flexible', budget: '', message: '' });
      setServices([]);
      setNda(false);
      setAuthorized(false);
    }
  };

  return (
    <section className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-14 lg:col-span-7">
        {/* service catalog */}
        <div>
          <div className="mb-5 flex items-center justify-between monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="text-signal">{'// service_catalog'}</span>
            <span aria-live="polite">{services.length ? `${services.length} selected for scope` : 'tap a service to add it to scope'}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VAPT_SERVICES.map((s, i) => (
              <Reveal key={s.id} delay={(i % 2) * 0.08} className="h-full">
                <ServiceCard index={i} service={s} on={services.includes(s.id)} onToggle={() => toggle(s.id)} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* methodology */}
        <div>
          <h3 className="mb-6 flex items-center justify-between border-b border-signal/40 pb-3 monofont text-xs uppercase tracking-[0.3em] text-signal">
            <span>{'// engagement.protocol'}</span>
            <span className="font-jp">手順</span>
          </h3>
          <ol className="grid gap-px border border-signal/30 bg-signal/30 xl:grid-cols-5">
            {PROTOCOL.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.06} className="flex gap-5 bg-background p-5 xl:block">
                <span className="font-display text-4xl font-bold leading-none text-outline-red">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-display text-lg font-bold uppercase text-bone xl:mt-4">{step.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* deliverables */}
        <div>
          <h3 className="mb-5 flex items-center justify-between border-b border-signal/40 pb-3 monofont text-xs uppercase tracking-[0.3em] text-signal">
            <span>{'// deliverables'}</span>
            <span className="font-jp">成果物</span>
          </h3>
          <ul className="flex flex-wrap gap-2">
            {DELIVERABLES.map((d) => (
              <li key={d} className="inline-flex items-center gap-2 border border-signal/40 px-3 py-1.5 monofont text-[11px] uppercase tracking-wider text-bone/85">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan" /> {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* request form */}
      <div className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
        <Reveal>
          {sent ? (
            <SuccessPanel title="Request received" refCode={sent.ref} onReset={reset} resetLabel="Send another request">
              Thanks — I&apos;ll review the scope and reply to <span className="text-bone">{sent.email}</span> with next steps. Keep the
              reference handy if you follow up.
            </SuccessPanel>
          ) : (
            <FormFrame title="// request_engagement" badge={<><span className="h-1.5 w-1.5 animate-blink bg-cyan" /> confidential</>}>
              <form onSubmit={onSubmit} className="relative space-y-7 p-6 sm:p-8">
                <Honeypot value={hp} onChange={setHp} />
                <div className="grid gap-7 md:grid-cols-2">
                  <TextField id="vapt-name" label="Name" required autoComplete="name" value={form.name} onChange={set('name')} maxLength={120} />
                  <TextField
                    id="vapt-email"
                    label="Work email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    maxLength={200}
                  />
                </div>
                <div className="grid gap-7 md:grid-cols-2">
                  <TextField id="vapt-company" label="Company" autoComplete="organization" value={form.company} onChange={set('company')} maxLength={160} />
                  <TextField
                    id="vapt-target"
                    label="Target / assets"
                    placeholder="app.example.com, API, IP range…"
                    value={form.target}
                    onChange={set('target')}
                    maxLength={500}
                  />
                </div>
                <ChipGroup label="Scope" required options={SCOPE_OPTIONS} value={services} onToggle={toggle} error={errors.services} />
                <div className="grid gap-7 md:grid-cols-2">
                  <SelectField
                    id="vapt-timeline"
                    label="Timeline"
                    value={form.timeline}
                    onChange={(v) => setForm((f) => ({ ...f, timeline: v }))}
                    options={TIMELINE_OPTIONS}
                  />
                  <TextField id="vapt-budget" label="Budget (optional)" placeholder="e.g. $1,500 or ₹1,00,000" value={form.budget} onChange={set('budget')} maxLength={80} />
                </div>
                <AreaField
                  id="vapt-message"
                  label="Project details"
                  required
                  rows={5}
                  placeholder="What should be tested, environments (prod / staging), test accounts, compliance needs, anything off-limits…"
                  value={form.message}
                  onChange={set('message')}
                  maxLength={5000}
                />
                <div className="space-y-4">
                  <CheckField id="vapt-nda" checked={nda} onChange={setNda}>
                    I&apos;d like an NDA before sharing details.
                  </CheckField>
                  <CheckField
                    id="vapt-authorized"
                    checked={authorized}
                    onChange={(v) => {
                      setAuthorized(v);
                      if (v) setErrors((e) => ({ ...e, authorized: undefined }));
                    }}
                    error={errors.authorized}
                  >
                    I own these systems or am authorised to request security testing of them.
                    <span className="text-signal"> *</span>
                  </CheckField>
                </div>
                <SubmitButton busy={busy}>&gt;_Send request</SubmitButton>
                {email && (
                  <p className="text-center monofont text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    prefer email?{' '}
                    <a href={`mailto:${email}?subject=${encodeURIComponent('VAPT enquiry')}`} className="text-signal underline underline-offset-4">
                      {email}
                    </a>
                  </p>
                )}
              </form>
            </FormFrame>
          )}
        </Reveal>
      </div>
    </section>
  );
}
