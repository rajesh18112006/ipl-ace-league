import { Player, MatchEntry, PlayerStats, PlayerBadge } from './types';
import { getPointsForRank } from './storage';
import { getMatchDate, isMatchScorable } from './match-scoring';

export function calculatePlayerStats(player: Player, entries: MatchEntry[], allPlayers: Player[]): PlayerStats {
  const totalPlayers = allPlayers.length;
  const scorableEntries = entries.filter(e => isMatchScorable(e, allPlayers));
  const playerEntries = scorableEntries.filter(e => e.rankings[player.id] !== undefined);
  const playedEntries = playerEntries.filter(e => typeof e.rankings[player.id] === 'number');
  const notPlayedEntries = playerEntries.filter(e => e.rankings[player.id] === 'not_played');

  const ranks = playedEntries.map(e => e.rankings[player.id] as number);
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
  const worstRank = ranks.length > 0 ? Math.max(...ranks) : 0;
  const averageRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0;

  let cumulative = 0;
  const pointsHistory = entries
    .filter(e => isMatchScorable(e, allPlayers))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => {
      const v = e.rankings[player.id];
      const points = typeof v === 'number' ? getPointsForRank(v, totalPlayers) : 0;
      cumulative += points;
      return { date: getMatchDate(e), points, cumulative };
    });

  const rankDistribution: Record<number, number> = {};
  ranks.forEach(r => { rankDistribution[r] = (rankDistribution[r] || 0) + 1; });

  // Streak
  let currentStreak: PlayerStats['currentStreak'] = { type: 'none', count: 0 };
  const sortedEntries = [...scorableEntries].sort((a, b) => b.date.localeCompare(a.date));
  let streakType: 'win' | 'loss' | 'none' = 'none';
  let streakCount = 0;
  for (const entry of sortedEntries) {
    const v = entry.rankings[player.id];
    if (typeof v !== 'number') continue; // missed/not played don't affect streak
    const isWin = v === 1;
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
    matchesMissed: notPlayedEntries.length,
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
    badges.push({ type: 'iron_man', label: 'Iron Man', description: 'Never marked Not Played', icon: '🦾' });
  }

  return badges;
}

export function getDayTopPerformer(entry: MatchEntry, players: Player[]): Player | null {
  let topId: string | null = null;
  let topRank = Infinity;
  for (const [pid, rank] of Object.entries(entry.rankings)) {
    if (typeof rank === 'number' && rank < topRank) {
      topRank = rank;
      topId = pid;
    }
  }
  return topId ? players.find(p => p.id === topId) || null : null;
}
