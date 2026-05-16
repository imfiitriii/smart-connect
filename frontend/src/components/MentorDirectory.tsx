import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Award,
  ShieldAlert,
  Star,
  Zap,
  ChevronRight,
} from 'lucide-react';

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

// ── MentorDirectory ───────────────────────────────────────────────────────────
export default function MentorDirectory() {
  const [mentors, setMentors] = useState<ApiMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/mentors')
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data: ApiMentor[]) => {
        setMentors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = mentors.filter(m => {
    const q = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.bio.toLowerCase().includes(q) ||
      m.skills?.some(s => s.toLowerCase().includes(q)) ||
      m.industries?.some(i => i.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-green-200 rounded-3xl p-8">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Expert Network</h2>
          <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" /> Mentor Performance Vault
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Cross-industry success vectors used for programmatic weighting.
          </p>
        </div>
        <div className="relative max-w-md w-full group/search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/search:text-green-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, skill, industry, or bio..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all font-medium placeholder:text-gray-400 text-gray-700"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* States */}
      {loading && (
        <p className="text-gray-400 text-sm text-center py-12">Loading mentors…</p>
      )}
      {error && (
        <p className="text-amber-500 text-sm text-center py-12">Failed to load: {error}</p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-12">No mentors match your search.</p>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filtered.map(mentor => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
}

// ── MentorCard ────────────────────────────────────────────────────────────────
function MentorCard({ mentor }: { mentor: ApiMentor }) {
  // derive a master score from experienceYears + capacity
  const capacity = mentor.maxRelationships - (mentor.relationships?.length ?? 0);
  const masterScore = Math.min(100, 55 + mentor.experienceYears * 2 + capacity * 2);

  // split skills into strengths (first half) and areas to grow (second half)
  const skills = mentor.skills ?? [];
  const half = Math.ceil(skills.length / 2);
  const strengths = skills.slice(0, half);
  const growthAreas = skills.slice(half);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-green-100 rounded-3xl overflow-hidden group hover:border-green-400/40 transition-all shadow-xl shadow-gray-100/50 backdrop-blur-sm"
    >
      <div className="flex flex-col lg:flex-row">

        {/* ── Profile ── */}
        <div className="lg:w-80 p-8 border-b lg:border-b-0 lg:border-r border-green-100 bg-green-50/40 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white border border-green-200 flex items-center justify-center text-3xl font-black text-green-600 mb-5 shadow-inner group-hover:scale-105 transition-transform">
              {mentor.name[0]}
            </div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight mb-1 uppercase">{mentor.name}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              {mentor.industries?.join(' · ') ?? '—'}
            </p>
            <p className="text-xs text-gray-400 italic mb-6 leading-relaxed">"{mentor.bio}"</p>

            <div className="w-full grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-green-100 flex flex-col items-center">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mb-1">Experience</p>
                <p className="text-sm font-black text-emerald-600 tabular-nums">{mentor.experienceYears} yrs</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-green-100 flex flex-col items-center">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mb-1">Capacity</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black text-gray-700 tabular-nums">
                    {capacity}/{mentor.maxRelationships}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white">
          {/* Strengths */}
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-500" /> Positive Success Vectors
            </h4>
            <div className="space-y-3.5">
              {strengths.map(s => (
                <div key={s} className="flex items-center gap-3 group/item">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover/item:scale-125 transition-transform" />
                  <span className="text-xs text-gray-600 font-bold uppercase tracking-tight">{s}</span>
                </div>
              ))}
              {strengths.length === 0 && (
                <p className="text-xs text-gray-400 italic">No skills listed.</p>
              )}
            </div>
          </div>

          {/* Growth areas */}
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Negative Correlation
            </h4>
            <div className="space-y-3.5">
              {growthAreas.map(w => (
                <div key={w} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500/20 border border-rose-500/40" />
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-tight italic opacity-60">{w}</span>
                </div>
              ))}
              {growthAreas.length === 0 && (
                <p className="text-xs text-gray-400 italic">—</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Master Score ── */}
        <div className="lg:w-48 p-8 flex flex-col items-center justify-center bg-green-50/30 border-t lg:border-t-0 lg:border-l border-green-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Master Score</p>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(22,163,74,0.15)]">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#dcfce7" strokeWidth="8" />
              <motion.circle
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (251 * masterScore) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                cx="48" cy="48" r="40"
                fill="none" stroke="#16a34a" strokeWidth="8"
                strokeDasharray={251}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-black text-gray-800 tabular-nums tracking-tighter">
              {masterScore}
            </span>
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">
            {mentor.relationships?.length ?? 0} active
          </p>
          <button className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-green-600 hover:text-green-800 transition-colors uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            Verification <ChevronRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
