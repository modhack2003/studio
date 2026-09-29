'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ExternalLink, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, errorMessage } from './api-client';
import { Btn, Field, Panel, TextArea, TextInput } from './ui';

interface Profile {
  name: string;
  title: string;
  bio: string;
  github: string;
  linkedin: string;
  email: string;
  resumeUrl: string;
  avatarUrl: string;
  location: string;
}

const EMPTY: Profile = { name: '', title: '', bio: '', github: '', linkedin: '', email: '', resumeUrl: '', avatarUrl: '', location: '' };

export function ProfilePanel() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Partial<Record<keyof Profile, string | null>> | null>('/api/personal-data')
      .then((data) => {
        if (data) {
          setExists(true);
          setProfile(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, data[k as keyof Profile] ?? ''])) as unknown as Profile);
        }
      })
      .catch((e) => toast({ title: 'Could not load profile', description: errorMessage(e), variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const set = (k: keyof Profile) => (e: { target: { value: string } }) => setProfile((p) => ({ ...p, [k]: e.target.value }));

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await api('/api/personal-data', { method: 'PUT', body: profile });
      setExists(true);
      toast({ title: exists ? 'Profile updated' : 'Profile created', description: 'The public site refreshes within a minute.' });
    } catch (err) {
      toast({ title: 'Not saved', description: errorMessage(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { resumeUrl } = await api<{ resumeUrl: string }>('/api/resume/upload', { method: 'POST', formData: fd });
      setProfile((p) => ({ ...p, resumeUrl }));
      toast({ title: 'Resume uploaded' });
    } catch (err) {
      toast({ title: 'Upload failed', description: errorMessage(err), variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) return <Panel title="Profile">loading…</Panel>;

  return (
    <div className="space-y-6">
      <Panel
        title="Profile"
        description={exists ? 'Shown in the hero, about section and footer.' : 'No profile yet — fill this in and save to create it.'}
        actions={
          <Btn onClick={() => save()} busy={saving}>
            {exists ? 'Save changes' : 'Create profile'}
          </Btn>
        }
      >
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <Field label="Name *" htmlFor="p-name">
            <TextInput id="p-name" required value={profile.name} onChange={set('name')} />
          </Field>
          <Field label="Title / headline" htmlFor="p-title">
            <TextInput id="p-title" value={profile.title} onChange={set('title')} placeholder="Cybersecurity Analyst & Penetration Tester" />
          </Field>
          <Field label="Bio" htmlFor="p-bio" className="md:col-span-2">
            <TextArea id="p-bio" rows={5} value={profile.bio} onChange={set('bio')} />
          </Field>
          <Field label="Location" htmlFor="p-location">
            <TextInput id="p-location" value={profile.location} onChange={set('location')} placeholder="Kolkata, India" />
          </Field>
          <Field label="Email" htmlFor="p-email">
            <TextInput id="p-email" type="email" value={profile.email} onChange={set('email')} />
          </Field>
          <Field label="GitHub URL" htmlFor="p-github" hint="Also used as the GitHub sync username.">
            <TextInput id="p-github" value={profile.github} onChange={set('github')} placeholder="https://github.com/username" />
          </Field>
          <Field label="LinkedIn URL" htmlFor="p-linkedin">
            <TextInput id="p-linkedin" value={profile.linkedin} onChange={set('linkedin')} placeholder="https://www.linkedin.com/in/…" />
          </Field>
          <Field label="Avatar image URL" htmlFor="p-avatar" hint="Filled automatically by the GitHub sync.">
            <TextInput id="p-avatar" value={profile.avatarUrl} onChange={set('avatarUrl')} />
          </Field>
          <Field label="Resume URL" htmlFor="p-resume" hint="Upload a PDF below or paste any public link (e.g. Google Drive).">
            <TextInput id="p-resume" value={profile.resumeUrl} onChange={set('resumeUrl')} />
          </Field>
          <button type="submit" className="hidden" />
        </form>
      </Panel>

      <Panel title="Resume PDF" description="Stored in Vercel Blob (needs BLOB_READ_WRITE_TOKEN). Max 4 MB.">
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Btn variant="outline" onClick={() => fileRef.current?.click()} busy={uploading} disabled={!exists}>
            <Upload className="h-3.5 w-3.5" /> Upload PDF
          </Btn>
          {profile.resumeUrl ? (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-cyan underline">
              Current resume <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No resume yet.</span>
          )}
          {!exists && <span className="text-xs text-muted-foreground">Create the profile first.</span>}
        </div>
      </Panel>
    </div>
  );
}
