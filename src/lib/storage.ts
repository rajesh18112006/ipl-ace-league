import { Player, MatchEntry } from './types';

const PLAYERS_KEY = 'ipl_fantasy_players';
const MATCHES_KEY = 'ipl_fantasy_matches';

export function getPlayers(): Player[] {
  const data = localStorage.getItem(PLAYERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePlayers(players: Player[]) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
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
  return player;
}

export function removePlayer(id: string) {
  savePlayers(getPlayers().filter(p => p.id !== id));
}

export function updatePlayer(id: string, name: string) {
  const players = getPlayers();
  const idx = players.findIndex(p => p.id === id);
  if (idx !== -1) {
    players[idx].name = name.trim();
    savePlayers(players);
  }
}

export function getMatchEntries(): MatchEntry[] {
  const data = localStorage.getItem(MATCHES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMatchEntries(entries: MatchEntry[]) {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(entries));
}

export function addMatchEntry(entry: Omit<MatchEntry, 'id'>): MatchEntry {
  const entries = getMatchEntries();
  const full: MatchEntry = { ...entry, id: crypto.randomUUID() };
  entries.push(full);
  saveMatchEntries(entries);
  return full;
}

export function updateMatchEntry(id: string, data: Partial<MatchEntry>) {
  const entries = getMatchEntries();
  const idx = entries.findIndex(e => e.id === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...data };
    saveMatchEntries(entries);
  }
}

export function deleteMatchEntry(id: string) {
  saveMatchEntries(getMatchEntries().filter(e => e.id !== id));
}

export function getPointsForRank(rank: number, totalPlayers: number): number {
  if (rank <= 0) return 0;
  // Top rank gets max points, descending by 2
  const maxPoints = totalPlayers * 2;
  const points = maxPoints - (rank - 1) * 2;
  return Math.max(points, 1);
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
