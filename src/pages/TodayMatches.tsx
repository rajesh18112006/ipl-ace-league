import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { getPlayers, getMatchEntries } from '@/lib/storage';
import { IPL_SCHEDULE } from '@/lib/ipl-schedule';
import { isMatchFullyAssigned } from '@/lib/match-scoring';
import { MatchEntry, Player } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function TodayMatchesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<MatchEntry[]>([]);

  useEffect(() => {
    setPlayers(getPlayers());
    setEntries(getMatchEntries());
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const matchesFromToday = useMemo(
    () => IPL_SCHEDULE.filter(m => m.date >= todayStr),
    [todayStr],
  );

  const getEntry = (matchId: string) => entries.find(e => e.matchId === matchId) || null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold gradient-text">Today Matches</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Matches from today onward (showing previously entered ranks)
        </p>
      </motion.div>

      {matchesFromToday.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarDays size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No matches scheduled from today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matchesFromToday.map(m => {
            const entry = getEntry(m.id);
            const fully = entry ? isMatchFullyAssigned(entry, players) : false;
            const playersSorted = entry
              ? [...players].sort((a, b) => {
                  const va = entry.rankings?.[a.id];
                  const vb = entry.rankings?.[b.id];

                  const rankA = typeof va === 'number' ? va : va === 'not_played' ? Number.MAX_SAFE_INTEGER - 1 : Number.MAX_SAFE_INTEGER;
                  const rankB = typeof vb === 'number' ? vb : vb === 'not_played' ? Number.MAX_SAFE_INTEGER - 1 : Number.MAX_SAFE_INTEGER;

                  if (rankA !== rankB) return rankA - rankB;
                  // Tie-break by name for a stable, non-random UI.
                  return a.name.localeCompare(b.name);
                })
              : players;

            return (
              <div key={m.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">#{m.matchNumber}</span>
                      <span className="font-heading font-bold">
                        {m.team1} vs {m.team2}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(m.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {entry ? (
                      <>
                        {entry.status === 'Completed' && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">✅ Completed</Badge>
                        )}
                        {entry.status === 'Draft' && (
                          <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">🟡 Draft</Badge>
                        )}
                        {entry.status === 'Locked' && (
                          <Badge className="bg-secondary/50 text-foreground border-border">🔒 Locked</Badge>
                        )}
                        {!fully && (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20">❌ Missing Data</Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-secondary/20 text-muted-foreground border-border">
                        ⏳ Upcoming
                      </Badge>
                    )}
                  </div>
                </div>

                {entry ? (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {playersSorted.map(p => {
                        const v = entry.rankings?.[p.id];
                        const label =
                          typeof v === 'number'
                            ? `#${v}`
                            : v === 'not_played'
                              ? 'Not Played'
                              : '—';
                        const tone =
                          typeof v === 'number'
                            ? 'bg-primary/10 text-primary'
                            : v === 'not_played'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-destructive/15 text-destructive';
                        return (
                          <span key={p.id} className={`text-xs px-2 py-1 rounded ${tone}`}>
                            {p.name}: {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-muted-foreground">
                    No entry yet. Use <span className="text-primary font-medium">Match Entry</span> to record today’s match.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

