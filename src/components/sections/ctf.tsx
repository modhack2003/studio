import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flag, Calendar, Users, Link as LinkIcon } from 'lucide-react';
import { CardShell } from '@/components/card-shell';

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
    <section id="ctf" className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <CardShell key={`${event.name}-${event.date}`}>
            <div className="flex flex-col p-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flag className="h-4 w-4" />
                    {event.name}
                  </CardTitle>
                  {event.placement && (
                    <Badge variant="outline" className="text-xs border-border">{event.placement}</Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 text-sm">
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
                    <Badge key={cat} variant="outline" className="text-xs border-border">
                      {cat}
                    </Badge>
                  ))}
                </div>
                {event.writeupUrl && (
                  <a
                    href={event.writeupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground text-sm"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" /> Read write-up
                  </a>
                )}
              </CardContent>
            </div>
          </CardShell>
        ))}
      </div>
    </section>
  );
}
