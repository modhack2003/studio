import { NOT_FOUND_QUOTES, NOT_FOUND_QUOTE_KEY, takeNotFoundQuote } from '../not-found-quotes';

describe('lost-route quote rotation', () => {
  beforeEach(() => sessionStorage.clear());

  it('cycles through ten distinct quotes and wraps on the next visit', () => {
    expect(new Set(NOT_FOUND_QUOTES).size).toBe(10);
    expect(Array.from({ length: 11 }, () => takeNotFoundQuote(sessionStorage))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
  });

  it.each(['NaN', '-1', '10', '1.5', 'Infinity'])('recovers from an invalid saved index: %s', (value) => {
    sessionStorage.setItem(NOT_FOUND_QUOTE_KEY, value);
    expect(takeNotFoundQuote(sessionStorage)).toBe(0);
    expect(takeNotFoundQuote(sessionStorage)).toBe(1);
  });
});
