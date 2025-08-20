import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';
import PixelCard from '../pixel-card';
import { AnimatedTitle } from '@/components/animated-title';

interface AchievementsSectionProps {
    achievementsData: {achievements: string} | null;
}

export function AchievementsSection({ achievementsData }: AchievementsSectionProps) {
  return (
    <section id="achievements" className="space-y-12">
        <div className="text-center">
            <AnimatedTitle title="GitHub Achievements" />
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Trophies and milestones from my coding journey on GitHub.
            </p>
        </div>
      <PixelCard>
        <div className="bg-transparent p-6 rounded-sm">
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
        </div>
      </PixelCard>
    </section>
  );
}