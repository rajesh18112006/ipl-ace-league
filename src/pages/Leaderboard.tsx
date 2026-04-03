import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Flame, Target } from 'lucide-react';
import { getPlayers, getMatchEntries } from '@/lib/storage';
import { getLeaderboard, getBadges } from '@/lib/analytics';
import { Player, MatchEntry, PlayerStats } from '@/lib/types';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<MatchEntry[]>([]);

  useEffect(() => {
    setPlayers(getPlayers());
    setEntries(getMatchEntries());
  }, []);

  const leaderboard = getLeaderboard(players, entries);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold gradient-text">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overall standings across all matches</p>
      </motion.div>

      {leaderboard.length > 0 ? (
        <>
          {/* Top 3 podium */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
            className="grid grid-cols-3 gap-3 md:gap-6"
          >
            {[1, 0, 2].map(idx => {
              const s = leaderboard[idx];
              if (!s) return <div key={idx} />;
              const pos = idx + 1;
              const badges = getBadges(s);
              return (
                <div key={s.playerId} className={`glass-card p-4 text-center ${idx === 0 ? 'md:-mt-4' : ''}`}>
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-xl font-bold mb-3 ${
                    pos === 1 ? 'medal-gold text-background' : pos === 2 ? 'medal-silver text-background' : 'medal-bronze text-primary-foreground'
                  }`}>
                    {pos === 1 ? '👑' : pos}
                  </div>
                  <h3 className="font-heading text-sm font-bold truncate">{s.playerName}</h3>
                  <p className="text-2xl font-heading font-bold text-primary mt-1">{s.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">{s.matchesPlayed} matches</p>
                  {badges.length > 0 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {badges.map(b => (
                        <span key={b.type} title={b.description} className="text-base">{b.icon}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Full table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-center">Pts</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Played</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">Avg Rank</th>
                    <th className="px-4 py-3 text-center hidden md:table-cell">Best</th>
                    <th className="px-4 py-3 text-center hidden md:table-cell">Streak</th>
                    <th className="px-4 py-3 text-center">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((s, i) => {
                    const badges = getBadges(s);
                    return (
                      <motion.tr
                        key={s.playerId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.05 * i } }}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                            i === 0 ? 'medal-gold text-background' : i === 1 ? 'medal-silver text-background' : i === 2 ? 'medal-bronze text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{s.playerName}</td>
                        <td className="px-4 py-3 text-center font-heading font-bold text-primary">{s.totalPoints}</td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">{s.matchesPlayed}</td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">{s.averageRank || '-'}</td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">{s.bestRank || '-'}</td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          {s.currentStreak.count > 0 && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                              s.currentStreak.type === 'win' ? 'bg-neon-green/15 text-neon-green' : 'bg-destructive/15 text-destructive'
                            }`}>
                              {s.currentStreak.type === 'win' ? <Flame size={12} /> : <Target size={12} />}
                              {s.currentStreak.count}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {badges.map(b => <span key={b.type} title={b.description} className="mr-1">{b.icon}</span>)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <Trophy size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No data yet. Add players and enter match results to see the leaderboard.</p>
        </div>
      )}
    </div>
  );
}
