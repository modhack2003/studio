import { act, render, screen } from '@testing-library/react';
import { HomeFooterQuote } from '../home-footer-quote';
import { NOT_FOUND_QUOTES } from '@/lib/not-found-quotes';

let pathname = '/';
jest.mock('next/navigation', () => ({ usePathname: () => pathname }));

beforeEach(() => {
  pathname = '/';
  sessionStorage.clear();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-07T13:00:00Z'));
});
afterEach(() => jest.useRealTimers());

test('shows the larger home quote, hands off the outgoing quote, and keeps the clock', () => {
  const view = render(<HomeFooterQuote />);
  expect(screen.getByText(/One last thought/)).toBeVisible();
  expect(screen.getByRole('blockquote')).toHaveClass('text-2xl');
  act(() => jest.advanceTimersByTime(10000));
  expect(view.container.querySelector('.quote-copy')).toHaveTextContent(NOT_FOUND_QUOTES[1]);
  expect(view.container.querySelector('.quote-outgoing')).toHaveTextContent(NOT_FOUND_QUOTES[0]);
  expect(view.container.querySelector('.quote-outgoing')).toHaveAttribute('aria-hidden', 'true');
  view.unmount();
  expect(jest.getTimerCount()).toBe(0);
});

test.each(['/admin', '/blog/post', '/missing-page'])('does not duplicate quotes on %s', (path) => {
  pathname = path;
  const view = render(<HomeFooterQuote />);
  expect(view.container).toBeEmptyDOMElement();
  expect(jest.getTimerCount()).toBe(0);
});
