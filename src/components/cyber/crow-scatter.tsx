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
        animationDelay: `${(index % 5) * 35}ms`,
      } as CSSProperties;
      return <span key={index} className="crow-flight absolute" style={style}>
        <span className="crow-wings block"><svg viewBox="0 0 64 48" className="h-9 w-12" fill="currentColor" stroke="hsl(var(--bone) / 0.45)" strokeWidth="0.7">
          <path d="M31 25 C23 19 18 5 2 3 L8 14 L4 13 L15 24 L10 24 Q20 34 30 31 L26 45 L32 41 L38 45 L35 31 Q45 34 55 24 L50 24 L61 13 L56 14 L62 3 C46 5 41 19 33 25 Z" />
          <path d="M29 29 Q27 20 32 17 Q37 17 38 21 L44 24 L37 25 L35 32 Z" />
        </svg></span>
      </span>;
    })}
  </div>;
}
