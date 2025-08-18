import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PixelCard from '../pixel-card';

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
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
          <PixelCard key={project.title}>
            <div className="flex flex-col bg-transparent p-6 rounded-sm h-full">
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
            </div>
          </PixelCard>
        ))}
      </div>
    </section>
  );
}