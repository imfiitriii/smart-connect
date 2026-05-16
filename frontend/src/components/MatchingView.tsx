import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrainCircuit,
  ChevronRight,
  Building2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '../lib/utils';

const API = import.meta.env.VITE_API_URL || '';

// ── API shapes ────────────────────────────────────────────────────────────────
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

interface ApiRelationship {
  id: string;
  mentorId: string;
  startupId: string;
  matchscore: number;
  status: string;
}

interface ApiStartup {
  id: string;
  name: string;
  industry?: string;
  stage?: string;
  description?: string;
}

interface MatchedStartup {
  id: string;
  name: string;
  score: number;
  status: string;
  industry?: string;
  stage?: string;
  description?: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 85) return '#16a34a';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

// ── MatchingView ──────────────────────────────────────────────────────────────
export default function MatchingView() {
  const [mentors, setMentors] = useState<ApiMentor[]>([]);
  const [relationships, setRelationships] = useState<ApiRelationship[]>([]);
  const [startupData, setStartupData] = useState<ApiStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<ApiMentor | null>(null);
  const [selectedStartup, setSelectedStartup] = useState<MatchedStartup | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/mentors`).then(r => { if (!r.ok) throw new Error(`Mentors: ${r.status}`); return r.json(); }),
      fetch(`${API}/relationships`).then(r => { if (!r.ok) throw new Error(`Relationships: ${r.status}`); return r.json(); }),
      fetch(`${API}/startups`).then(r => { if (!r.ok) throw new Error(`Startups: ${r.status}`); return r.json(); }),
    ])
      .then(([mentorData, relData, sData]: [ApiMentor[], ApiRelationship[], ApiStartup[]]) => {
        setMentors(mentorData);
        setSelectedMentor(mentorData[0] ?? null);
        setRelationships(relData);
        setStartupData(sData);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  // When mentor changes, reset selected startup
  const handleSelectMentor = (m: ApiMentor) => {
    setSelectedMentor(m);
    setSelectedStartup(null);
  };

  const runMatching = () => {
    setIsMatching(true);
    setTimeout(() => setIsMatching(false), 2000);
  };

  // get matched startups for a given mentor (with full startup detail)
  function getMatchedStartups(mentorId: string): MatchedStartup[] {
    return relationships
      .filter(r => r.mentorId === mentorId)
      .map(r => {
        const s = startupData.find(sd => sd.id === r.startupId);
        return {
          id: r.startupId,
          name: s?.name ?? r.startupId,
          score: r.matchscore,
          status: r.status,
          industry: s?.industry,
          stage: s?.stage,
          description: s?.description,
        };
      });
  }

  // The score shown in the bubble: real AI score if a startup is selected, else '—'
  const bubbleScore = selectedStartup ? selectedStartup.score : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">

        {/* ── Mentor Selector ── */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-green-200 p-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="font-bold flex items-center gap-2 text-gray-800">
              <Rocket className="w-4 h-4 text-green-600" /> Mentor Pool
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {mentors.length} Mentors
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading && <p className="text-sm text-gray-400 text-center py-8">Loading mentors…</p>}
            {error && <p className="text-sm text-amber-500 text-center py-8">Failed to load: {error}</p>}
            {!loading && !error && mentors.map(m => {
              const matched = getMatchedStartups(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMentor(m)}
                  className={cn(
                    'w-full p-4 rounded-2xl border transition-all text-left group',
                    selectedMentor?.id === m.id
                      ? 'bg-green-50 border-green-400/60'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded',
                      selectedMentor?.id === m.id ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    )}>
                      {m.industries?.[0] ?? 'General'}
                    </span>
                    {selectedMentor?.id === m.id && <ChevronRight className="w-4 h-4 text-green-600" />}
                  </div>
                  <h4 className="font-bold text-gray-800">{m.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{m.experienceYears} yrs exp</p>
                  {matched.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] font-bold text-green-600">
                        {matched.length} startup{matched.length > 1 ? 's' : ''} matched
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Match Results ── */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-green-200 p-8 relative flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {isMatching ? (
              <motion.div
                key="matching"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center animate-pulse">
                    <BrainCircuit className="w-12 h-12 text-green-600" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="absolute inset-[-20px] border border-dashed border-green-400/40 rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                    AI Reasoner Computing...
                  </h4>
                  <p className="text-gray-400 text-sm mt-2">Checking cross-industry compatibility and success history</p>
                </div>
              </motion.div>

            ) : selectedMentor ? (
              <motion.div
                key={selectedMentor.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* ── Visualizer ── */}
                <div className="border-b border-green-100 mb-6 pb-5 shrink-0">
                  <div className="h-48 w-full relative flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-green-500" />
                      <div className="absolute top-0 left-1/2 w-[1px] h-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center relative w-full scale-75 lg:scale-90">
                      <div className="absolute w-1/2 h-[2px] bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]" />

                      {/* Mentor node (left) */}
                      <div className="z-20 flex flex-col items-center gap-2 absolute left-10 lg:left-20">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.2)] text-xl font-black text-green-600">
                          {selectedMentor.name[0]}
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Mentor</span>
                      </div>

                      {/* Score bubble (center) — shows real AI score when a startup is selected */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={bubbleScore ?? 'empty'}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="z-30 w-24 h-24 rounded-full bg-white border-4 border-green-200 flex flex-col items-center justify-center shadow-2xl"
                        >
                          {bubbleScore !== null ? (
                            <>
                              <span className="text-3xl font-black tabular-nums" style={{ color: scoreColor(bubbleScore) }}>
                                {bubbleScore}
                              </span>
                              <span className="text-[9px] uppercase font-black text-emerald-600 tracking-tighter">%</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg font-black text-gray-300">—</span>
                              <span className="text-[9px] uppercase font-black text-gray-300 tracking-tighter">Score</span>
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Startup node (right) */}
                      {(() => {
                        const matched = getMatchedStartups(selectedMentor.id);
                        const active = selectedStartup ?? matched[0] ?? null;
                        return (
                          <div className="z-20 flex flex-col items-center gap-2 absolute right-10 lg:right-20">
                            <div
                              className="w-16 h-16 rounded-full bg-white border-2 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                              style={{ borderColor: active ? (active.status === 'found' ? '#16a34a' : '#f59e0b') : '#d1d5db' }}
                            >
                              {active ? (
                                <span className="text-[9px] font-black uppercase text-gray-700 text-center px-1 leading-tight">
                                  {active.name}
                                </span>
                              ) : (
                                <Building2 className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">
                              {active ? 'Startup' : 'No Match'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* hint */}
                  {!selectedStartup && getMatchedStartups(selectedMentor.id).length > 0 && (
                    <p className="text-center text-[11px] text-gray-400 mt-1">
                      Click a startup below to see its match score
                    </p>
                  )}
                </div>

                {/* ── Matched startup cards list ── */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const matched = getMatchedStartups(selectedMentor.id);
                    if (matched.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <Building2 className="w-10 h-10 text-gray-200 mb-3" />
                          <p className="text-sm font-bold text-gray-400">No startups matched yet</p>
                          <p className="text-xs text-gray-300 mt-1">Run AI Match to find compatible startups</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {matched.map((s, i) => (
                          <StartupMatchCard
                            key={s.id}
                            startup={s}
                            index={i}
                            isSelected={selectedStartup?.id === s.id}
                            onSelect={() => setSelectedStartup(prev => prev?.id === s.id ? null : s)}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>

            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic text-sm">
                {loading ? 'Loading mentors…' : 'No mentors available.'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── StartupMatchCard ──────────────────────────────────────────────────────────
function StartupMatchCard({
  startup,
  index,
  isSelected,
  onSelect,
}: {
  startup: MatchedStartup;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isFound = startup.status === 'found';
  const accentColor = isFound ? '#16a34a' : '#f59e0b';

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onSelect}
      className="w-full text-left"
    >
      <div
        className="p-5 rounded-2xl border-2 transition-all duration-200"
        style={{
          background: isSelected ? (isFound ? 'rgba(22,163,74,0.06)' : 'rgba(245,158,11,0.06)') : '#f9fafb',
          borderColor: isSelected ? accentColor : '#e5e7eb',
        }}
      >
        <div className="flex items-center gap-4">

          {/* Score — hidden until selected, shows placeholder ring when not */}
          <div
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border-2 transition-all duration-300"
            style={{
              borderColor: isSelected ? accentColor : '#e5e7eb',
              background: isSelected ? `${accentColor}12` : '#fff',
            }}
          >
            <AnimatePresence mode="wait">
              {isSelected ? (
                <motion.div
                  key="score"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xl font-black tabular-nums leading-none" style={{ color: accentColor }}>
                    {startup.score}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: accentColor }}>
                    %
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Building2 className="w-5 h-5 text-gray-300" />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-gray-300">Click</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-black uppercase tracking-tight text-gray-800 truncate">
                {startup.name}
              </h4>
              {/* Status badge */}
              <span
                className="ml-2 shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{
                  background: isFound ? 'rgba(22,163,74,0.08)' : 'rgba(245,158,11,0.08)',
                  borderColor: isFound ? 'rgba(22,163,74,0.3)' : 'rgba(245,158,11,0.3)',
                  color: accentColor,
                }}
              >
                {isFound ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                {isFound ? 'Matched' : 'On Hold'}
              </span>
            </div>

            {startup.industry && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {startup.industry}
              </p>
            )}

            {startup.description && (
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                {startup.description}
              </p>
            )}

            {!isSelected && (
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> Click to reveal match score
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function Rocket({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
      <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
    </svg>
  );
}
