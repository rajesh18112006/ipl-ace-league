import { IPL_SCHEDULE } from './ipl-schedule';
import { MatchEntry, Player, PlayerMatchValue } from './types';

export function getMatchDate(entry: MatchEntry): string {
  const match = IPL_SCHEDULE.find(m => m.id === entry.matchId);
  return match?.date || entry.date;
}

function isValidRank(value: PlayerMatchValue, totalPlayers: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= totalPlayers
  );
}

// "Fully assigned" means every current player has exactly one of:
// - a valid rank (number), or
// - `'not_played'` (Not Played).
export function isMatchFullyAssigned(entry: MatchEntry, players: Player[]): boolean {
  const totalPlayers = players.length;
  return players.every(p => {
    const v = entry.rankings?.[p.id];
    if (v === undefined) return false; // left empty / missing from record
    if (v === 'not_played') return true;
    return isValidRank(v, totalPlayers);
  });
}

export function isMatchScorable(entry: MatchEntry, players: Player[]): boolean {
  if (!(entry.status === 'Completed' || entry.status === 'Locked')) return false;
  return isMatchFullyAssigned(entry, players);
}

export function getDuplicateRanks(
  entry: MatchEntry,
  players: Player[],
): { ranks: number[]; byRankCount: Record<number, number> } {
  const ranks: number[] = [];
  for (const p of players) {
    const v = entry.rankings?.[p.id];
    if (typeof v === 'number') ranks.push(v);
  }
  const byRankCount: Record<number, number> = {};
  for (const r of ranks) byRankCount[r] = (byRankCount[r] || 0) + 1;
  const duplicates = Object.entries(byRankCount)
    .filter(([, c]) => c > 1)
    .map(([r]) => parseInt(r, 10))
    .filter(n => Number.isFinite(n));
  return { ranks: duplicates, byRankCount };
}

