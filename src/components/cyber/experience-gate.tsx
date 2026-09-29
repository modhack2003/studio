'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';

export type ExperienceMode = 'safe' | 'glitch';
const STORAGE_KEY = 'nd-experience-mode';
export const EXPERIENCE_EVENT = 'nd:experience-mode';

export function getExperienceMode(): ExperienceMode | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'safe' || v === 'glitch' ? v : null;
}

function applyMode(mode: ExperienceMode) {
  document.documentElement.classList.toggle('safe-mode', mode === 'safe');
  window.dispatchEvent(new CustomEvent(EXPERIENCE_EVENT, { detail: mode }));
}

const SIDE_LETTERS = ['[LOADING]', 'S', 'E', 'C', '[LOADING]', 'U', 'R', 'VERSION', '[LOADING]'];

/**
 * First-visit boot screen + photosensitivity warning (utopiatokyo.com style).
 * The choice is stored locally; "safe mode" disables glitch/flicker effects
 * and calms the 3D scene.
 */
export function ExperienceGate() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const stored = getExperienceMode();
    if (stored) {
      applyMode(stored);
      return;
    }
    if (pathname !== '/') return;
    setOpen(true);
    const t = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const choose = (mode: ExperienceMode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    applyMode(mode);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
        >
          {/* side boot columns */}
          <div aria-hidden className="pointer-events-none absolute inset-0 flex justify-between px-[8vw] py-10 monofont text-sm text-signal/40">
            {[0, 1].map((col) => (
              <div key={col} className="flex flex-col justify-between">
                {SIDE_LETTERS.map((l, i) => (
                  <span key={i} className="animate-flicker" style={{ animationDelay: `${(i + col) * 0.23}s` }}>
                    {l}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {booting ? (
              <motion.div
                key="boot"
                className="relative monofont text-xs uppercase tracking-[0.4em] text-signal"
                exit={{ opacity: 0 }}
              >
                Establishing uplink<span className="animate-blink">_</span>
              </motion.div>
            ) : (
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.92, rotateX: 25 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                className="relative mx-4 w-full max-w-xl bg-signal px-8 py-12 text-center text-ink sm:px-14 sm:py-16"
                style={{ transformPerspective: 1000 }}
              >
                <h2
                  id="gate-title"
                  className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl"
                >
                  Experience
                  <br />
                  Warning
                </h2>
                <p className="mx-auto mt-8 max-w-sm text-sm font-medium leading-relaxed">
                  This site features high-contrast visual effects, 3D motion and rapid transitions that may
                  trigger seizures in people with photosensitive epilepsy.
                </p>
                <p className="mx-auto mt-4 max-w-sm text-sm font-medium leading-relaxed">
                  If you or someone you know has a history of photosensitive seizures, please select Safe Mode.
                </p>
                <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => choose('safe')}
                    className="bracket whitespace-nowrap bg-ink/15 px-6 py-3 monofont text-xs uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-signal"
                  >
                    [ Use safe mode ]
                  </button>
                  <button
                    type="button"
                    onClick={() => choose('glitch')}
                    className="bracket whitespace-nowrap bg-ink/15 px-6 py-3 monofont text-xs uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-signal"
                  >
                    [ Enable glitch effect ]
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
