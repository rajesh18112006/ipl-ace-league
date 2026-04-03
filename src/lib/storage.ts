import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { MatchEntry, MatchStatus, Player, PlayerMatchValue } from './types';

function normalizeMatchEntry(raw: unknown): MatchEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const matchId = typeof r.matchId === 'string' ? r.matchId : '';
  if (!matchId) return null;

  const id = typeof r.id === 'string' ? r.id : crypto.randomUUID();
  const date = typeof r.date === 'string' ? r.date : '';

  const status: MatchStatus | undefined = typeof r.status === 'string' ? (r.status as MatchStatus) : undefined;
  const normalizedStatus: MatchEntry['status'] =
    status && status !== 'Upcoming' ? status : 'Completed';

  const tieSystemEnabled = typeof r.tieSystemEnabled === 'boolean' ? r.tieSystemEnabled : false;

  const rankingsRaw = r.rankings && typeof r.rankings === 'object' ? (r.rankings as Record<string, unknown>) : {};
  const rankings: Partial<Record<string, PlayerMatchValue>> = {};
  for (const [pid, v] of Object.entries(rankingsRaw)) {
    if (typeof v === 'number' && Number.isFinite(v)) rankings[pid] = v;
    else if (v === null || v === 'not_played') rankings[pid] = 'not_played';
  }

  return {
    id,
    matchId,
    date,
    status: normalizedStatus,
    tieSystemEnabled,
    rankings,
  };
}

// ---- Players (Firestore only) ----
export function subscribePlayers(onChange: (players: Player[]) => void, onError?: (e: unknown) => void) {
  const q = query(collection(db, 'players'), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    snap => {
      const players = snap.docs
        .map(d => d.data() as Player)
        .filter(p => p && typeof p.id === 'string' && typeof p.name === 'string');
      onChange(players);
    },
    err => onError?.(err),
  );
}

export async function fetchPlayers(): Promise<Player[]> {
  const snap = await getDocs(query(collection(db, 'players'), orderBy('createdAt', 'asc')));
  return snap.docs.map(d => d.data() as Player);
}

export async function addPlayer(name: string): Promise<Player> {
  const player: Player = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'players', player.id), player);
  return player;
}

export async function removePlayer(id: string): Promise<void> {
  await deleteDoc(doc(db, 'players', id));
}

export async function updatePlayer(id: string, name: string): Promise<void> {
  await setDoc(doc(db, 'players', id), { name: name.trim() }, { merge: true });
}

// ---- Match entries (Firestore only) ----
export function subscribeMatchEntries(onChange: (entries: MatchEntry[]) => void, onError?: (e: unknown) => void) {
  const q = query(collection(db, 'matchEntries'));
  return onSnapshot(
    q,
    snap => {
      const entries = snap.docs
        .map(d => normalizeMatchEntry(d.data()))
        .filter(Boolean) as MatchEntry[];
      onChange(entries);
    },
    err => onError?.(err),
  );
}

export async function fetchMatchEntries(): Promise<MatchEntry[]> {
  const snap = await getDocs(collection(db, 'matchEntries'));
  return snap.docs
    .map(d => normalizeMatchEntry(d.data()))
    .filter(Boolean) as MatchEntry[];
}

export async function addMatchEntry(entry: Omit<MatchEntry, 'id'>): Promise<MatchEntry> {
  const full: MatchEntry = { ...entry, id: crypto.randomUUID() };
  await setDoc(doc(db, 'matchEntries', full.id), full);
  return full;
}

export async function updateMatchEntry(id: string, data: Partial<MatchEntry>): Promise<void> {
  await setDoc(doc(db, 'matchEntries', id), data, { merge: true });
}

export async function deleteMatchEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, 'matchEntries', id));
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

export async function exportData(): Promise<string> {
  const [players, matchEntries] = await Promise.all([fetchPlayers(), fetchMatchEntries()]);
  return JSON.stringify(
    {
      players,
      matchEntries,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

export async function importData(json: string): Promise<boolean> {
  try {
    const data = JSON.parse(json);
    if (!data?.players || !data?.matchEntries) return false;

    const players: Player[] = Array.isArray(data.players) ? data.players : [];
    const entries: MatchEntry[] = Array.isArray(data.matchEntries) ? data.matchEntries : [];

    await Promise.all([
      ...players.map(p => setDoc(doc(db, 'players', p.id), p)),
      ...entries.map(e => setDoc(doc(db, 'matchEntries', e.id), e)),
    ]);

    return true;
  } catch {
    return false;
  }
}
