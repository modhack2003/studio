import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CertificateList } from '../certificate-list';

jest.mock('@/components/cyber/primitives', () => ({
  Reveal: ({ children }: { children: ReactNode }) => <li>{children}</li>,
}));

test('shows four certificates and preserves the rest behind a native disclosure', () => {
  const certificates = Array.from({ length: 9 }, (_, i) => ({ name: `Certificate ${i + 1}`, issuer: 'Issuer', year: 2026, url: `https://example.com/${i}` }));
  render(<CertificateList certificates={certificates} />);
  expect(screen.getByText('Certificate 1').closest('ul')?.children).toHaveLength(4);
  expect(screen.getByText('Show all 9 certificates (+5)')).toBeVisible();
  expect(screen.getByText('Certificate 9')).not.toBeVisible();
  const details = screen.getByText('Certificate 9').closest('details')!;
  details.open = true;
  expect(screen.getByText('Certificate 9')).toBeVisible();
  expect(screen.getByRole('link', { name: /Certificate 9/ })).toHaveAttribute('href', 'https://example.com/8');
  details.open = false;
  expect(screen.getByText('Certificate 1').closest('ul')?.children).toHaveLength(4);
});

test('does not add an unnecessary disclosure for a short list', () => {
  render(<CertificateList certificates={[{ name: 'CEH', issuer: 'EC-Council', year: 2026 }]} />);
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.queryByText(/Show all/)).not.toBeInTheDocument();
});
