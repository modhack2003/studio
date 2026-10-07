'use client';

import { useRef, useState } from 'react';
import { unzipSync, strFromU8 } from 'fflate';
import { FileArchive, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, errorMessage } from './api-client';
import { Btn, Panel, Toggle } from './ui';

const WANTED = ['profile.csv', 'positions.csv', 'education.csv', 'skills.csv', 'certifications.csv', 'projects.csv'];

interface Summary {
  filesFound: string[];
  profile: string[];
  experience: { created: number; updated: number };
  education: { created: number; skipped: number };
  certificates: { created: number; updated: number };
  projects: { created: number; skipped: number };
  skills: { added: number };
  dryRun: boolean;
}

/** Reads a LinkedIn export (.zip or individual .csv files) in the browser and keeps only the CSVs we import. */
async function readFiles(list: FileList): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const file of Array.from(list)) {
    if (file.size > 50_000_000) throw new Error('Export is too large. Choose the individual profile CSV files instead.');
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.zip')) {
      const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: (f) => {
          const wanted = WANTED.includes(f.name.split('/').pop()!.toLowerCase());
          if (wanted && f.originalSize > 3_000_000) throw new Error('A profile CSV is too large to import.');
          return wanted;
        },
      });
      for (const [name, bytes] of Object.entries(entries)) out[name.split('/').pop()!] = strFromU8(bytes);
    } else if (WANTED.includes(lower)) {
      out[file.name] = await file.text();
    }
  }
  if (Object.values(out).reduce((total, value) => total + value.length, 0) > 3_000_000) {
    throw new Error('Profile files are too large to import.');
  }
  return out;
}

export function ImportPanel() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Record<string, string> | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [preview, setPreview] = useState<Summary | null>(null);
  const [result, setResult] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (dryRun: boolean, data = files, overwriteProfile = overwrite) => {
    if (!data) return;
    setBusy(true);
    if (dryRun) setPreview(null);
    try {
      const { summary } = await api<{ summary: Summary }>('/api/import/linkedin', {
        method: 'POST',
        body: { files: data, dryRun, overwriteProfile },
      });
      if (dryRun) setPreview(summary);
      else {
        setResult(summary);
        setPreview(null);
        toast({ title: 'LinkedIn data imported', description: 'The public site refreshes within a minute.' });
      }
    } catch (e) {
      toast({ title: dryRun ? 'Could not read the export' : 'Import failed', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const onPick = async (list: FileList | null) => {
    if (!list?.length || busy) return;
    setBusy(true);
    setFiles(null);
    setResult(null);
    setPreview(null);
    try {
      const data = await readFiles(list);
      if (Object.keys(data).length === 0) {
        toast({ title: 'No LinkedIn CSV files found', description: 'Pick the export .zip, or Positions.csv / Education.csv / Skills.csv…', variant: 'destructive' });
        return;
      }
      setFiles(data);
      await run(true, data);
    } catch (e) {
      toast({ title: 'Could not open the file', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const summaryRows = (s: Summary) => [
    ['Profile fields', s.profile.length ? s.profile.join(', ') : 'no changes'],
    ['Experience', `${s.experience.created} new, ${s.experience.updated} updated`],
    ['Education', `${s.education.created} new, ${s.education.skipped} already there`],
    ['Certificates', `${s.certificates.created} new, ${s.certificates.updated} updated`],
    ['Projects', `${s.projects.created} new, ${s.projects.skipped} already there`],
    ['Skills', `${s.skills.added} added`],
  ];

  return (
    <Panel
      title="Import from LinkedIn"
      description="LinkedIn blocks automatic profile reading, so import your official data export instead."
    >
      <ol className="mb-6 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          On LinkedIn open <b>Settings &amp; Privacy › Data privacy › Get a copy of your data</b>.
        </li>
        <li>Choose the full archive (or tick Profile, Positions, Education, Skills, Certifications) and request it.</li>
        <li>When LinkedIn emails you, download the .zip and drop it here. Nothing is saved until you press Import.</li>
      </ol>

      <div className="flex flex-wrap items-center gap-4">
        <input ref={inputRef} type="file" multiple disabled={busy} accept=".zip,.csv" className="hidden" onChange={(e) => onPick(e.target.files)} />
        <Btn variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} busy={busy && !preview}>
          <FileArchive className="h-3.5 w-3.5" /> Choose export (.zip / .csv)
        </Btn>
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <Toggle label="Overwrite profile" checked={overwrite} disabled={busy} onChange={(value) => {
            setOverwrite(value);
            if (files) void run(true, files, value);
          }} />
          Replace name / headline / summary / location with LinkedIn&apos;s
        </label>
      </div>

      {files && (
        <p className="mt-4 monofont text-[10px] uppercase tracking-[0.2em] text-cyan">
          files: {Object.keys(files).join(' · ')}
        </p>
      )}

      {files && !preview && !result && !busy && (
        <Btn className="mt-4" variant="outline" onClick={() => run(true)}>Retry preview</Btn>
      )}

      {(preview || result) && (
        <div className="mt-6 border border-signal/40 bg-ink/60 p-4">
          <p className="mb-3 monofont text-[10px] uppercase tracking-[0.3em] text-signal">
            {preview ? '// preview — nothing saved yet' : '// imported'}
          </p>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[160px_1fr]">
            {summaryRows((preview || result)!).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-bone">{v}</dd>
              </div>
            ))}
          </dl>
          {preview && (
            <div className="mt-4 flex gap-2">
              <Btn onClick={() => run(false)} busy={busy}>
                <Upload className="h-3.5 w-3.5" /> Import now
              </Btn>
              <Btn variant="ghost" onClick={() => run(true)} disabled={busy}>
                Refresh preview
              </Btn>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
