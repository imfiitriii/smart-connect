import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrainCircuit,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── API shape ─────────────────────────────────────────────────────────────────
interface ApiMentor {
  id: string;
  name: string;
  bio: string;
  skills: string[];
  industries: string[];
  experienceYears: number;
  maxRelationships: number;
  relationships: string[];
}

// ── helpers ───────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-indigo-400';
  return 'text-amber-400';
}

// ── MatchingView ──────────────────────────────────────────────────────────────
export default function MatchingView() {
  const [mentors, setMentors] = useState<ApiMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<ApiMentor | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    fetch('/api/mentors')
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data: ApiMentor[]) => {
        setMentors(data);
        setSelectedMentor(data[0] ?? null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const runMatching = () => {
    setIsMatching(true);
    setTimeout(() => setIsMatching(false), 2000);
  };

  // derive a pseudo match-score from experienceYears so cards have a number
  function pseudoScore(m: ApiMentor) {
    return Math.min(100, 60 + m.experienceYears * 2 + (m.maxRelationships - (m.relationships?.length ?? 0)) * 2);
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">

        {/* ── Mentor Selector ── */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="font-bold flex items-center gap-2">
              <Rocket className="w-4 h-4 text-indigo-400" /> Mentor Pool
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {mentors.length} Mentors
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading && (
              <p className="text-sm text-slate-500 text-center py-8">Loading mentors…</p>
            )}
            {error && (
              <p className="text-sm text-amber-400 text-center py-8">Failed to load: {error}</p>
            )}
            {!loading && !error && mentors.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMentor(m)}
                className={cn(
                  'w-full p-4 rounded-2xl border transition-all text-left group',
                  selectedMentor?.id === m.id
                    ? 'bg-indigo-600/10 border-indigo-500/50'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded',
                    selectedMentor?.id === m.id
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-slate-800 text-slate-500'
                  )}>
                    {m.industries?.[0] ?? 'General'}
                  </span>
                  {selectedMentor?.id === m.id && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                </div>
                <h4 className="font-bold text-slate-100">{m.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{m.experienceYears} yrs exp</p>
              </button>
            ))}
          </div>

          <button
            onClick={runMatching}
            disabled={isMatching || loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3"
          >
            {isMatching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Analyzing Ecosystem...
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5" />
                Perform AI Match
              </>
            )}
          </button>
        </div>

        {/* ── Match Results ── */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl border border-slate-800 p-8 relative flex flex-col">
          <AnimatePresence mode="wait">
            {isMatching ? (
              <motion.div
                key="matching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <BrainCircuit className="w-12 h-12 text-indigo-400" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="absolute inset-[-20px] border border-dashed border-indigo-500/30 rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    AI Reasoner Computing...
                  </h4>
                  <p className="text-slate-500 text-sm mt-2">
                    Checking cross-industry compatibility and success history
                  </p>
                </div>
              </motion.div>
            ) : selectedMentor ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* Visualizer */}
                <div className="h-48 border-b border-slate-800/50 mb-6 relative flex items-center justify-center overflow-hidden shrink-0">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500" />
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-indigo-500" />
                  </div>
                  <div className="flex-1 flex items-center justify-center relative w-full scale-75 lg:scale-90">
                    <div className="absolute w-1/2 h-[2px] bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

                    {/* Industry node */}
                    <div className="z-20 flex flex-col items-center gap-2 absolute left-10 lg:left-20">
                      <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <span className="text-[9px] font-black uppercase text-white text-center px-1 leading-tight">
                          {selectedMentor.industries?.[0] ?? 'General'}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">Industry</span>
                    </div>

                    {/* Score bubble */}
                    <div className="z-30 w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-800 flex flex-col items-center justify-center shadow-2xl">
                      <span className="text-3xl font-black text-white">{pseudoScore(selectedMentor)}</span>
                      <span className="text-[9px] uppercase font-black text-emerald-400 tracking-tighter">Score</span>
                    </div>

                    {/* Mentor node */}
                    <div className="z-20 flex flex-col items-center gap-2 absolute right-10 lg:right-20">
                      <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] text-xl font-black text-emerald-400">
                        {selectedMentor.name[0]}
                      </div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">Mentor</span>
                    </div>
                  </div>
                </div>

                {/* Mentor cards list */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {mentors.map((m, i) => (
                    <MatchCard
                      key={m.id}
                      mentor={m}
                      score={pseudoScore(m)}
                      index={i}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic text-sm">
                {loading ? 'Loading mentors…' : 'No mentors available.'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── MatchCard ─────────────────────────────────────────────────────────────────
function MatchCard({ mentor, score, index }: { mentor: ApiMentor; score: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl hover:border-indigo-500/30 transition-all group relative overflow-hidden"
    >
      <div className="flex items-start gap-5 relative z-10">
        {/* Score box */}
        <div className="w-16 h-20 flex flex-col items-center justify-center bg-slate-900/80 rounded-xl border border-slate-800 group-hover:border-indigo-500/50 transition-colors shrink-0 shadow-inner">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Score</span>
          <span className={cn('text-xl font-black tabular-nums', scoreColor(score))}>
            {score}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-sm font-black group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">
              {mentor.name}
            </h4>
            <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-widest shrink-0 ml-2">
              {mentor.industries?.[0] ?? '—'}
            </span>
          </div>

          {/* Bio */}
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/50 mb-3">
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              <span className="text-indigo-400 font-black not-italic mr-1.5 uppercase text-[9px] tracking-widest">Bio:</span>
              "{mentor.bio}"
            </p>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {mentor.skills?.map(s => (
              <span key={s} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {score >= 80 ? (
                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auto-Assign
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Hold Admin
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition-all shadow-lg shadow-indigo-600/10 uppercase tracking-widest">
                Accept Match
              </button>
              <button className="p-1.5 border border-slate-800 hover:border-slate-700 text-slate-500 hover:text-white rounded-lg transition-colors">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Rocket({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/>
      <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/>
    </svg>
  );
}
