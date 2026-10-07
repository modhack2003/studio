import { organizeSkills } from '@/lib/skill-groups';

test('separates imported languages and tools, deduping aliases against manual skills', () => {
  const result = organizeSkills({ languages: ['Python', 'JavaScript'], tools: [], areas: ['Python (Programming Language)', 'TypeScript', 'React.js', 'Tenable Nessus', 'SEIM', 'Network Security', '  Wireshark  '] });
  expect(result).toEqual({ languages: ['Python', 'JavaScript', 'TypeScript'], tools: ['React', 'Tenable Nessus', 'Wireshark'], areas: ['SIEM', 'Network Security'] });
});
test('keeps unfamiliar labels in the manually chosen category and is idempotent', () => {
  const result = organizeSkills({ languages: ['EJS'], tools: ['Custom Tool'], areas: ['mobaxstrem', '  ', 'NETWORK SECURITY', 'network security'] });
  expect(result).toEqual({ languages: ['EJS'], tools: ['Custom Tool'], areas: ['mobaxstrem', 'NETWORK SECURITY'] });
  expect(organizeSkills(result)).toEqual(result);
});
