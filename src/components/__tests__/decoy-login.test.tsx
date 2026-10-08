import { render, screen, fireEvent, act } from '@testing-library/react';
import { DecoyLogin } from '../decoy-login';
jest.mock('lucide-react', () => ({ Lock: () => null, Terminal: () => null }));

test('decoy discards entered values, denies access, and makes no network request', () => {
  jest.useFakeTimers();
  const originalFetch = global.fetch;
  global.fetch = jest.fn();
  try {
    render(<DecoyLogin />);
    fireEvent.change(screen.getByLabelText('Operator ID'), { target: { value: 'test-user' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'disposable-test-input' } });
    fireEvent.click(screen.getByRole('button', { name: '>_ Authenticate' }));
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Operator ID')).toHaveValue('');
    act(() => jest.advanceTimersByTime(1100));
    expect(screen.getByRole('status')).toHaveTextContent('Access denied');
    expect(global.fetch).not.toHaveBeenCalled();
  } finally { global.fetch = originalFetch; jest.useRealTimers(); }
});

test('PIN-only decoy remains usable and clears its timer when leaving', () => {
  jest.useFakeTimers();
  try {
    const { unmount } = render(<DecoyLogin pinOnly />);
    expect(screen.queryByLabelText('Operator ID')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('PIN'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: '>_ Authenticate' }));
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  } finally { jest.useRealTimers(); }
});
