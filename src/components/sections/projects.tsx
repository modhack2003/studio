import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Star, GitFork } from 'lucide-react';
import { CardShell } from '@/components/card-shell';

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
    <section id="projects" className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <CardShell key={`db-${project.title}`}>
            <div className="flex flex-col p-6">
              <CardHeader>
                <CardTitle className="text-base">{project.title}</CardTitle>
                <CardDescription className="text-sm">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-border">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              {project.link && (
                <CardFooter className="-mt-4">
                  <Button asChild variant="link" className="h-auto p-0 text-sm">
                    <Link href={project.link} target="_blank" rel="noopener noreferrer">
                      View Project <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </div>
          </CardShell>
        ))}

        {githubRepos.map((repo) => (
          <CardShell key={`gh-${repo.id}`}>
            <div className="flex flex-col p-6">
              <CardHeader>
                <CardTitle className="text-base">
                  {repo.customTitle || repo.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {repo.customDescription || repo.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(repo.customTags && repo.customTags.length > 0 ? repo.customTags : repo.topics).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-border">{tag}</Badge>
                  ))}
                  {repo.language && (
                    <Badge variant="outline" className="text-xs border-border">
                      {repo.language}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" />{repo.stargazersCount}</span>
                  <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" />{repo.forksCount}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 -mt-4">
                <Button asChild variant="link" className="h-auto p-0 text-sm">
                  <Link href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
                    View on GitHub <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {repo.homepage && (
                  <Button asChild variant="outline" size="sm" className="text-sm">
                    <Link href={repo.homepage} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </div>
          </CardShell>
        ))}
      </div>
    </section>
  );
}