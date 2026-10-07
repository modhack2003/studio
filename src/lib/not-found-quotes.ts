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
] as const;

export const NOT_FOUND_QUOTE_KEY = 'nd-404-next-quote';

/** Persist the next index, so reloads and return visits cycle without repeats. */
export function takeNotFoundQuote(storage: Pick<Storage, 'getItem' | 'setItem'>): number {
  const value = storage.getItem(NOT_FOUND_QUOTE_KEY);
  const parsed = value === null ? 0 : Number(value);
  const index = Number.isInteger(parsed) && parsed >= 0 && parsed < NOT_FOUND_QUOTES.length ? parsed : 0;
  storage.setItem(NOT_FOUND_QUOTE_KEY, String((index + 1) % NOT_FOUND_QUOTES.length));
  return index;
}
