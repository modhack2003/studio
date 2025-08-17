import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { skills } from '@/lib/data';
import { Code, Terminal, BrainCircuit } from 'lucide-react';
import { PixelCard } from '../pixel-card';

const skillSections = [
    { title: 'Languages', icon: Code, items: skills.languages },
    { title: 'Tools & Technologies', icon: Terminal, items: skills.tools },
    { title: 'Areas of Expertise', icon: BrainCircuit, items: skills.areas },
]

export function SkillsSection() {
  return (
    <section id="skills" className="space-y-12">
        <div className="text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-glow">
            [ My Arsenal ]
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            The languages, tools, and technologies I use to build and secure applications.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {skillSections.map(section => (
                <PixelCard key={section.title}>
                  <div className="bg-card p-6 rounded-sm h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-code text-lg">
                            <section.icon className="text-primary" />
                            {section.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {section.items.map(skill => (
                            <Badge key={skill} variant="outline" className="font-code text-sm border-primary/50 text-primary/90">
                                {skill}
                            </Badge>
                        ))}
                    </CardContent>
                    </div>
                </PixelCard>
            ))}
        </div>
    </section>
  );
}
