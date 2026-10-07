import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { SkillsPanel } from '../skills-panel';
import { ProfilePanel } from '../profile-panel';
import { api } from '../api-client';

const toast = jest.fn();
jest.mock('../api-client', () => ({ api: jest.fn(), errorMessage: (e: Error) => e.message }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
jest.mock('lucide-react', () => ({ ExternalLink: () => null, Upload: () => null, Loader2: () => null }));
const request = jest.mocked(api);
beforeEach(() => request.mockReset());

test('prevents empty skill saves after a failed read and restores editing after retry', async () => {
  request.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ languages: ['Python'], tools: [], areas: [] });
  render(<SkillsPanel />);
  const retry = await screen.findByRole('button', { name: 'Retry loading' });
  expect(screen.queryByRole('button', { name: 'Save skills' })).not.toBeInTheDocument();
  fireEvent.click(retry);
  expect(await screen.findByDisplayValue('Python')).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Save skills' })).toBeEnabled();
});

test('does not present a failed profile read as a missing profile', async () => {
  request.mockRejectedValueOnce(new Error('offline'));
  render(<ProfilePanel />);
  await screen.findByRole('button', { name: 'Retry loading' });
  expect(screen.queryByRole('button', { name: 'Create profile' })).not.toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(1);
});
