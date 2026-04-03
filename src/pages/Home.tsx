import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Calendar, Star } from 'lucide-react';
import { getPlayers, getMatchEntries } from '@/lib/storage';
import { getLeaderboard, getDayTopPerformer } from '@/lib/analytics';
import { getTodayMatch, getUpcomingMatches, IPL_SCHEDULE, IPL_TEAMS } from '@/lib/ipl-schedule';
import { Link } from 'react-router-dom';
import { Player, MatchEntry } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getMatchDate, isMatchFullyAssigned } from '@/lib/match-scoring';

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } },
});

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<MatchEntry[]>([]);

  useEffect(() => {
    setPlayers(getPlayers());
    setEntries(getMatchEntries());
  }, []);

  const todayMatch = getTodayMatch();
  const upcoming = getUpcomingMatches(5);
  const leaderboard = getLeaderboard(players, entries).slice(0, 5);
  const scorableEntries = entries.filter(
    e => (e.status === 'Completed' || e.status === 'Locked') && isMatchFullyAssigned(e, players),
  );
  const totalMatches = IPL_SCHEDULE.length;
  const completedMatches = scorableEntries.length;
  const draftMatches = entries.filter(e => e.status === 'Draft').length;

  const lastScorableEntry = scorableEntries
    .slice()
    .sort((a, b) => getMatchDate(b).localeCompare(getMatchDate(a)))[0];
  const topPerformer = lastScorableEntry ? getDayTopPerformer(lastScorableEntry, players) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">
          <span className="gradient-text glow-text">IPL Fantasy League</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Season 2026 · Track your squad's performance</p>
      </motion.div>

      {/* Today's Match */}
      <motion.div {...fadeUp(1)}>
        {todayMatch ? (
          <div className="glass-card p-6 neon-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-primary" size={16} />
              <span className="text-xs font-heading text-primary uppercase tracking-wider">Live Today · Match #{todayMatch.matchNumber}</span>
            </div>
            <div className="flex items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-4xl mb-2">{IPL_TEAMS[todayMatch.team1]?.logo}</div>
                <span className="font-heading text-lg font-bold">{todayMatch.team1}</span>
              </div>
              <div className="text-muted-foreground font-heading text-xl">VS</div>
              <div className="text-center">
                <div className="text-4xl mb-2">{IPL_TEAMS[todayMatch.team2]?.logo}</div>
                <span className="font-heading text-lg font-bold">{todayMatch.team2}</span>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">{todayMatch.venue}</p>
            <div className="text-center mt-4">
              <Link to="/match-entry" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                <Calendar size={14} /> Enter Rankings
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground text-sm">No match scheduled today</p>
            <Link to="/match-entry" className="text-primary text-sm mt-2 inline-block hover:underline">Enter past match data →</Link>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Leaderboard */}
        <motion.div {...fadeUp(2)} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-semibold flex items-center gap-2">
              <Trophy size={16} className="text-gold" /> Leaderboard
            </h2>
            <Link to="/leaderboard" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <Alert className="mb-4">
            <AlertTitle>Leaderboard is based only on completed matches</AlertTitle>
            <AlertDescription className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span>Total matches: <span className="font-medium">{totalMatches}</span></span>
              <span>Completed matches: <span className="font-medium">{completedMatches}</span></span>
              <span>Draft matches: <span className="font-medium">{draftMatches}</span></span>
            </AlertDescription>
          </Alert>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((s, i) => (
                <div key={s.playerId} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/30">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'medal-gold text-background' : i === 1 ? 'medal-silver text-background' : i === 2 ? 'medal-bronze text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{s.playerName}</span>
                  <span className="text-sm font-heading font-bold text-primary">{s.totalPoints}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Add players & enter match data to see rankings</p>
          )}
        </motion.div>

        {/* Upcoming Matches */}
        <motion.div {...fadeUp(3)} className="glass-card p-5">
          <h2 className="font-heading text-sm font-semibold flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-accent" /> Upcoming Matches
          </h2>
          <div className="space-y-2">
            {upcoming.map(m => {
              const isToday = m.date === new Date().toISOString().split('T')[0];
              return (
                <div key={m.id} className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${
                  isToday ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{IPL_TEAMS[m.team1]?.logo}</span>
                    <span className="font-medium">{m.team1}</span>
                    <span className="text-muted-foreground text-xs">vs</span>
                    <span className="font-medium">{m.team2}</span>
                    <span>{IPL_TEAMS[m.team2]?.logo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isToday ? <span className="text-primary font-medium">Today</span> : new Date(m.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Top performer */}
      {topPerformer && (
        <motion.div {...fadeUp(4)} className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full medal-gold flex items-center justify-center">
            <Star size={20} className="text-background" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Match Top Performer</p>
            <p className="font-heading font-bold text-lg">{topPerformer.name}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
