'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, errorMessage } from './api-client';
import { Btn, Field, Panel, TextArea } from './ui';

type Skills = { languages: string; tools: string; areas: string };

const split = (s: string) =>
  s
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);

export function SkillsPanel() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skills>({ languages: '', tools: '', areas: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ languages: string[]; tools: string[]; areas: string[] } | null>('/api/skills')
      .then((d) => {
        if (d) setSkills({ languages: d.languages.join(', '), tools: d.tools.join(', '), areas: d.areas.join(', ') });
      })
      .catch((e) => toast({ title: 'Could not load skills', description: errorMessage(e), variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const save = async () => {
    setSaving(true);
    try {
      await api('/api/skills', {
        method: 'PUT',
        body: { languages: split(skills.languages), tools: split(skills.tools), areas: split(skills.areas) },
      });
      toast({ title: 'Skills saved' });
    } catch (err) {
      toast({ title: 'Not saved', description: errorMessage(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof Skills; label: string }[] = [
    { key: 'languages', label: 'Languages' },
    { key: 'tools', label: 'Tools & technologies' },
    { key: 'areas', label: 'Areas of expertise' },
  ];

  return (
    <Panel
      title="Arsenal / skills"
      description="Comma or new-line separated. LinkedIn skills are imported into “Areas of expertise”."
      actions={
        <Btn onClick={save} busy={saving} disabled={loading}>
          Save skills
        </Btn>
      }
    >
      <div className="grid gap-4">
        {fields.map((f) => (
          <Field key={f.key} label={`${f.label} (${split(skills[f.key]).length})`} htmlFor={`s-${f.key}`}>
            <TextArea
              id={`s-${f.key}`}
              rows={3}
              disabled={loading}
              value={skills[f.key]}
              onChange={(e) => setSkills((s) => ({ ...s, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
    </Panel>
  );
}
