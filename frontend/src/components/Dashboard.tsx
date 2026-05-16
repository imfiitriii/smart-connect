import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  FileStack,
  FilePlus2,
  PauseCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const API = import.meta.env.VITE_API_URL || '';

// ── colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:     '#ffffff',
  card:   '#f0f7f0',
  border: '#d4e8d4',
  hover:  '#e8f5e8',
  green:  '#16a34a',
  blue:   '#3b82f6',
  yellow: '#facc15',
  muted:  '#6b7280',
  lo:     '#9ca3af',
};

// ── data ──────────────────────────────────────────────────────────────────────

type RelStatus = 'approved' | 'pending' | 'action';

// Shape returned by GET /relationships
interface ApiRelationship {
  id: string;
  mentorId: string;
  startupId: string;
  matchscore: number;
  status: string; // "found" | "hold"
  createdAt: { seconds: number; nanoseconds: number } | string;
  successParams?: {
    revenueGrowth: number;
    raisedFunding: number;
    partnerSecured: number;
  };
}

// Shape returned by GET /mentors
interface ApiMentor {
  id: string;
  name: string;
}

// Shape returned by GET /startups
interface ApiStartup {
  id: string;
  name: string;
}

// Map API status → display status
function toRelStatus(apiStatus: string): RelStatus {
  if (apiStatus === 'found') return 'approved';
  if (apiStatus === 'hold')  return 'pending';
  return 'action';
}

const statusConfig: Record<RelStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  approved: { label: 'Found Mentor - Pending Approval', color: C.green,  bg: 'rgba(222,255,154,0.08)', icon: CheckCircle2   },
  pending:  { label: 'Admin Action Required',         color: C.yellow, bg: 'rgba(250,204,21,0.08)',  icon: AlertTriangle  },
  action:   { label: 'Admin Action Required',  color: C.yellow, bg: 'rgba(250,204,21,0.08)',  icon: AlertTriangle  },
};

function barFill(rate: number) {
  if (rate >= 70) return C.green;
  if (rate >= 55) return C.blue;
  return '#d1d5db';
}

// ── success score formula ─────────────────────────────────────────────────────
function calculateSuccessScore(successParams: NonNullable<ApiRelationship['successParams']>) {
  const maxRevenueGrowth = 20;
  const maxFunding       = 5000;
  const maxPartners      = 5;
  const revenueScore = Math.min(successParams.revenueGrowth / maxRevenueGrowth, 1);
  const fundingScore = Math.min(successParams.raisedFunding  / maxFunding,       1);
  const partnerScore = Math.min(successParams.partnerSecured / maxPartners,       1);
  const finalScore   = revenueScore * 0.4 + fundingScore * 0.35 + partnerScore * 0.25;
  return Math.round(finalScore * 100);
}

// ── sub-components ────────────────────────────────────────────────────────────

