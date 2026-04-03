import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Save, ChevronDown, Trash2, Edit3 } from 'lucide-react';
import { getPlayers, getMatchEntries, addMatchEntry, deleteMatchEntry, updateMatchEntry } from '@/lib/storage';
import { IPL_SCHEDULE, IPL_TEAMS } from '@/lib/ipl-schedule';
import { Player, MatchEntry } from '@/lib/types';
import { toast } from 'sonner';

export default function MatchEntryPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<MatchEntry[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [rankings, setRankings] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const p = getPlayers();
    setPlayers(p);
    setEntries(getMatchEntries());
    // Default to today's match
    const today = new Date().toISOString().split('T')[0];
    const todayMatch = IPL_SCHEDULE.find(m => m.date === today);
    if (todayMatch) setSelectedMatchId(todayMatch.id);
    else if (IPL_SCHEDULE.length > 0) setSelectedMatchId(IPL_SCHEDULE[0].id);
  }, []);

  const reload = () => {
    setEntries(getMatchEntries());
  };

  const selectedMatch = IPL_SCHEDULE.find(m => m.id === selectedMatchId);

  const handleSave = () => {
    if (!selectedMatchId) return toast.error('Select a match');
    if (players.length === 0) return toast.error('Add players first');

    const rankingsData: Record<string, number | null> = {};
    players.forEach(p => {
      const val = rankings[p.id];
      rankingsData[p.id] = val && val !== '' ? parseInt(val) : null;
    });

    if (editingId) {
      updateMatchEntry(editingId, { rankings: rankingsData });
      toast.success('Match entry updated!');
      setEditingId(null);
    } else {
      const existing = entries.find(e => e.matchId === selectedMatchId);
      if (existing) return toast.error('Entry already exists for this match. Edit it instead.');
      addMatchEntry({ matchId: selectedMatchId, date: selectedMatch?.date || '', rankings: rankingsData });
      toast.success('Match entry saved!');
    }
    setRankings({});
    reload();
  };

  const startEdit = (entry: MatchEntry) => {
    setEditingId(entry.id);
    setSelectedMatchId(entry.matchId);
    const r: Record<string, string> = {};
    Object.entries(entry.rankings).forEach(([pid, rank]) => {
      r[pid] = rank !== null ? String(rank) : '';
    });
    setRankings(r);
  };

  const handleDelete = (id: string) => {
    deleteMatchEntry(id);
    toast.success('Entry deleted');
    reload();
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
          <div className="relative">
            <select
              value={selectedMatchId}
              onChange={e => { setSelectedMatchId(e.target.value); setEditingId(null); setRankings({}); }}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {IPL_SCHEDULE.map(m => (
                <option key={m.id} value={m.id}>
                  #{m.matchNumber} · {m.team1} vs {m.team2} · {new Date(m.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {selectedMatch && (
          <div className="flex items-center justify-center gap-6 py-3 bg-secondary/50 rounded-lg">
            <span className="text-2xl">{IPL_TEAMS[selectedMatch.team1]?.logo}</span>
            <span className="font-heading font-bold">{selectedMatch.team1} vs {selectedMatch.team2}</span>
            <span className="text-2xl">{IPL_TEAMS[selectedMatch.team2]?.logo}</span>
          </div>
        )}

        {/* Rankings input */}
        {players.length > 0 ? (
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground block">Player Rankings (leave empty for missed)</label>
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm font-medium truncate">{p.name}</span>
                <input
                  type="number"
                  min="1"
                  max={players.length}
                  placeholder="Rank"
                  value={rankings[p.id] || ''}
                  onChange={e => setRankings({ ...rankings, [p.id]: e.target.value })}
                  className="w-20 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <span className={`text-xs px-2 py-1 rounded ${rankings[p.id] ? 'bg-neon-green/15 text-neon-green' : 'bg-destructive/15 text-destructive'}`}>
                  {rankings[p.id] ? `#${rankings[p.id]}` : 'Missed'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No players added yet. <a href="/players" className="text-primary hover:underline">Add players →</a>
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={players.length === 0}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {editingId ? 'Update Entry' : 'Save Entry'}
        </button>
      </motion.div>

      {/* Past entries */}
      {entries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="glass-card p-5">
          <h2 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-accent" /> Past Entries
          </h2>
          <div className="space-y-3">
            {[...entries].reverse().map(entry => {
              const match = IPL_SCHEDULE.find(m => m.id === entry.matchId);
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
                      <button onClick={() => startEdit(entry)} className="text-muted-foreground hover:text-primary transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(entry.rankings).map(([pid, rank]) => {
                      const player = players.find(p => p.id === pid);
                      return player ? (
                        <span key={pid} className={`text-xs px-2 py-1 rounded ${rank !== null ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {player.name}: {rank !== null ? `#${rank}` : 'Missed'}
                        </span>
                      ) : null;
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
