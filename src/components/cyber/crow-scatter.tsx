import type { CSSProperties } from 'react';

// Original vector silhouettes, inspired by Itachi's crow-scattering illusion.
// Reference: https://tenor.com/view/sharingan-genjutsu-itachi-crow-corvos-gif-19016658
export function CrowScatter() {
  return <div aria-hidden className="crow-scatter pointer-events-none absolute inset-0 z-10">
    {Array.from({ length: 18 }, (_, index) => {
      const angle = (index / 18) * Math.PI * 2;
      const radius = 100 + (index % 4) * 35;
      const style = {
        left: `${20 + (index % 6) * 11}%`,
        top: `${25 + (index % 3) * 20}%`,
        '--crow-x': `${Math.cos(angle) * radius}px`,
        '--crow-y': `${Math.sin(angle) * radius - 35}px`,
        '--crow-turn': `${Math.cos(angle) * 35}deg`,
        '--crow-mid-x': `${Math.cos(angle + 0.3) * radius * 0.4}px`,
        '--crow-mid-y': `${Math.sin(angle + 0.3) * radius * 0.3 - 20}px`,
        '--crow-scale': String(0.65 + (index % 4) * 0.16),
        '--wing-speed': `${0.14 + (index % 4) * 0.025}s`,
        animationDuration: `${1.45 + (index % 4) * 0.12}s`,
        animationDelay: `${(index % 5) * 45}ms`,
      } as CSSProperties;
      return <span key={index} className="crow-flight absolute" style={style}>
        <span className="crow-wings block"><svg viewBox="0 0 64 48" className="h-9 w-12" fill="currentColor" stroke="hsl(var(--bone) / 0.6)" strokeWidth="0.8">
          <path d="M31 25 C23 19 18 5 2 3 L8 14 L4 13 L12 21 L8 20 L18 28 L13 27 Q20 34 30 31 L26 45 L32 41 L38 45 L35 31 Q45 34 55 24 L51 27 L46 28 L56 20 L52 21 L60 13 L56 14 L62 3 C46 5 41 19 33 25 Z" />
          <path d="M29 29 Q27 20 32 17 Q37 17 38 21 L44 24 L37 25 L35 32 Z" />
          <circle cx="35" cy="21" r="1" fill="hsl(var(--red))" stroke="none" />
        </svg></span>
      </span>;
    })}
    {Array.from({ length: 7 }, (_, index) => <span key={`feather-${index}`} className="crow-feather absolute" style={{
      left: `${25 + index * 8}%`, top: '45%',
      '--crow-x': `${(index - 3) * 38}px`,
      '--crow-y': `${40 + (index % 3) * 22}px`,
      '--crow-turn': `${(index % 2 ? -1 : 1) * 130}deg`,
      animationDelay: `${index * 65}ms`,
    } as CSSProperties}>
      <svg viewBox="0 0 16 40" className="h-7 w-3" fill="hsl(var(--ink))" stroke="hsl(var(--bone) / 0.45)" strokeWidth="0.8">
        <path d="M8 38 C2 27 -1 12 7 2 C17 11 15 27 8 38 Z M8 38 L8 9" />
      </svg>
    </span>)}
  </div>;
}
