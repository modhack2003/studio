import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flag, Calendar, Users, Link as LinkIcon } from 'lucide-react';
import PixelCard from '../pixel-card';
import { AnimatedTitle } from '@/components/animated-title';

export interface CtfEvent {
  id: string;
  name: string;
  organizer: string;
  date: string; // ISO date
  placement?: string; // e.g., "Top 5%", "Rank #42"
  team?: string;
  writeupUrl?: string;
  categories: string[]; // e.g., ["Web", "Crypto", "Forensics"]
  points?: number;
}

export function CtfSection({ events }: { events: CtfEvent[] }) {
  if (!events || events.length === 0) return null;

  return (
    <section id="ctf" className="space-y-12">
      <div className="text-center">
        <AnimatedTitle title="CTF Competitions" />
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Competitive cybersecurity challenges I have participated in and highlights.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <PixelCard key={`${event.name}-${event.date}`}>
            <div className="flex flex-col bg-transparent p-6 rounded-sm h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-code text-primary flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    {event.name}
                  </CardTitle>
                  {event.placement ? (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">{event.placement}</Badge>
                  ) : null}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> {event.organizer}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  {event.team && (
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {event.team}</span>
                  )}
                  {typeof event.points === 'number' && (
                    <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> {event.points} pts</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.categories.map((cat) => (
                    <Badge key={cat} variant="outline" className="font-code text-xs border-primary/50 text-primary/90">
                      {cat}
                    </Badge>
                  ))}
                </div>
                {event.writeupUrl && (
                  <a
                    href={event.writeupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-accent hover:text-glow-accent text-sm"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" /> Read write-up
                  </a>
                )}
              </CardContent>
            </div>
          </PixelCard>
        ))}
      </div>
    </section>
  );
}
