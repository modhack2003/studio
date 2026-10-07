export interface SkillGroups {
  languages: string[];
  tools: string[];
  areas: string[];
}

const aliases: Record<string, string> = {
  'python (programming language)': 'Python',
  'react.js': 'React',
  'reactjs': 'React',
  'express.js': 'Express.js',
  'seim': 'SIEM',
  'mean stack': 'MEAN Stack',
  'cascading style sheets (css)': 'CSS',
};
const languages = new Set(['javascript', 'typescript', 'html', 'css', 'python', 'java', 'php', 'ejs', 'sql', 'bash', 'c', 'c++', 'c#', 'go', 'rust']);
const tools = new Set(['tenable nessus', 'kali linux', 'wireshark', 'cisco routers', 'cisco ios', 'wireless routers', 'network switches', 'tailwind css', 'github', 'mean stack', 'express.js', 'anaconda', 'fastapi', 'mysql', 'react', 'angularjs', 'angular cli', 'node.js', 'npm']);

/** Normalize imported aliases and classify only known languages/tools.
 * Existing manual categories remain the fallback for unfamiliar entries.
 */
export function organizeSkills(input: SkillGroups): SkillGroups {
  const result: SkillGroups = { languages: [], tools: [], areas: [] };
  const seen = new Set<string>();
  for (const category of ['languages', 'tools', 'areas'] as const) {
    for (const raw of input[category]) {
      const trimmed = raw.trim().replace(/\s+/g, ' ');
      const name = aliases[trimmed.toLowerCase()] ?? trimmed;
      const key = name.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const target = languages.has(key) ? 'languages' : tools.has(key) ? 'tools' : category;
      result[target].push(name);
    }
  }
  return result;
}
