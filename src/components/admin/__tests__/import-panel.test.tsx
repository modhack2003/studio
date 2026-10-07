import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ImportPanel } from '../import-panel';
import { api } from '../api-client';

jest.mock('../api-client', () => ({ api: jest.fn(), errorMessage: (e: Error) => e.message }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('lucide-react', () => ({ FileArchive: () => null, Upload: () => null, Loader2: () => null }));

const summary = {
  filesFound: ['Skills.csv'], profile: [], experience: { created: 0, updated: 0 },
  education: { created: 0, skipped: 0 }, certificates: { created: 0, updated: 0 },
  projects: { created: 0, skipped: 0 }, skills: { added: 1 }, dryRun: true,
};
const request = jest.mocked(api);
beforeEach(() => request.mockReset());

test('refreshes preview for changed overwrite settings before allowing import', async () => {
  request.mockResolvedValueOnce({ summary });
  const { container } = render(<ImportPanel />);
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [{ name: 'Skills.csv', size: 30, text: async () => 'Name\nPython' }] },
  });
  await screen.findByRole('button', { name: 'Import now' });
  let resolvePreview!: (value: unknown) => void;
  request.mockImplementationOnce(() => new Promise((resolve) => { resolvePreview = resolve; }));
  fireEvent.click(screen.getByRole('switch', { name: 'Overwrite profile' }));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith('/api/import/linkedin', expect.objectContaining({
    body: expect.objectContaining({ dryRun: true, overwriteProfile: false }),
  })));
  expect(screen.queryByRole('button', { name: 'Import now' })).not.toBeInTheDocument();
  resolvePreview({ summary });
  await screen.findByRole('button', { name: 'Import now' });
  request.mockResolvedValueOnce({ summary: { ...summary, dryRun: false } });
  fireEvent.click(screen.getByRole('button', { name: 'Import now' }));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith('/api/import/linkedin', expect.objectContaining({
    body: expect.objectContaining({ dryRun: false, overwriteProfile: false }),
  })));
  await screen.findByText('// imported');
});

test('rejects oversized exports before reading or sending them', async () => {
  const read = jest.fn();
  const { container } = render(<ImportPanel />);
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [{ name: 'export.zip', size: 50_000_001, arrayBuffer: read }] },
  });
  await waitFor(() => expect(screen.getByRole('button', { name: /Choose export/ })).toBeEnabled());
  expect(read).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});
