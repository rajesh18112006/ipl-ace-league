import { MatchEntry, MatchStatus, Player, PlayerMatchValue } from './types';
import { db } from './firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';

const PLAYERS_KEY = 'ipl_fantasy_players';
const MATCHES_KEY = 'ipl_fantasy_matches';

export function getPlayers(): Player[] {
  const data = localStorage.getItem(PLAYERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePlayers(players: Player[]) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));

  // Mirror to Firestore (best-effort, non-blocking)
  players.forEach(player => {
    void setDoc(doc(collection(db, 'players'), player.id), player).catch(() => {
      // swallow Firestore errors; local copy still works
    });
  });
}

export function addPlayer(name: string): Player {
  const players = getPlayers();
  const player: Player = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  players.push(player);
  savePlayers(players);
  void setDoc(doc(collection(db, 'players'), player.id), player).catch(() => {});
  return player;
}

export function removePlayer(id: string) {
  const remaining = getPlayers().filter(p => p.id !== id);
  savePlayers(remaining);
  void deleteDoc(doc(collection(db, 'players'), id)).catch(() => {});
}

export function updatePlayer(id: string, name: string) {
  const players = getPlayers();
  const idx = players.findIndex(p => p.id === id);
  if (idx !== -1) {
    players[idx].name = name.trim();
    savePlayers(players);
    void setDoc(doc(collection(db, 'players'), players[idx].id), players[idx]).catch(() => {});
  }
}

export function getMatchEntries(): MatchEntry[] {
  const data = localStorage.getItem(MATCHES_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((raw: unknown): MatchEntry | null => {
        if (!raw || typeof raw !== 'object') return null;
        const r = raw as Record<string, unknown>;
        const matchId = typeof r.matchId === 'string' ? r.matchId : '';
        if (!matchId) return null;

        const id = typeof r.id === 'string' ? r.id : crypto.randomUUID();
        const date = typeof r.date === 'string' ? r.date : '';

        const status: MatchStatus | undefined = typeof r.status === 'string' ? (r.status as MatchStatus) : undefined;
        // Backward compatibility: old entries had no status.
        const normalizedStatus: MatchEntry['status'] =
          status && status !== 'Upcoming' ? status : 'Completed';

        const tieSystemEnabled = typeof r.tieSystemEnabled === 'boolean' ? r.tieSystemEnabled : false;

        const rankingsRaw = r.rankings && typeof r.rankings === 'object' ? r.rankings as Record<string, unknown> : {};
        const rankings: Partial<Record<string, PlayerMatchValue>> = {};
        for (const [pid, v] of Object.entries(rankingsRaw)) {
          if (typeof v === 'number' && Number.isFinite(v)) {
            // Keep as-is; final validation happens before scoring.
            rankings[pid] = v;
          } else if (v === null || v === 'not_played') {
            // Legacy data used `null` to represent Missed; we treat it as Not Played.
            rankings[pid] = 'not_played';
          }
        }

        return {
          id,
          matchId,
          date,
          status: normalizedStatus,
          tieSystemEnabled,
          rankings,
        };
      })
      .filter(Boolean) as MatchEntry[];
  } catch {
    return [];
  }
}

export function saveMatchEntries(entries: MatchEntry[]) {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(entries));

  // Mirror to Firestore (best-effort, non-blocking)
  entries.forEach(entry => {
    void setDoc(doc(collection(db, 'matchEntries'), entry.id), entry).catch(() => {});
  });
}

export function addMatchEntry(entry: Omit<MatchEntry, 'id'>): MatchEntry {
  const entries = getMatchEntries();
  const full: MatchEntry = { ...entry, id: crypto.randomUUID() };
  entries.push(full);
  saveMatchEntries(entries);
  void setDoc(doc(collection(db, 'matchEntries'), full.id), full).catch(() => {});
  return full;
}

export function updateMatchEntry(id: string, data: Partial<MatchEntry>) {
  const entries = getMatchEntries();
  const idx = entries.findIndex(e => e.id === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...data };
    saveMatchEntries(entries);
    void setDoc(doc(collection(db, 'matchEntries'), entries[idx].id), entries[idx]).catch(() => {});
  }
}

export function deleteMatchEntry(id: string) {
  const remaining = getMatchEntries().filter(e => e.id !== id);
  saveMatchEntries(remaining);
  void deleteDoc(doc(collection(db, 'matchEntries'), id)).catch(() => {});
}

export function getPointsForRank(rank: number, totalPlayers: number): number {
  // Rank scoring:
  // - Rank 1 => totalPlayers points
  // - Rank 2 => totalPlayers - 1 points
  // - ...
  // - Rank > totalPlayers => 0
  if (rank <= 0) return 0;
  if (rank > totalPlayers) return 0;
  return totalPlayers - rank + 1;
}

export function exportData(): string {
  return JSON.stringify({
    players: getPlayers(),
    matchEntries: getMatchEntries(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.players && data.matchEntries) {
      savePlayers(data.players);
      saveMatchEntries(data.matchEntries);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
