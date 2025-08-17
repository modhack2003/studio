import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { projects } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ProjectsSection() {
  return (
    <section id="projects" className="space-y-12">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-glow">
          [ My Projects ]
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          A selection of my work. See what I've been building.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.title} className="flex flex-col bg-card/50 border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="font-code text-primary">{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-code bg-primary/10 text-primary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            {project.link && (
              <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-glow-accent">
                  <Link href={project.link} target="_blank" rel="noopener noreferrer">
                    View on GitHub <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
