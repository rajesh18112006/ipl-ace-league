import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';
import { getPlayers, getMatchEntries } from '@/lib/storage';
import { calculatePlayerStats, getLeaderboard } from '@/lib/analytics';
import { Player, MatchEntry, PlayerStats } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

export default function AnalyticsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<MatchEntry[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');

  useEffect(() => {
    const p = getPlayers();
    setPlayers(p);
    setEntries(getMatchEntries());
  }, []);

  const leaderboard = getLeaderboard(players, entries);
  const selectedStats: PlayerStats | null = selectedPlayer !== 'all'
    ? leaderboard.find(s => s.playerId === selectedPlayer) || null
    : null;

  // Points over time for all players
  const allPointsData = leaderboard.length > 0
    ? leaderboard[0].pointsHistory.map((_, i) => {
        const point: Record<string, number | string> = { match: `M${i + 1}` };
        leaderboard.forEach(s => {
          if (s.pointsHistory[i]) {
            point[s.playerName] = s.pointsHistory[i].cumulative;
          }
        });
        return point;
      })
    : [];

  const colors = ['#e67e22', '#00b8a9', '#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c', '#e91e63'];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold gradient-text">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Deep dive into performance data</p>
      </motion.div>

      {/* Player selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
        <select
          value={selectedPlayer}
          onChange={e => setSelectedPlayer(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Players</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </motion.div>

      {leaderboard.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BarChart3 size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No data available yet.</p>
        </div>
      ) : selectedPlayer === 'all' ? (
        <>
          {/* Points over time - all players */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} className="glass-card p-5">
            <h2 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Points Over Time
            </h2>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={allPointsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                  <XAxis dataKey="match" stroke="hsl(215 20% 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215 20% 55%)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 30% 22%)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: 'hsl(210 40% 96%)' }}
                  />
                  <Legend />
                  {leaderboard.map((s, i) => (
                    <Line key={s.playerId} type="monotone" dataKey={s.playerName} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaderboard.map((s, i) => (
              <motion.div
                key={s.playerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * i + 0.2 } }}
                className="glass-card-hover p-4 cursor-pointer"
                onClick={() => setSelectedPlayer(s.playerId)}
              >
                <h3 className="font-heading text-sm font-bold truncate">{s.playerName}</h3>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div><span className="text-muted-foreground">Points</span><p className="font-bold text-primary text-lg">{s.totalPoints}</p></div>
                  <div><span className="text-muted-foreground">Avg Rank</span><p className="font-bold text-lg">{s.averageRank || '-'}</p></div>
                  <div><span className="text-muted-foreground">Played</span><p className="font-bold">{s.matchesPlayed}</p></div>
                  <div><span className="text-muted-foreground">Not Played</span><p className="font-bold">{s.matchesMissed}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : selectedStats && (
        <>
          {/* Individual stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Points', value: selectedStats.totalPoints, accent: true },
                { label: 'Matches Played', value: selectedStats.matchesPlayed },
                { label: 'Not Played', value: selectedStats.matchesMissed },
                { label: 'Avg Rank', value: selectedStats.averageRank || '-' },
                { label: 'Best Rank', value: selectedStats.bestRank || '-' },
                { label: 'Worst Rank', value: selectedStats.worstRank || '-' },
              ].map((item, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`font-heading font-bold text-xl mt-1 ${item.accent ? 'text-primary' : ''}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Points trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="glass-card p-5">
            <h2 className="font-heading text-sm font-semibold mb-4">Cumulative Points</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedStats.pointsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                  <XAxis dataKey="date" stroke="hsl(215 20% 55%)" fontSize={11} tickFormatter={d => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                  <YAxis stroke="hsl(215 20% 55%)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 30% 22%)', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="cumulative" stroke="#e67e22" strokeWidth={2} dot={{ fill: '#e67e22', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Rank distribution */}
          {Object.keys(selectedStats.rankDistribution).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }} className="glass-card p-5">
              <h2 className="font-heading text-sm font-semibold mb-4">Rank Distribution</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(selectedStats.rankDistribution).map(([rank, count]) => ({ rank: `#${rank}`, count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                    <XAxis dataKey="rank" stroke="hsl(215 20% 55%)" fontSize={11} />
                    <YAxis stroke="hsl(215 20% 55%)" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 30% 22%)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#00b8a9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
