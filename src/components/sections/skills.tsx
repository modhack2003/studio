import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Terminal, BrainCircuit } from 'lucide-react';
import { CardShell } from '@/components/card-shell';

interface Skills {
  languages: string[];
  tools: string[];
  areas: string[];
}

export function SkillsSection({ skills }: { skills: Skills | null }) {
  if (!skills) return null;

  const skillSections = [
    { title: 'Languages', icon: Code, items: skills.languages },
    { title: 'Tools & Technologies', icon: Terminal, items: skills.tools },
    { title: 'Areas of Expertise', icon: BrainCircuit, items: skills.areas },
  ];

  return (
    <section id="skills" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {skillSections.map(section => (
          <CardShell key={section.title}>
            <div className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {section.items.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs border-border">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </div>
          </CardShell>
        ))}
      </div>
    </section>
  );
}