import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { addPlayer, removePlayer, subscribePlayers, updatePlayer } from '@/lib/storage';
import { Player } from '@/lib/types';
import { toast } from 'sonner';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const unsub = subscribePlayers(setPlayers, () => toast.error('Failed to load players from Firebase'));
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error('Enter a name');
    if (players.some(p => p.name.toLowerCase() === newName.trim().toLowerCase())) return toast.error('Player already exists');
    try {
      await addPlayer(newName);
      setNewName('');
      toast.success('Player added!');
    } catch {
      toast.error('Failed to add player');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removePlayer(id);
      toast.success('Player removed');
    } catch {
      toast.error('Failed to remove player');
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updatePlayer(id, editName);
      setEditingId(null);
      toast.success('Player updated');
    } catch {
      toast.error('Failed to update player');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold gradient-text">Players</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your league participants</p>
      </motion.div>

      {/* Add player */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="glass-card p-5">
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Enter player name..."
            className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </motion.div>

      {/* Player list */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="glass-card p-5">
        <h2 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
          <Users size={16} className="text-accent" /> All Players ({players.length})
        </h2>
        {players.length > 0 ? (
          <div className="space-y-2">
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.03 * i } }}
                className="flex items-center gap-3 py-3 px-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                {editingId === p.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleEdit(p.id)}
                      className="flex-1 bg-secondary border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                    <button onClick={() => handleEdit(p.id)} className="text-neon-green hover:opacity-80"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:opacity-80"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">{p.name}</span>
                    <button onClick={() => { setEditingId(p.id); setEditName(p.name); }} className="text-muted-foreground hover:text-primary transition-colors"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No players added yet. Add your first player above!</p>
        )}
      </motion.div>
    </div>
  );
}
