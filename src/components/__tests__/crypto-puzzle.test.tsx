import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CryptoPuzzle } from '../crypto-puzzle';
jest.mock('lucide-react', () => ({ Eye: () => null, Flag: () => null, Lock: () => null, RotateCcw: () => null }));
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test('progress begins at zero, advances, and ends with a game flag instead of an admin link', async () => {
  global.fetch = jest.fn().mockImplementation(async (_url, options) => {
    const { level } = JSON.parse(options.body);
    return { ok: true, json: async () => ({ correct: true, isLastLevel: level === 3, ...(level === 3 ? { flag: 'BIKRAM{no_secrets_in_the_archive}' } : {}) }) };
  });
  render(<CryptoPuzzle track="archive" />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  for (let level = 1; level <= 3; level++) {
    fireEvent.change(screen.getByLabelText('Decoded answer'), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: '>_ Verify' }));
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(level)));
  }
  expect(screen.getByText('BIKRAM{no_secrets_in_the_archive}')).toBeVisible();
  expect(document.querySelector('a[href="/bikram"]')).toBeNull();
  expect(screen.getByRole('link', { name: 'Follow another signal →' })).toHaveAttribute('href', '/root');
  fireEvent.click(screen.getByRole('button', { name: 'Restart sequence' }));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
});

test('wrong answers reveal a clue after three tries and a network error keeps the same lock', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ correct: false }) });
  render(<CryptoPuzzle />);
  for (let count = 1; count <= 3; count++) {
    fireEvent.change(screen.getByLabelText('Decoded answer'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: '>_ Verify' }));
    await waitFor(() => expect(screen.getByText(`ATTEMPTS // ${count}`)).toBeVisible());
  }
  expect(screen.getByRole('button', { name: 'Hide clue' })).toHaveAttribute('aria-expanded', 'true');
  jest.mocked(global.fetch).mockRejectedValueOnce(new Error('offline'));
  fireEvent.click(screen.getByRole('button', { name: '>_ Verify' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Uplink interrupted'));
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
});