function Card({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${className}`}
      style={{
        background: C.card,
        borderColor: hovered ? '#2e2e2e' : C.border,
        boxShadow: hovered ? '0 0 0 1px #2e2e2e' : 'none',
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm font-bold border"
         style={{ background: '#f0f7f0', borderColor: '#d4e8d4', color: '#111827' }}>
      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted }}>{label}</p>
      <p style={{ color: C.green }}>{payload[0].value}% success rate</p>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [relationships, setRelationships] = useState<ApiRelationship[]>([]);
  const [mentorMap, setMentorMap] = useState<Record<string, string>>({});
  const [startupMap, setStartupMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelId, setSelectedRelId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/relationships`).then(r => { if (!r.ok) throw new Error(`Relationships: ${r.status}`); return r.json(); }),
      fetch(`${API}/mentors`).then(r => { if (!r.ok) throw new Error(`Mentors: ${r.status}`); return r.json(); }),
      fetch(`${API}/startups`).then(r => { if (!r.ok) throw new Error(`Startups: ${r.status}`); return r.json(); }),
    ])
      .then(([rels, mentors, startups]: [ApiRelationship[], ApiMentor[], ApiStartup[]]) => {
        setRelationships(rels);
        const mMap: Record<string, string> = {};
        mentors.forEach(m => { mMap[m.id] = m.name; });
        setMentorMap(mMap);
        const sMap: Record<string, string> = {};
        startups.forEach(s => { sMap[s.id] = s.name; });
        setStartupMap(sMap);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ── derive metric values from relationships ──────────────────────────────
  const totalRelationships = relationships.length;

  // "today" = same calendar date as local now
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = relationships.filter(r => {
    if (!r.createdAt) return false;
    const secs = typeof r.createdAt === 'object' ? r.createdAt.seconds : null;
    if (!secs) return false;
    return new Date(secs * 1000) >= todayStart;
  }).length;

  const onHoldCount = relationships.filter(r => r.status === 'hold').length;

  const metrics = [
    {
      label: 'Total Relationships',
      value: loading ? '—' : totalRelationships.toLocaleString(),
      icon: FileStack,
      accent: C.blue,
      sub: 'All time',
    },
    {
      label: 'New Relationships Today',
      value: loading ? '—' : todayCount.toLocaleString(),
      icon: FilePlus2,
      accent: C.green,
      sub: 'Since midnight',
    },
    {
      label: 'Relationships On Hold',
      value: loading ? '—' : onHoldCount.toLocaleString(),
      icon: PauseCircle,
      accent: C.yellow,
      sub: 'Pending action',
    },
  ];

  // ── chart data: all relationships of the selected pairing's mentor ──────────
  const selectedRel = relationships.find(r => r.id === selectedRelId) ?? null;
  const chartData = selectedRel
    ? relationships
        .filter(r => r.mentorId === selectedRel.mentorId && r.successParams)
        .map(r => ({
          startup: startupMap[r.startupId] ?? r.startupId,
          rate: calculateSuccessScore(r.successParams!),
        }))
    : null; // null = no selection yet → show placeholder
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      className="space-y-6"
    >

      {/* ── Row 1 — Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}>
              <Card className="p-6 flex flex-col gap-4">
                {/* top row */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ background: `${m.accent}14`, border: `1px solid ${m.accent}28` }}>
                    <Icon size={18} style={{ color: m.accent }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: C.muted }}>
                    {m.sub}
                  </span>
                </div>

                {/* value */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1"
                     style={{ color: C.muted }}>
                    {m.label}
                  </p>
                  <p className="text-4xl font-black tabular-nums leading-none"
                     style={{ color: '#111827', letterSpacing: '-0.03em' }}>
                    {m.value}
                  </p>
                </div>

                {/* accent bar */}
                <div className="h-0.5 w-full rounded-full"
                     style={{ background: `linear-gradient(90deg, ${m.accent} 0%, transparent 100%)` }} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Row 2 — Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* ── Left: Total Relationship (40%) ── */}
        <motion.div className="lg:col-span-2"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 }}>
          <Card className="p-6 h-full flex flex-col">
            {/* header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em]"
                   style={{ color: C.muted }}>
                  Daily Pairings
                </p>
                <h3 className="text-base font-black mt-0.5" style={{ color: '#111827' }}>Total Relationship</h3>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(22,163,74,0.10)', color: C.green, border: `1px solid ${C.green}22` }}>
                {relationships.length} Active
              </span>
            </div>

            {/* list */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '450px' }}>
              {loading && (
                <p className="text-sm text-center py-6" style={{ color: C.muted }}>Loading…</p>
              )}
              {error && (
                <p className="text-sm text-center py-6" style={{ color: C.yellow }}>
                  Failed to load: {error}
                </p>
              )}
              {!loading && !error && relationships.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: C.muted }}>No relationships found.</p>
              )}
              {!loading && !error && relationships.map((r, i) => {
                const relStatus = toRelStatus(r.status);
                const cfg = statusConfig[relStatus];
                const StatusIcon = cfg.icon;
                const isSelected = selectedRelId === r.id;
                return (
                  <motion.div key={r.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.22 + i * 0.07 }}
                              className="rounded-xl p-4 border transition-all duration-200 cursor-pointer select-none"
                              style={{
                                background: isSelected ? `${cfg.color}0d` : '#f8faf8',
                                borderColor: isSelected ? cfg.color + '66' : C.border,
                                boxShadow: isSelected ? `0 0 0 2px ${cfg.color}22` : 'none',
                              }}
                              onClick={() => setSelectedRelId(prev => prev === r.id ? null : r.id)}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = cfg.color + '44'; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}>

                    {/* status pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                           style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{ background: cfg.color, color: '#fff' }}>
                          Selected
                        </span>
                      )}
                    </div>

                    {/* pairing */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest w-20 shrink-0"
                              style={{ color: C.muted }}>Mentor</span>
                        <span className="text-sm font-black truncate" style={{ color: '#111827' }}>
                          {mentorMap[r.mentorId] ?? r.mentorId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest w-20 shrink-0"
                              style={{ color: C.muted }}>Startup</span>
                        <span className="text-sm font-bold truncate" style={{ color: '#374151' }}>
                          {startupMap[r.startupId] ?? r.startupId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest w-20 shrink-0"
                              style={{ color: C.muted }}>Score</span>
                        <span className="text-sm font-black" style={{ color: C.green }}>{r.matchscore}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* legend */}
            <div className="mt-6 pt-5 border-t space-y-2 shrink-0" style={{ borderColor: C.border }}>
              {[statusConfig.approved, statusConfig.pending].map((cfg) => (
                <div key={cfg.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                  <span className="text-[10px] font-semibold" style={{ color: C.muted }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── Right: Chart + AI Summary (60%) ── */}
        <motion.div className="lg:col-span-3 h-full"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 }}>

          {/* Bar chart card */}
          <Card className="p-7 h-full flex flex-col">
            <div className="flex items-center justify-between mb-7 shrink-0">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em]"
                   style={{ color: C.muted }}>
                  {selectedRel
                    ? `${mentorMap[selectedRel.mentorId] ?? 'Mentor'}'s Startups`
                    : 'Startup Performance'}
                </p>
                <h3 className="text-base font-black mt-0.5" style={{ color: '#111827' }}>Success Rate (%)</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest"
                   style={{ background: 'rgba(59,130,246,0.08)', color: C.blue, borderColor: `${C.blue}30` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.blue }} />
                {selectedRel ? 'Live Data' : 'Select a Pairing'}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="38%"
                            margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="startup" stroke="#e5e7eb"
                           tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 700 }}
                           tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#e5e7eb"
                           tick={{ fill: '#9ca3af', fontSize: 11 }}
                           tickLine={false} axisLine={false}
                           tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />}
                             cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={barFill(d.rate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  {chartData !== null && chartData.length === 0 ? (
                    // mentor selected but no successParams data yet
                    <>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                           style={{ background: 'rgba(59,130,246,0.08)' }}>
                        <span className="text-xl">📊</span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: C.muted }}>No success data yet</p>
                      <p className="text-xs" style={{ color: C.lo }}>
                        Success params haven't been recorded for this mentor's startups
                      </p>
                    </>
                  ) : (
                    // nothing selected
                    <>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                           style={{ background: 'rgba(59,130,246,0.08)' }}>
                        <span className="text-xl">👆</span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: C.muted }}>Click a pairing to load chart</p>
                      <p className="text-xs" style={{ color: C.lo }}>
                        Select any relationship on the left to see its mentor's success scores
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* chart legend */}
            <div className="flex items-center gap-6 mt-5 pt-5 border-t shrink-0"
                 style={{ borderColor: C.border }}>
              {[
                { color: C.green,   label: 'High ≥70%' },
                { color: C.blue,    label: 'Mid 55–69%' },
                { color: '#e5e7eb', label: 'Low <55%' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border"
                       style={{ background: l.color, borderColor: l.color === '#e5e7eb' ? '#d1d5db' : 'transparent' }} />
                  <span className="text-[11px] font-semibold" style={{ color: C.muted }}>{l.label}</span>
                </div>
              ))}
            </div>
          </Card>



        </motion.div>
      </div>
    </motion.div>
  );
}
