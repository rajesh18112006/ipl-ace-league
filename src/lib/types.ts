export interface Player {
  id: string;
  name: string;
  createdAt: string;
}

export type MatchStatus = 'Upcoming' | 'Draft' | 'Completed' | 'Locked';

// Per-match per-player value:
// - `number` => entered rank
// - `'not_played'` => Not Played
export type PlayerMatchValue = number | 'not_played';

export interface MatchEntry {
  id: string;
  matchId: string; // references IPL schedule
  date: string;
  status: Exclude<MatchStatus, 'Upcoming'>;
  tieSystemEnabled?: boolean;
  rankings: Partial<Record<string, PlayerMatchValue>>; // playerId -> rank/'not_played'
}

export interface IPLMatch {
  id: string;
  team1: string;
  team2: string;
  date: string; // YYYY-MM-DD
  venue: string;
  matchNumber: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalPoints: number;
  matchesPlayed: number;
  matchesMissed: number;
  averageRank: number;
  bestRank: number;
  worstRank: number;
  currentStreak: { type: 'win' | 'loss' | 'none'; count: number };
  pointsHistory: { date: string; points: number; cumulative: number }[];
  rankDistribution: Record<number, number>;
}

export type Badge = 'top_performer' | 'consistent' | 'streak_master' | 'comeback_king' | 'iron_man';

export interface PlayerBadge {
  type: Badge;
  label: string;
  description: string;
  icon: string;
}
