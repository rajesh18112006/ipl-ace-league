import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronRight,
  Edit3,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  addMatchEntry,
  deleteMatchEntry,
  subscribeMatchEntries,
  subscribePlayers,
  updateMatchEntry,
} from '@/lib/storage';
import { IPL_SCHEDULE, IPL_TEAMS } from '@/lib/ipl-schedule';
import { Player, MatchEntry } from '@/lib/types';
import { isMatchFullyAssigned } from '@/lib/match-scoring';
import { toast } from 'sonner';
const START_DATE = '2026-04-03';
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type PlayerMode = 'unassigned' | 'rank' | 'not_played';

export default function MatchEntryPage() {
  const UNLOCK_PASSWORD = 'IPL_FANTASY_PLAY';

  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<MatchEntry[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [playerValues, setPlayerValues] = useState<Record<string, string>>({});
  const [tieSystemEnabled, setTieSystemEnabled] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);

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

const matchOptions = useMemo(() => {
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

  // Pick a good default selected match
  useEffect(() => {
    if (matchOptions.length === 0) {
      setSelectedMatchId('');
      return;
    }

    const stillExists = matchOptions.some((match) => match.id === selectedMatchId);
    if (stillExists) return;

    const todaysMatches = matchOptions.filter((match) => match.date === todayStr);
    if (todaysMatches.length > 0) {
      setSelectedMatchId(todaysMatches[0].id);
    } else {
      setSelectedMatchId(matchOptions[0].id);
    }
  }, [matchOptions, selectedMatchId, todayStr]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.matchId === selectedMatchId) || null,
    [entries, selectedMatchId]
  );

  const isLocked = selectedEntry?.status === 'Locked';

  const selectedMatch = useMemo(
    () => IPL_SCHEDULE.find((match) => match.id === selectedMatchId),
    [selectedMatchId]
  );

  const isFullyAssigned = selectedEntry
    ? isMatchFullyAssigned(selectedEntry, players)
    : false;

  useEffect(() => {
    setUnlockPassword('');
    setUnlockError(null);
    setShowUnlockPassword(false);
  }, [selectedMatchId]);

  useEffect(() => {
    if (!selectedMatchId) return;

    const existing = entries.find((entry) => entry.matchId === selectedMatchId) || null;
    const next: Record<string, string> = {};

    for (const player of players) {
      const value = existing?.rankings?.[player.id];
      if (typeof value === 'number') next[player.id] = String(value);
      else if (value === 'not_played') next[player.id] = 'not_played';
      else next[player.id] = '';
    }

    setPlayerValues(next);
    setTieSystemEnabled(existing?.tieSystemEnabled ?? false);
  }, [players, entries, selectedMatchId]);

  const getModeForValue = (value: string | undefined): PlayerMode => {
    if (!value) return 'unassigned';
    if (value === 'not_played') return 'not_played';
    if (value === 'rank') return 'rank';
    if (/^\d+$/.test(value)) return 'rank';
    return 'unassigned';
  };

  const buildRankingsData = (): {
    rankingsData: Record<string, number | 'not_played'>;
    filled: boolean;
  } => {
    const rankingsData: Record<string, number | 'not_played'> = {};
    let filled = true;

    for (const player of players) {
      const raw = playerValues[player.id] ?? '';

      if (raw === '') {
        filled = false;
        continue;
      }

      if (raw === 'rank') {
        filled = false;
        continue;
      }

      if (raw === 'not_played') {
        rankingsData[player.id] = 'not_played';
        continue;
      }

      if (!/^\d+$/.test(raw)) {
        filled = false;
        continue;
      }

      const rankNum = parseInt(raw, 10);
      if (!Number.isInteger(rankNum) || rankNum < 1 || rankNum > players.length) {
        filled = false;
        continue;
      }

      rankingsData[player.id] = rankNum;
    }

    return { rankingsData, filled };
  };

  const validateDuplicateRanks = (
    rankingsData: Record<string, number | 'not_played'>
  ): boolean => {
    const ranks: number[] = [];

    for (const player of players) {
      const value = rankingsData[player.id];
      if (typeof value === 'number') ranks.push(value);
    }

    const byRankCount: Record<number, number> = {};
    for (const rank of ranks) {
      byRankCount[rank] = (byRankCount[rank] || 0) + 1;
    }

    const hasDuplicates = Object.values(byRankCount).some((count) => count > 1);

    if (hasDuplicates && !tieSystemEnabled) {
      toast.error('Duplicate ranks detected. Enable tie system to allow ties.');
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    if (!selectedMatchId) {
      toast.error('Select a match');
      return;
    }

    if (players.length === 0) {
      toast.error('Add players first');
      return;
    }

    if (isLocked) {
      toast.error('This match is Locked. Unlock to edit.');
      return;
    }

    const { rankingsData } = buildRankingsData();
    if (!validateDuplicateRanks(rankingsData)) return;

    const existing = entries.find((entry) => entry.matchId === selectedMatchId);

    try {
      if (existing) {
        await updateMatchEntry(existing.id, {
          rankings: rankingsData,
          status: 'Draft',
          tieSystemEnabled,
        });
      } else {
        await addMatchEntry({
          matchId: selectedMatchId,
          date: selectedMatch?.date || '',
          rankings: rankingsData,
          status: 'Draft',
          tieSystemEnabled,
        });
      }

      toast.success('Draft saved!');
    } catch {
      toast.error('Failed to save draft');
    }
  };

  const handleFinalize = async () => {
    if (!selectedMatchId) {
      toast.error('Select a match');
      return;
    }

    if (players.length === 0) {
      toast.error('Add players first');
      return;
    }

    if (isLocked) {
      toast.error('This match is Locked.');
      return;
    }

    const { rankingsData, filled } = buildRankingsData();

    if (!filled) {
      toast.error('All players must be assigned a rank or marked as Not Played.');
      return;
    }

    if (!validateDuplicateRanks(rankingsData)) return;

    const existing = entries.find((entry) => entry.matchId === selectedMatchId);

    try {
      if (existing) {
        await updateMatchEntry(existing.id, {
          rankings: rankingsData,
          status: 'Locked',
          tieSystemEnabled,
        });
      } else {
        await addMatchEntry({
          matchId: selectedMatchId,
          date: selectedMatch?.date || '',
          rankings: rankingsData,
          status: 'Locked',
          tieSystemEnabled,
        });
      }

      toast.success('Match finalized and locked!');
    } catch {
      toast.error('Failed to finalize match');
    }
  };

  const handleUnlock = async () => {
    if (!selectedEntry) return;
    if (selectedEntry.status !== 'Locked') return;

    if (unlockPassword !== UNLOCK_PASSWORD) {
      setUnlockError('Incorrect password.');
      toast.error('Incorrect password.');
      return;
    }

    setUnlockError(null);

    try {
      await updateMatchEntry(selectedEntry.id, { status: 'Draft' });
      toast.success('Match unlocked. Save draft or finalize again.');
    } catch {
      toast.error('Failed to unlock match');
    }
  };

  const handleDelete = async (id: string, status?: string) => {
    if (status === 'Locked') {
      toast.error('This match is Locked. Unlock to edit.');
      return;
    }

    try {
      await deleteMatchEntry(id);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold gradient-text">
          Match Entry
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record rankings for each match
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="glass-card space-y-5 p-5"
      >
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">
            Select Match
          </label>

          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {matchOptions.map((match) => {
              const entry =
                entries.find((item) => item.matchId === match.id) || null;
              const fully = entry ? isMatchFullyAssigned(entry, players) : false;
              const isSelected = selectedMatchId === match.id;

              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setSelectedMatchId(match.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-transparent bg-secondary/20 hover:bg-secondary/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          #{match.matchNumber}
                        </span>
                        <span className="truncate text-sm font-medium">
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

                      <div className="mt-2 flex flex-wrap gap-2">
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

                            {!fully && (
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

                    <ChevronRight
                      size={16}
                      className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedMatch && (
          <div className="flex items-center justify-center gap-6 rounded-lg bg-secondary/50 py-3">
            <span className="text-2xl">
              {IPL_TEAMS[selectedMatch.team1]?.logo}
            </span>
            <span className="font-heading font-bold">
              {selectedMatch.team1} vs {selectedMatch.team2}
            </span>
            <span className="text-2xl">
              {IPL_TEAMS[selectedMatch.team2]?.logo}
            </span>
          </div>
        )}

        {selectedEntry && selectedEntry.status === 'Locked' && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-muted-foreground" />
                <p className="text-sm font-medium">
                  This match is Locked (read-only).
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Editing this match will recalculate leaderboard.
              </p>

              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground">
                  Secret password
                </label>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type={showUnlockPassword ? 'text' : 'password'}
                    value={unlockPassword}
                    onChange={(e) => {
                      setUnlockPassword(e.target.value);
                      setUnlockError(null);
                    }}
                    className="min-w-0 w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 sm:flex-1"
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    onClick={() => setShowUnlockPassword((value) => !value)}
                    className="w-full text-left text-xs text-primary hover:underline sm:w-auto"
                  >
                    {showUnlockPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {unlockError && (
                  <p className="text-xs text-destructive">{unlockError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleUnlock}
                disabled={!unlockPassword.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
              >
                <Unlock size={16} />
                Unlock Match
              </button>
            </div>
          </div>
        )}

        {players.length > 0 ? (
          <div className="space-y-3">
            <label className="block text-xs text-muted-foreground">
              Player Entry (Rank / Not Played)
            </label>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/20 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Tie System
                </p>
                <p className="text-xs text-muted-foreground">
                  Allow duplicate ranks.
                </p>
              </div>

              <Switch
                checked={tieSystemEnabled}
                onCheckedChange={setTieSystemEnabled}
                disabled={selectedEntry?.status === 'Locked'}
              />
            </div>

            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3">
                <span className="flex-1 truncate text-sm font-medium">
                  {player.name}
                </span>

                <select
                  value={getModeForValue(playerValues[player.id])}
                  onChange={(e) => {
                    if (selectedEntry?.status === 'Locked') return;

                    const mode = e.target.value as PlayerMode;

                    setPlayerValues((prev) => {
                      if (mode === 'unassigned') {
                        return { ...prev, [player.id]: '' };
                      }

                      if (mode === 'not_played') {
                        return { ...prev, [player.id]: 'not_played' };
                      }

                      const current = prev[player.id] ?? '';
                      const maybeRank = /^\d+$/.test(current) ? current : 'rank';
                      return { ...prev, [player.id]: maybeRank };
                    });
                  }}
                  disabled={selectedEntry?.status === 'Locked'}
                  className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="rank">Rank</option>
                  <option value="not_played">Not Played</option>
                </select>

                {getModeForValue(playerValues[player.id]) === 'rank' ? (
                  <input
                    type="number"
                    min={1}
                    max={players.length}
                    step={1}
                    placeholder="Rank #"
                    value={
                      /^\d+$/.test(playerValues[player.id] || '')
                        ? playerValues[player.id]
                        : ''
                    }
                    disabled={selectedEntry?.status === 'Locked'}
                    onChange={(e) => {
                      if (selectedEntry?.status === 'Locked') return;

                      const nextVal = e.target.value;

                      setPlayerValues((prev) => ({
                        ...prev,
                        [player.id]: nextVal === '' ? 'rank' : nextVal,
                      }));
                    }}
                    className="w-20 rounded-lg border border-border bg-secondary px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70"
                  />
                ) : (
                  <span className="rounded border border-border bg-secondary/20 px-2 py-1 text-xs text-muted-foreground">
                    {getModeForValue(playerValues[player.id]) === 'not_played'
                      ? 'Not Played'
                      : '—'}
                  </span>
                )}
              </div>
            ))}

            {!isLocked && selectedEntry && !isFullyAssigned && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                  ❌ Missing Data
                </p>
                <p className="mt-1 text-xs text-destructive/90">
                  Finalize is blocked until every player is assigned a rank or marked
                  as Not Played.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No players added yet.{' '}
            <a href="/players" className="text-primary hover:underline">
              Add players →
            </a>
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleSaveDraft}
            disabled={players.length === 0 || isLocked}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
          >
            🟡 Save Draft
          </button>

          <button
            onClick={handleFinalize}
            disabled={players.length === 0 || isLocked}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            ✅ Finalize Match
          </button>
        </div>
      </motion.div>

      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="glass-card p-5"
        >
          <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold">
            <CalendarDays size={16} className="text-accent" />
            Previous / Saved Entries
          </h2>

          <div className="space-y-3">
            {[...entries]
              .sort((a, b) => {
                const matchA = IPL_SCHEDULE.find((m) => m.id === a.matchId);
                const matchB = IPL_SCHEDULE.find((m) => m.id === b.matchId);

                const dateA = matchA?.date || '';
                const dateB = matchB?.date || '';

                if (dateA !== dateB) return dateB.localeCompare(dateA);

                const numA = matchA?.matchNumber || 0;
                const numB = matchB?.matchNumber || 0;

                return numB - numA;
              })
              .map((entry) => {
                const match = IPL_SCHEDULE.find((m) => m.id === entry.matchId);
                const fully = isMatchFullyAssigned(entry, players);

                return (
                  <div key={entry.id} className="rounded-lg bg-secondary/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {match
                          ? `${match.team1} vs ${match.team2}`
                          : 'Unknown Match'}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {match
                            ? new Date(`${match.date}T00:00:00`).toLocaleDateString(
                                'en-IN',
                                { day: 'numeric', month: 'short' }
                              )
                            : ''}
                        </span>

                        <button
                          onClick={() => setSelectedMatchId(entry.matchId)}
                          className="text-muted-foreground transition-colors hover:text-primary"
                          title="Open in editor"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(entry.id, entry.status)}
                          disabled={entry.status === 'Locked'}
                          className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                          title={
                            entry.status === 'Locked'
                              ? 'Unlock to delete'
                              : 'Delete entry'
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
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

                      {!fully && (
                        <Badge className="border-destructive/20 bg-destructive/10 text-destructive">
                          ❌ Missing Data
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {players.map((player) => {
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
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}