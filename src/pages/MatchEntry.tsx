import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronRight, Edit3, Lock, Unlock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { addMatchEntry, deleteMatchEntry, subscribeMatchEntries, subscribePlayers, updateMatchEntry } from '@/lib/storage';
import { IPL_SCHEDULE, IPL_TEAMS, getTodayMatch } from '@/lib/ipl-schedule';
import { Player, MatchEntry } from '@/lib/types';
import { isMatchFullyAssigned } from '@/lib/match-scoring';
import { toast } from 'sonner';

export default function MatchEntryPage() {
  // Secret unlock password (frontend-only; app is intended for private use).
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
    const unsubPlayers = subscribePlayers(setPlayers, () => toast.error('Failed to load players from Firebase'));
    const unsubEntries = subscribeMatchEntries(setEntries, () => toast.error('Failed to load match entries from Firebase'));
    // Default to today's match
    const todayMatch = getTodayMatch();
    if (todayMatch) setSelectedMatchId(todayMatch.id);
    else if (IPL_SCHEDULE.length > 0) setSelectedMatchId(IPL_SCHEDULE[0].id);
    return () => {
      unsubPlayers();
      unsubEntries();
    };
  }, []);

  const selectedEntry = useMemo(
    () => entries.find(e => e.matchId === selectedMatchId) || null,
    [entries, selectedMatchId],
  );

  const isLocked = selectedEntry?.status === 'Locked';

  const selectedMatch = IPL_SCHEDULE.find(m => m.id === selectedMatchId);
  const isFullyAssigned = selectedEntry ? isMatchFullyAssigned(selectedEntry, players) : false;

  const matchOptions = useMemo(() => {
    const today = getTodayMatch();
    if (today) return [today];
    // Fallback: show the first scheduled match if "today" doesn't exist
    return IPL_SCHEDULE.length > 0 ? [IPL_SCHEDULE[0]] : [];
  }, []);

  useEffect(() => {
    setUnlockPassword('');
    setUnlockError(null);
    setShowUnlockPassword(false);
  }, [selectedMatchId]);

  // Initialize per-player editor state whenever the selected match changes.
  useEffect(() => {
    if (!selectedMatchId) return;
    const existing = entries.find(e => e.matchId === selectedMatchId) || null;
    const next: Record<string, string> = {};
    for (const p of players) {
      const v = existing?.rankings?.[p.id];
      if (typeof v === 'number') next[p.id] = String(v);
      else if (v === 'not_played') next[p.id] = 'not_played';
      else next[p.id] = '';
    }
    setPlayerValues(next);
    setTieSystemEnabled(existing?.tieSystemEnabled ?? false);
  }, [players, entries, selectedMatchId]);

  type PlayerMode = 'unassigned' | 'rank' | 'not_played';

  const getModeForValue = (v: string | undefined): PlayerMode => {
    if (!v) return 'unassigned';
    if (v === 'not_played') return 'not_played';
    if (v === 'rank') return 'rank';
    if (/^\d+$/.test(v)) return 'rank';
    return 'unassigned';
  };

  const buildRankingsData = (): {
    rankingsData: Record<string, number | 'not_played'>;
    filled: boolean;
  } => {
    const rankingsData: Record<string, number | 'not_played'> = {};
    let filled = true;

    for (const p of players) {
      const raw = playerValues[p.id] ?? '';
      if (raw === '') {
        filled = false;
        continue; // unassigned
      }
      if (raw === 'rank') {
        filled = false; // Rank selected but not entered yet.
        continue;
      }
      if (raw === 'not_played') {
        rankingsData[p.id] = 'not_played';
        continue;
      }

      // Numeric => rank
      if (!/^\d+$/.test(raw)) {
        filled = false;
        continue;
      }
      const rankNum = parseInt(raw, 10);
      if (!Number.isInteger(rankNum) || rankNum < 1 || rankNum > players.length) {
        filled = false;
        continue;
      }
      rankingsData[p.id] = rankNum;
    }

    return { rankingsData, filled };
  };

  const validateDuplicateRanks = (rankingsData: Record<string, number | 'not_played'>): boolean => {
    const ranks: number[] = [];
    for (const p of players) {
      const v = rankingsData[p.id];
      if (typeof v === 'number') ranks.push(v);
    }
    const byRankCount: Record<number, number> = {};
    for (const r of ranks) byRankCount[r] = (byRankCount[r] || 0) + 1;
    const hasDuplicates = Object.values(byRankCount).some(c => c > 1);
    if (hasDuplicates && !tieSystemEnabled) {
      toast.error('Duplicate ranks detected. Enable tie system to allow ties.');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!selectedMatchId) return toast.error('Select a match');
    if (players.length === 0) return toast.error('Add players first');
    if (isLocked) return toast.error('This match is Locked. Unlock to edit.');

    const { rankingsData } = buildRankingsData();
    if (!validateDuplicateRanks(rankingsData)) return;

    const existing = entries.find(e => e.matchId === selectedMatchId);
    try {
      if (existing) {
        await updateMatchEntry(existing.id, { rankings: rankingsData, status: 'Draft', tieSystemEnabled });
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
    if (!selectedMatchId) return toast.error('Select a match');
    if (players.length === 0) return toast.error('Add players first');
    if (isLocked) return toast.error('This match is Locked.');

    const { rankingsData, filled } = buildRankingsData();
    if (!filled) {
      toast.error('All players must be assigned a rank or marked as Not Played.');
      return;
    }

    if (!validateDuplicateRanks(rankingsData)) return;

    const existing = entries.find(e => e.matchId === selectedMatchId);
    try {
      if (existing) {
        await updateMatchEntry(existing.id, { rankings: rankingsData, status: 'Locked', tieSystemEnabled });
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
    if (status === 'Locked') return toast.error('This match is Locked. Unlock to edit.');
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
        <h1 className="font-heading text-2xl font-bold gradient-text">Match Entry</h1>
        <p className="text-muted-foreground text-sm mt-1">Record rankings for each match</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="glass-card p-5 space-y-5">
        {/* Match selector */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Select Match</label>
          <div className="space-y-2 max-h-80 overflow-auto pr-1">
            {matchOptions.map(m => {
              const entry = entries.find(e => e.matchId === m.id) || null;
              const fully = entry ? isMatchFullyAssigned(entry, players) : false;
              const isSelected = selectedMatchId === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMatchId(m.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected ? 'border-primary/40 bg-primary/10' : 'border-transparent bg-secondary/20 hover:bg-secondary/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{m.matchNumber}</span>
                        <span className="text-sm font-medium truncate">{m.team1} vs {m.team2}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(m.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
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
                          <Badge variant="outline" className="bg-secondary/20 text-muted-foreground border-border">⏳ Upcoming</Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedMatch && (
          <div className="flex items-center justify-center gap-6 py-3 bg-secondary/50 rounded-lg">
            <span className="text-2xl">{IPL_TEAMS[selectedMatch.team1]?.logo}</span>
            <span className="font-heading font-bold">{selectedMatch.team1} vs {selectedMatch.team2}</span>
            <span className="text-2xl">{IPL_TEAMS[selectedMatch.team2]?.logo}</span>
          </div>
        )}

        {/* Unlock notice */}
        {selectedEntry && selectedEntry.status === 'Locked' && (
          <div className="bg-secondary/30 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-muted-foreground" />
                <p className="text-sm font-medium">This match is Locked (read-only).</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Editing this match will recalculate leaderboard.
              </p>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Secret password</label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type={showUnlockPassword ? 'text' : 'password'}
                      value={unlockPassword}
                      onChange={e => {
                        setUnlockPassword(e.target.value);
                        setUnlockError(null);
                      }}
                      className="w-full sm:flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUnlockPassword(v => !v)}
                      className="w-full sm:w-auto text-left text-xs text-primary hover:underline"
                    >
                      {showUnlockPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                {unlockError && <p className="text-xs text-destructive">{unlockError}</p>}
              </div>
              <button
                type="button"
                onClick={handleUnlock}
                disabled={!unlockPassword.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 border border-border"
              >
                <Unlock size={16} /> Unlock Match
              </button>
            </div>
          </div>
        )}

        {/* Rankings input */}
        {players.length > 0 ? (
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground block">Player Entry (Rank / Not Played)</label>

            <div className="flex items-center justify-between gap-4 bg-secondary/20 border border-border rounded-lg px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Tie System</p>
                <p className="text-xs text-muted-foreground">Allow duplicate ranks.</p>
              </div>
              <Switch checked={tieSystemEnabled} onCheckedChange={setTieSystemEnabled} disabled={selectedEntry?.status === 'Locked'} />
            </div>
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm font-medium truncate">{p.name}</span>
                <select
                  value={getModeForValue(playerValues[p.id])}
                  onChange={e => {
                    if (selectedEntry?.status === 'Locked') return;
                    const mode = e.target.value as 'unassigned' | 'rank' | 'not_played';
                    setPlayerValues(prev => {
                      if (mode === 'unassigned') return { ...prev, [p.id]: '' };
                      if (mode === 'not_played') return { ...prev, [p.id]: 'not_played' };
                      const cur = prev[p.id] ?? '';
                      const maybeRank = /^\d+$/.test(cur) ? cur : 'rank';
                      return { ...prev, [p.id]: maybeRank };
                    });
                  }}
                  disabled={selectedEntry?.status === 'Locked'}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="rank">Rank</option>
                  <option value="not_played">Not Played</option>
                </select>
                {getModeForValue(playerValues[p.id]) === 'rank' ? (
                  <input
                    type="number"
                    min={1}
                    max={players.length}
                    step={1}
                    placeholder="Rank #"
                    value={/^\d+$/.test(playerValues[p.id] || '') ? playerValues[p.id] : ''}
                    disabled={selectedEntry?.status === 'Locked'}
                    onChange={e => {
                      if (selectedEntry?.status === 'Locked') return;
                      const nextVal = e.target.value;
                      setPlayerValues(prev => ({
                        ...prev,
                        [p.id]: nextVal === '' ? 'rank' : nextVal,
                      }));
                    }}
                    className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70"
                  />
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-secondary/20 border border-border text-muted-foreground">
                    {getModeForValue(playerValues[p.id]) === 'not_played' ? 'Not Played' : '—'}
                  </span>
                )}
              </div>
            ))}

            {!isLocked && selectedEntry && !isFullyAssigned && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive">❌ Missing Data</p>
                <p className="text-xs text-destructive/90 mt-1">
                  Finalize is blocked until every player is assigned a rank or marked as Not Played.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No players added yet. <a href="/players" className="text-primary hover:underline">Add players →</a>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={players.length === 0 || isLocked}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 border border-border"
          >
            🟡 Save Draft
          </button>
          <button
            onClick={handleFinalize}
            disabled={players.length === 0 || isLocked}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            ✅ Finalize Match
          </button>
        </div>
      </motion.div>

      {/* Past entries (today only) */}
      {entries.filter(e => e.matchId === selectedMatchId).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="glass-card p-5">
          <h2 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-accent" /> Past Entries
          </h2>
          <div className="space-y-3">
            {[...entries].filter(e => e.matchId === selectedMatchId).reverse().map(entry => {
              const match = IPL_SCHEDULE.find(m => m.id === entry.matchId);
              const fully = isMatchFullyAssigned(entry, players);
              return (
                <div key={entry.id} className="bg-secondary/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {match ? `${match.team1} vs ${match.team2}` : 'Unknown Match'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {match ? new Date(match.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                      </span>
                      <button
                        onClick={() => setSelectedMatchId(entry.matchId)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Open in editor"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id, entry.status)}
                        disabled={entry.status === 'Locked'}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title={entry.status === 'Locked' ? 'Unlock to delete' : 'Delete entry'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
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
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {players.map(p => {
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
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
