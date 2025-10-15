import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PixelCard from '../pixel-card';
import { AnimatedTitle } from '@/components/animated-title';

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

interface GitHubRepository {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  topics: string[];
  stargazersCount: number;
  forksCount: number;
  homepage: string | null;
  customTitle: string | null;
  customDescription: string | null;
  customTags: string[];
  displayOrder: number | null;
}

export function ProjectsSection({ projects, githubRepos }: { projects: Project[], githubRepos: GitHubRepository[] }) {
  return (
    <section id="projects" className="space-y-12">
      <div className="text-center">
        <AnimatedTitle title="My Projects" />
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          A selection of my work. See what I&apos;ve been building.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Database Projects */}
        {projects.map((project) => (
          <PixelCard key={`db-${project.title}`}>
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
                      View Project <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </div>
          </PixelCard>
        ))}
        
        {/* GitHub Repositories */}
        {githubRepos.map((repo) => (
          <PixelCard key={`gh-${repo.id}`}>
            <div className="flex flex-col bg-transparent p-6 rounded-sm h-full">
              <CardHeader>
                <CardTitle className="font-code text-primary">
                  {repo.customTitle || repo.name}
                </CardTitle>
                <CardDescription>
                  {repo.customDescription || repo.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Custom tags or GitHub topics */}
                  {(repo.customTags && repo.customTags.length > 0 ? repo.customTags : repo.topics).map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-code bg-primary/10 text-primary">{tag}</Badge>
                  ))}
                  {/* Language badge */}
                  {repo.language && (
                    <Badge variant="outline" className="font-code text-xs">
                      {repo.language}
                    </Badge>
                  )}
                </div>
                {/* GitHub stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>⭐ {repo.stargazersCount}</span>
                  <span>🍴 {repo.forksCount}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-glow-accent flex-1">
                  <Link href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
                    View on GitHub <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {repo.homepage && (
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={repo.homepage} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </div>
          </PixelCard>
        ))}
      </div>
    </section>
  );
}