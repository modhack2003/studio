import { NOT_FOUND_QUOTES, NOT_FOUND_QUOTE_KEY, getQuoteClock, quoteIndexAt } from '../not-found-quotes';

describe('lost-route quote clock', () => {
  const now = 1_790_000_000_000;
  beforeEach(() => sessionStorage.clear());

  it('has twenty distinct quotes and changes at ten-second boundaries', () => {
    expect(new Set(NOT_FOUND_QUOTES).size).toBe(20);
    expect(quoteIndexAt(now, now + 9999)).toBe(0);
    expect(quoteIndexAt(now, now + 10000)).toBe(1);
    expect(quoteIndexAt(now, now + 199999)).toBe(19);
    expect(quoteIndexAt(now, now + 200000)).toBe(0);
  });

  it('preserves the clock on refresh and catches up after an inactive tab', () => {
    expect(getQuoteClock(sessionStorage, now)).toBe(now);
    const anchor = getQuoteClock(sessionStorage, now + 17000);
    expect(anchor).toBe(now);
    expect(quoteIndexAt(anchor, now + 20000)).toBe(2);
    expect(quoteIndexAt(anchor, now + 65000)).toBe(6);
  });

  it.each(['NaN', '-1', '0', '1.5', 'Infinity', String(now + 1)])('recovers from an invalid saved clock: %s', (value) => {
    sessionStorage.setItem(NOT_FOUND_QUOTE_KEY, value);
    expect(getQuoteClock(sessionStorage, now)).toBe(now);
  });
});
