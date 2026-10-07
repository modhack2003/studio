import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SkillsSection } from '../skills';

jest.mock('lucide-react', () => ({ Code: () => null, Terminal: () => null, BrainCircuit: () => null }));

jest.mock('@/components/cyber/primitives', () => ({
  Reveal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TiltCard: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Marquee: () => null,
}));

test('keeps all skills reachable with an accessible expand/collapse control', () => {
  render(<SkillsSection skills={{ languages: ['Python'], tools: [], areas: Array.from({ length: 15 }, (_, i) => `Expertise ${i + 1}`) }} />);
  expect(screen.getByText('Expertise 6')).toBeVisible();
  expect(screen.queryByText('Expertise 7')).not.toBeInTheDocument();
  const expand = screen.getByRole('button', { name: 'Show all 15 (+9)' });
  expect(expand).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(expand);
  expect(screen.getByText('Expertise 15')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
  expect(screen.queryByText('Expertise 7')).not.toBeInTheDocument();
});

test('shows imported tools in their existing card and removes duplicate aliases', () => {
  render(<SkillsSection skills={{ languages: ['Python'], tools: [], areas: ['Python (Programming Language)', 'Tenable Nessus', 'Network Security'] }} />);
  expect(screen.getByRole('heading', { name: 'Tools & Technologies' })).toBeVisible();
  expect(screen.getAllByText('Python')).toHaveLength(1);
  expect(screen.queryByText('Python (Programming Language)')).not.toBeInTheDocument();
});
