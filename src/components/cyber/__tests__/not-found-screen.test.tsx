import { act, fireEvent, render, screen } from '@testing-library/react';
import { NotFoundScreen } from '../not-found-screen';
import { NOT_FOUND_QUOTES } from '@/lib/not-found-quotes';

jest.mock('next/dynamic', () => () => function Eye() { return <div />; });

describe('404 quote rotation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-07T13:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('rotates on schedule, keeps the refresh cadence, and clears its timer on unmount', () => {
    const first = render(<NotFoundScreen />);
    act(() => jest.advanceTimersByTime(17000));
    expect(screen.getByRole('blockquote')).toHaveTextContent(NOT_FOUND_QUOTES[1]);
    first.unmount();
    expect(jest.getTimerCount()).toBe(0);
    const refreshed = render(<NotFoundScreen />);
    expect(screen.getByRole('blockquote')).toHaveTextContent(NOT_FOUND_QUOTES[1]);
    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByRole('blockquote')).toHaveTextContent(NOT_FOUND_QUOTES[2]);
    refreshed.unmount();
  });

  it('lets readers pause and resume the changing quotes', () => {
    render(<NotFoundScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause quotes' }));
    act(() => jest.advanceTimersByTime(30000));
    expect(screen.getByRole('blockquote')).toHaveTextContent(NOT_FOUND_QUOTES[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Resume quotes' }));
    expect(screen.getByRole('blockquote')).toHaveTextContent(NOT_FOUND_QUOTES[3]);
  });
});
