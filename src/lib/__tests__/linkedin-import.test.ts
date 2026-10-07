import type { Prisma } from '@prisma/client';
import { parseCsv, parseLinkedInExport, importLinkedIn } from '@/lib/linkedin-import';

function database() {
  return {
    personalData: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn() },
    experience: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn(), update: jest.fn() },
    education: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn() },
    certificate: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn(), update: jest.fn() },
    project: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn() },
    skill: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(), update: jest.fn() },
  };
}

test('reads BOM, CRLF, quoted commas, embedded newlines, escaped quotes and Unicode', () => {
  expect(parseCsv('\uFEFFName,Notes\r\nBikram,"First, line\nSecond ""quoted"" বাংলা"\r\n')).toEqual([
    ['Name', 'Notes'], ['Bikram', 'First, line\nSecond "quoted" বাংলা'],
  ]);
  expect(() => parseCsv('Name,Notes\nBikram,"unfinished')).toThrow(/unclosed quoted field/);
});

test('dedupes repeated experience/certifications identically in preview and save', async () => {
  const parsed = parseLinkedInExport({
    'Positions.csv': 'Company Name,Title,Description,Started On\nExample,Engineer,First,Jan 2023\nexample,Engineer,Latest,Jan 2023',
    'Certifications.csv': 'Name,Authority,Started On\nCEH,Issuer,2026\nceh,Issuer,2026',
  });
  const db = database();
  const preview = await importLinkedIn(db as unknown as Prisma.TransactionClient, parsed, { dryRun: true });
  expect(db.experience.create).not.toHaveBeenCalled();
  expect(db.certificate.create).not.toHaveBeenCalled();
  const saved = await importLinkedIn(db as unknown as Prisma.TransactionClient, parsed);
  expect(preview.experience).toEqual({ created: 1, updated: 0 });
  expect(saved.experience).toEqual(preview.experience);
  expect(saved.certificates).toEqual(preview.certificates);
  expect(db.experience.create).toHaveBeenCalledTimes(1);
  expect(db.experience.create.mock.calls[0][0].data.description).toBe('Latest');
  expect(db.certificate.create).toHaveBeenCalledTimes(1);
});

test('does not confuse records containing a delimiter in their name', async () => {
  const parsed = parseLinkedInExport({ 'Positions.csv': 'Company Name,Title\nA|B,C\nA,B|C' });
  const summary = await importLinkedIn(database() as unknown as Prisma.TransactionClient, parsed, { dryRun: true });
  expect(summary.experience.created).toBe(2);
});

test('skips a repeated institution without a degree within the same export', async () => {
  const parsed = parseLinkedInExport({ 'Education.csv': 'School Name,Degree Name\nUniversity,BA\nUniversity,' });
  const db = database();
  expect((await importLinkedIn(db as unknown as Prisma.TransactionClient, parsed)).education).toEqual({ created: 1, skipped: 1 });
  expect(db.education.create).toHaveBeenCalledTimes(1);
});

test('classifies imported skills and preserves existing manual entries', async () => {
  const db = database();
  db.skill.findFirst.mockResolvedValue({ id: 'skills', languages: ['Python'], tools: ['Custom tool'], areas: ['Network Security'] });
  const parsed = parseLinkedInExport({ 'Skills.csv': 'Name\nPython (Programming Language)\nReact.js\nJava\nSEIM' });
  const summary = await importLinkedIn(db as unknown as Prisma.TransactionClient, parsed);
  expect(summary.skills.added).toBe(3);
  expect(db.skill.update).toHaveBeenCalledWith({ where: { id: 'skills' }, data: { languages: ['Python', 'Java'], tools: ['Custom tool', 'React'], areas: ['Network Security', 'SIEM'] } });
});
