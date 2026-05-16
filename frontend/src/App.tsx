import React, { useState } from 'react';
import { BarChart3, Users, Award, BrainCircuit, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Dashboard from './components/Dashboard';
import MatchingView from './components/MatchingView';
import MentorDirectory from './components/MentorDirectory';

// ── constants ────────────────────────────────────────────────────────────────

const MOCK_USER = { displayName: 'Admin User', email: 'admin@ecograph.ai' };

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'matching', label: 'Mentor Matching', icon: Users },
  { id: 'mentors', label: 'Mentor Performance', icon: Award },
];

// ── colour tokens (inline so Tailwind purge never strips them) ───────────────
const C = {
  bg: '#ffffff',
  sidebar: '#f8faf8',
  card: '#f0f7f0',
  border: '#d4e8d4',
  borderHover: '#b8d8b8',
  green: '#16a34a',
  blue: '#3b82f6',
  yellow: '#facc15',
  muted: '#6b7280',
  mutedLo: '#9ca3af',
};

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<typeof MOCK_USER | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  /* ── Login screen ── */
  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: C.bg }}>
      {/* ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[160px]"
          style={{ background: 'rgba(59,130,246,0.08)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[160px]"
          style={{ background: 'rgba(22,163,74,0.08)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border p-10 flex flex-col items-center gap-7"
        style={{ background: C.card, borderColor: C.border }}>

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)' }}>
          <BrainCircuit className="text-white" size={26} />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#111827' }}>SmartConnect</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: C.muted }}>
            Admin Command Center
          </p>
        </div>

        <button onClick={() => setUser(MOCK_USER)}
          className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{ background: C.green, color: '#ffffff' }}>
          <ShieldCheck size={16} /> Enter Platform
        </button>
      </motion.div>
    </div>
  );



  /* ── Authenticated shell ── */
  return (
    <div className="flex min-h-screen" style={{ background: C.bg, color: '#111827' }}>

      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col p-5 sticky top-0 h-screen shrink-0 border-r"
        style={{ background: C.sidebar, borderColor: C.border }}>

        {/* logo */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: C.green }}>
            <BrainCircuit size={17} className="text-white" />
          </div>
          <div>
            <span className="font-black text-[15px] tracking-tighter block leading-none" style={{ color: '#111827' }}>SmartConnect</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: C.mutedLo }}>
              Ecosystem.OS
            </span>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 text-left"
                style={active
                  ? { background: C.green, color: '#ffffff' }
                  : { color: C.muted, background: 'transparent' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#e8f5e8'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                <Icon size={16} style={active ? { color: '#ffffff' } : { color: C.mutedLo }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* user */}
        <div className="rounded-xl p-3 border" style={{ background: '#f0f7f0', borderColor: C.border }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              style={{ background: C.green, color: '#fff' }}>
              {user.displayName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate" style={{ color: '#111827' }}>{user.displayName}</p>
              <p className="text-[10px] truncate" style={{ color: C.muted }}>{user.email}</p>
            </div>
          </div>
          <button onClick={() => setUser(null)}
            className="w-full flex items-center justify-center gap-2 text-[11px] font-semibold py-1.5 rounded-lg transition-colors border-t pt-2.5"
            style={{ color: C.muted, borderColor: C.border }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
            <LogOut size={11} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        {/* topbar */}
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-30 border-b"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)', borderColor: C.border }}>
          <div>
            <h2 className="text-base font-black uppercase tracking-widest" style={{ color: '#111827' }}>
              {NAV.find(n => n.id === activeTab)?.label ?? activeTab}
            </h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: C.mutedLo }}>
              Innovation Ecosystem Management
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest"
            style={{ background: '#f0f7f0', borderColor: C.border, color: C.green }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
            AI Online
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dash" />}
            {activeTab === 'matching' && <MatchingView key="match" />}
            {activeTab === 'mentors' && <MentorDirectory key="mentors" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
