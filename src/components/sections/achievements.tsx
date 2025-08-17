'use client'

import type { GithubAchievementsFetchOutput } from '@/ai/flows/summarize-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

interface AchievementsSectionProps {
    achievementsData: {achievements: string} | null;
}

export function AchievementsSection({ achievementsData }: AchievementsSectionProps) {
  return (
    <section id="achievements" className="space-y-12">
        <div className="text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-glow">
            [ GitHub Achievements ]
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Trophies and milestones from my coding journey on GitHub.
            </p>
        </div>
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-code text-lg">
            <Trophy className="text-primary"/>
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievementsData ? (
             <p className="text-muted-foreground font-body whitespace-pre-line">{achievementsData.achievements}</p>
          ) : (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
