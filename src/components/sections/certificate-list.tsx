import { Reveal } from '@/components/cyber/primitives';

export interface Certificate {
  name: string;
  issuer: string;
  year: number;
  url?: string | null;
}

function CertificateCards({ certificates }: { certificates: Certificate[] }) {
  return (
    <ul className="space-y-3">
      {certificates.map((cert, i) => {
        const body = <>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold">{cert.name}</p>
            <p className="break-words monofont text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-ink/70">{cert.issuer}{cert.url && ' · verify ↗'}</p>
          </div>
          <span className="shrink-0 font-display text-xl font-bold text-signal group-hover:text-ink">{cert.year}</span>
        </>;
        const className = 'clip-notch-sm group relative flex items-center justify-between gap-4 bg-card px-4 py-3 transition-colors hover:bg-signal hover:text-ink';
        return <Reveal as="li" key={`${cert.name}-${cert.issuer}-${i}`} delay={Math.min(i, 3) * 0.06}>
          {cert.url ? <a href={cert.url} target="_blank" rel="noopener noreferrer" className={className}>{body}</a> : <div className={className}>{body}</div>}
        </Reveal>;
      })}
    </ul>
  );
}

export function CertificateList({ certificates }: { certificates: Certificate[] }) {
  const limit = 4;
  return <>
    <CertificateCards certificates={certificates.slice(0, limit)} />
    {certificates.length > limit && <details className="group/certificates mt-4">
      <summary className="cursor-pointer border border-signal/30 px-3 py-3 monofont text-xs uppercase tracking-wider text-signal hover:bg-signal/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
        <span className="group-open/certificates:hidden">Show all {certificates.length} certificates (+{certificates.length - limit})</span>
        <span className="hidden group-open/certificates:inline">Show fewer certificates</span>
      </summary>
      <div className="mt-3"><CertificateCards certificates={certificates.slice(limit)} /></div>
    </details>}
  </>;
}
