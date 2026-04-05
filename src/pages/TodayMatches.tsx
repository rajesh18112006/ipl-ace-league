import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { subscribeMatchEntries, subscribePlayers } from '@/lib/storage';
import { IPL_SCHEDULE } from '@/lib/ipl-schedule';
import { isMatchFullyAssigned } from '@/lib/match-scoring';
import { MatchEntry, Player } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const START_DATE = '2026-04-03';

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function TodayMatchesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<MatchEntry[]>([]);

  useEffect(() => {
    const unsubPlayers = subscribePlayers(
      setPlayers,
      () => toast.error('Failed to load players from Firebase')
    );

    const unsubEntries = subscribeMatchEntries(
      setEntries,
      () => toast.error('Failed to load match entries from Firebase')
    );

    return () => {
      unsubPlayers();
      unsubEntries();
    };
  }, []);

  const todayStr = useMemo(() => getLocalDateString(), []);

  const enteredMatchIds = useMemo(
    () => new Set(entries.map((entry) => entry.matchId)),
    [entries]
  );

  const eligibleMatches = useMemo(() => {
    return IPL_SCHEDULE.filter((match) => match.date >= START_DATE);
  }, []);

  const missedMatchIds = useMemo(() => {
    return new Set(
      eligibleMatches
        .filter(
          (match) => match.date < todayStr && !enteredMatchIds.has(match.id)
        )
        .map((match) => match.id)
    );
  }, [eligibleMatches, todayStr, enteredMatchIds]);

  const visibleMatches = useMemo(() => {
    return eligibleMatches
      .filter(
        (match) =>
          match.date >= todayStr ||
          enteredMatchIds.has(match.id) ||
          missedMatchIds.has(match.id)
      )
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.matchNumber - b.matchNumber;
      });
  }, [eligibleMatches, todayStr, enteredMatchIds, missedMatchIds]);

  const getEntry = (matchId: string) =>
    entries.find((entry) => entry.matchId === matchId) || null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-2xl font-bold gradient-text">
          All Matches
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Matches from your selected start date onward
        </p>
      </motion.div>

      {visibleMatches.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarDays
            size={48}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <p className="text-muted-foreground">No matches available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleMatches.map((match) => {
            const entry = getEntry(match.id);
            const fullyAssigned = entry
              ? isMatchFullyAssigned(entry, players)
              : false;

            const playersSorted = entry
              ? [...players].sort((a, b) => {
                  const valueA = entry.rankings?.[a.id];
                  const valueB = entry.rankings?.[b.id];

                  const rankA =
                    typeof valueA === 'number'
                      ? valueA
                      : valueA === 'not_played'
                        ? Number.MAX_SAFE_INTEGER - 1
                        : Number.MAX_SAFE_INTEGER;

                  const rankB =
                    typeof valueB === 'number'
                      ? valueB
                      : valueB === 'not_played'
                        ? Number.MAX_SAFE_INTEGER - 1
                        : Number.MAX_SAFE_INTEGER;

                  if (rankA !== rankB) return rankA - rankB;
                  return a.name.localeCompare(b.name);
                })
              : players;

            return (
              <div key={match.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        #{match.matchNumber}
                      </span>
                      <span className="font-heading font-bold">
                        {match.team1} vs {match.team2}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(`${match.date}T00:00:00`).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                        }
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {entry ? (
                      <>
                        {entry.status === 'Completed' && (
                          <Badge className="border-primary/20 bg-primary/10 text-primary">
                            ✅ Completed
                          </Badge>
                        )}

                        {entry.status === 'Draft' && (
                          <Badge className="border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                            🟡 Draft
                          </Badge>
                        )}

                        {entry.status === 'Locked' && (
                          <Badge className="border-border bg-secondary/50 text-foreground">
                            🔒 Locked
                          </Badge>
                        )}

                        {!fullyAssigned && (
                          <Badge className="border-destructive/20 bg-destructive/10 text-destructive">
                            ❌ Missing Data
                          </Badge>
                        )}
                      </>
                    ) : match.date < todayStr ? (
                      <Badge className="border-red-500/20 bg-red-500/10 text-red-400">
                        ⚠ Missed Entry
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border bg-secondary/20 text-muted-foreground"
                      >
                        ⏳ Upcoming
                      </Badge>
                    )}
                  </div>
                </div>

                {entry ? (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {playersSorted.map((player) => {
                        const value = entry.rankings?.[player.id];

                        const label =
                          typeof value === 'number'
                            ? `#${value}`
                            : value === 'not_played'
                              ? 'Not Played'
                              : '—';

                        const tone =
                          typeof value === 'number'
                            ? 'bg-primary/10 text-primary'
                            : value === 'not_played'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-destructive/15 text-destructive';

                        return (
                          <span
                            key={player.id}
                            className={`rounded px-2 py-1 text-xs ${tone}`}
                          >
                            {player.name}: {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-muted-foreground">
                    No entry yet. Use{' '}
                    <span className="font-medium text-primary">Match Entry</span>{' '}
                    to record this match.
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