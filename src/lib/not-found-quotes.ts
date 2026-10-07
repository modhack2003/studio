/** Original lines for the lost-route screen; no attributed anime quotations. */
export const NOT_FOUND_QUOTES = [
  'Not every missing path is a dead end.',
  'Even the sharpest eyes cannot find what was never there.',
  'The system returned nothing. You still get to choose what comes next.',
  'Some doors disappear because you have outgrown the room.',
  'A broken link is an invitation to find another way.',
  'You cannot debug a life you refuse to examine.',
  'Silence is also a response. It just has no status message.',
  'Access denied is a boundary. Not found is a question.',
  'The hardest truth: waiting will not create the missing page.',
  'Lost is a location, not an identity.',
  'A perfect illusion still breaks when you ask the right question.',
  'The truth does not become kinder because you look away.',
  'Every mask hides a face. Every silence hides a story.',
  'You can patch a system. You must choose to change yourself.',
  'Some battles end only when you stop fighting your own reflection.',
  'No map can replace the courage to take the next step.',
  'The empty page cannot answer for the life you postponed.',
  'A crow leaves no footprints in the sky. Keep looking anyway.',
  'Knowing the vulnerability is not the same as fixing it.',
  'Even in the dark, you can decide which way to turn.',
] as const;

export const NOT_FOUND_QUOTE_KEY = 'nd-404-quote-clock';
export const QUOTE_INTERVAL_MS = 10_000;

/** A persistent clock keeps the same ten-second cadence across refreshes. */
export function getQuoteClock(storage: Pick<Storage, 'getItem' | 'setItem'>, now: number): number {
  const value = storage.getItem(NOT_FOUND_QUOTE_KEY);
  const saved = value === null ? NaN : Number(value);
  if (Number.isSafeInteger(saved) && saved > 0 && saved <= now) return saved;
  storage.setItem(NOT_FOUND_QUOTE_KEY, String(now));
  return now;
}

export function quoteIndexAt(anchor: number, now: number): number {
  return Math.floor(Math.max(0, now - anchor) / QUOTE_INTERVAL_MS) % NOT_FOUND_QUOTES.length;
}
