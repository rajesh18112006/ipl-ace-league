import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, CalendarDays, Trophy, BarChart3, Users, Menu, X, Download, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportData, importData } from '@/lib/storage';
import { toast } from 'sonner';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/match-entry', label: 'Match Entry', icon: Calendar },
  { path: '/today-matches', label: 'Today Matches', icon: CalendarDays },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/players', label: 'Players', icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipl-fantasy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (importData(reader.result as string)) {
        toast.success('Data imported! Refreshing...');
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error('Invalid data file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card/80 backdrop-blur-xl border-r border-border hidden lg:flex flex-col z-40">
        <div className="p-6 border-b border-border">
          <h1 className="font-heading text-lg font-bold gradient-text">IPL FANTASY</h1>
          <p className="text-xs text-muted-foreground mt-1">League Tracker 2026</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <button onClick={handleExport} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            <Download size={14} /> Export Data
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            <Upload size={14} /> Import Data
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 z-50">
        <h1 className="font-heading text-sm font-bold gradient-text">IPL FANTASY</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground p-2">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-14 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border z-40 p-4"
          >
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button onClick={handleExport} className="flex items-center gap-1 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-secondary">
                <Download size={12} /> Export
              </button>
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-secondary">
                <Upload size={12} /> Import
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
