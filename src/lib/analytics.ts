import { Player, MatchEntry, PlayerStats, PlayerBadge } from './types';
import { getPointsForRank } from './storage';
import { IPL_SCHEDULE } from './ipl-schedule';

export function calculatePlayerStats(player: Player, entries: MatchEntry[], allPlayers: Player[]): PlayerStats {
  const totalPlayers = allPlayers.length;
  const playerEntries = entries.filter(e => e.rankings[player.id] !== undefined);
  const playedEntries = playerEntries.filter(e => e.rankings[player.id] !== null);
  const missedEntries = playerEntries.filter(e => e.rankings[player.id] === null);

  const ranks = playedEntries.map(e => e.rankings[player.id] as number);
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
  const worstRank = ranks.length > 0 ? Math.max(...ranks) : 0;
  const averageRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0;

  let cumulative = 0;
  const pointsHistory = entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => {
      const rank = e.rankings[player.id];
      const points = rank !== null && rank !== undefined ? getPointsForRank(rank, totalPlayers) : 0;
      cumulative += points;
      const match = IPL_SCHEDULE.find(m => m.id === e.matchId);
      return { date: match?.date || e.date, points, cumulative };
    });

  const rankDistribution: Record<number, number> = {};
  ranks.forEach(r => { rankDistribution[r] = (rankDistribution[r] || 0) + 1; });

  // Streak
  let currentStreak: PlayerStats['currentStreak'] = { type: 'none', count: 0 };
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streakType: 'win' | 'loss' | 'none' = 'none';
  let streakCount = 0;
  for (const entry of sortedEntries) {
    const rank = entry.rankings[player.id];
    if (rank === null || rank === undefined) continue;
    const isWin = rank === 1;
    if (streakType === 'none') {
      streakType = isWin ? 'win' : 'loss';
      streakCount = 1;
    } else if ((isWin && streakType === 'win') || (!isWin && streakType === 'loss')) {
      streakCount++;
    } else {
      break;
    }
  }
  currentStreak = { type: streakType, count: streakCount };

  return {
    playerId: player.id,
    playerName: player.name,
    totalPoints: cumulative,
    matchesPlayed: playedEntries.length,
    matchesMissed: missedEntries.length + (entries.length - playerEntries.length),
    averageRank: Math.round(averageRank * 100) / 100,
    bestRank,
    worstRank,
    currentStreak,
    pointsHistory,
    rankDistribution,
  };
}

export function getLeaderboard(players: Player[], entries: MatchEntry[]): PlayerStats[] {
  return players
    .map(p => calculatePlayerStats(p, entries, players))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

export function getBadges(stats: PlayerStats): PlayerBadge[] {
  const badges: PlayerBadge[] = [];

  if (stats.matchesPlayed > 0 && stats.averageRank <= 2) {
    badges.push({ type: 'top_performer', label: 'Top Performer', description: 'Average rank ≤ 2', icon: '🏆' });
  }
  if (stats.matchesPlayed >= 5 && stats.averageRank <= 3) {
    badges.push({ type: 'consistent', label: 'Consistent', description: '5+ matches with avg rank ≤ 3', icon: '🎯' });
  }
  if (stats.currentStreak.type === 'win' && stats.currentStreak.count >= 3) {
    badges.push({ type: 'streak_master', label: 'On Fire', description: '3+ win streak', icon: '🔥' });
  }
  if (stats.matchesMissed === 0 && stats.matchesPlayed >= 5) {
    badges.push({ type: 'iron_man', label: 'Iron Man', description: 'Never missed a match', icon: '🦾' });
  }

  return badges;
}

export function getDayTopPerformer(entry: MatchEntry, players: Player[]): Player | null {
  let topId: string | null = null;
  let topRank = Infinity;
  for (const [pid, rank] of Object.entries(entry.rankings)) {
    if (rank !== null && rank < topRank) {
      topRank = rank;
      topId = pid;
    }
  }
  return topId ? players.find(p => p.id === topId) || null : null;
}
