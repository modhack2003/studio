import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InsightsPanel } from '../insights-panel';
import { api } from '../api-client';
jest.mock('lucide-react', () => ({ Loader2: () => null }));
jest.mock('../api-client', () => ({ api: jest.fn(), errorMessage: (e: Error) => e.message }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
const state = { enabled: true, autoPublish: false, lastSuccess: null, lastError: null, lastCreated: 0, running: false };
beforeEach(() => jest.clearAllMocks());
test('defaults to draft review and refreshes the blog list after month import', async () => {
  jest.mocked(api).mockImplementation(async (_path, options) => options?.method === 'POST' ? { created: 8, skipped: false } as never : state as never);
  const onImported = jest.fn(); render(<InsightsPanel onImported={onImported} />);
  expect(await screen.findByRole('switch', { name: 'Auto-publish new Security Insights' })).toHaveAttribute('aria-checked', 'false');
  fireEvent.click(screen.getByRole('button', { name: 'Import past month' }));
  await waitFor(() => expect(onImported).toHaveBeenCalledTimes(1));
  expect(api).toHaveBeenCalledWith('/api/insights', { method: 'POST', body: { backfill: true } });
});
test('failed status loads show retry without enabling settings', async () => {
  jest.mocked(api).mockRejectedValue(new Error('Offline'));
  render(<InsightsPanel onImported={jest.fn()} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
  expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reload automation settings' })).toBeEnabled();
});
