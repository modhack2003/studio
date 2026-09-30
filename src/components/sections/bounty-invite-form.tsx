'use client';

import { useState, type FormEvent } from 'react';
import {
  AreaField,
  FormFrame,
  Honeypot,
  SelectField,
  SubmitButton,
  SuccessPanel,
  TextField,
  useEngagementSubmit,
} from '@/components/cyber/form-kit';
import { INVITE_PLATFORMS, PROGRAM_TYPES } from '@/lib/engagements';

const PLATFORM_OPTIONS = [{ value: '', label: 'Select platform' }, ...INVITE_PLATFORMS.map((p) => ({ value: p, label: p }))];
const TYPE_OPTIONS = PROGRAM_TYPES.map((t) => ({ value: t.id, label: t.label }));

const EMPTY = { company: '', name: '', email: '', programUrl: '', platform: '', programType: 'private', rewards: '', message: '' };

export function BountyInviteForm() {
  const [form, setForm] = useState(EMPTY);
  const [hp, setHp] = useState('');
  const { busy, sent, submit, reset } = useEngagementSubmit();
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (await submit({ kind: 'bounty', ...form, hp })) setForm(EMPTY);
  };

  if (sent) {
    return (
      <SuccessPanel title="Invite received" refCode={sent.ref} onReset={reset} resetLabel="Send another invite">
        Thanks for the invite — I&apos;ll look at the program policy and scope and reply to{' '}
        <span className="text-bone">{sent.email}</span>.
      </SuccessPanel>
    );
  }

  return (
    <FormFrame title="// program_invite" badge={<><span className="h-1.5 w-1.5 animate-blink bg-cyan" /> security teams</>}>
      <form onSubmit={onSubmit} className="relative space-y-7 p-6 sm:p-8">
        <Honeypot value={hp} onChange={setHp} />
        <div className="grid gap-7 md:grid-cols-2">
          <TextField id="inv-company" label="Company / organisation" required autoComplete="organization" value={form.company} onChange={set('company')} maxLength={160} />
          <TextField id="inv-name" label="Your name" required autoComplete="name" value={form.name} onChange={set('name')} maxLength={120} />
        </div>
        <div className="grid gap-7 md:grid-cols-2">
          <TextField id="inv-email" label="Work email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} maxLength={200} />
          <TextField
            id="inv-url"
            label="Program / policy link"
            type="url"
            placeholder="https://hackerone.com/your-program"
            value={form.programUrl}
            onChange={set('programUrl')}
            maxLength={500}
          />
        </div>
        <div className="grid gap-7 md:grid-cols-3">
          <SelectField id="inv-type" label="Program type" value={form.programType} onChange={(v) => setForm((f) => ({ ...f, programType: v }))} options={TYPE_OPTIONS} />
          <SelectField id="inv-platform" label="Platform" value={form.platform} onChange={(v) => setForm((f) => ({ ...f, platform: v }))} options={PLATFORM_OPTIONS} />
          <TextField id="inv-rewards" label="Reward range" placeholder="$100 – $5,000" value={form.rewards} onChange={set('rewards')} maxLength={120} />
        </div>
        <AreaField
          id="inv-message"
          label="Scope & details"
          required
          rows={5}
          placeholder="Assets in scope, program start date, invite code or anything I should know…"
          value={form.message}
          onChange={set('message')}
          maxLength={5000}
        />
        <SubmitButton busy={busy}>&gt;_Send invite</SubmitButton>
      </form>
    </FormFrame>
  );
}
