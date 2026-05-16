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

// ── colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:     '#050505',
  card:   '#111111',
  border: '#1e1e1e',
  hover:  '#1a1a1a',
  green:  '#deff9a',
  blue:   '#3b82f6',
  yellow: '#facc15',
  muted:  '#555',
  lo:     '#333',
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
  approved: { label: 'Approved · High Score', color: C.green,  bg: 'rgba(222,255,154,0.08)', icon: CheckCircle2   },
  pending:  { label: 'Pending Mentor',         color: C.blue,   bg: 'rgba(59,130,246,0.08)',  icon: Clock          },
  action:   { label: 'Admin Action Required',  color: C.yellow, bg: 'rgba(250,204,21,0.08)',  icon: AlertTriangle  },
};

const startupData = [
  { startup: 'Horioz Cafe', rate: 85 },
  { startup: 'vS Cartu',    rate: 40 },
  { startup: 'Toy G7',      rate: 70 },
];

function barFill(rate: number) {
  if (rate >= 70) return C.green;
  if (rate >= 55) return C.blue;
  return '#2a2a2a';
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
         style={{ background: '#161616', borderColor: '#2a2a2a', color: '#fff' }}>
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

  useEffect(() => {
    Promise.all([
      fetch('/api/relationships').then(r => { if (!r.ok) throw new Error(`Relationships: ${r.status}`); return r.json(); }),
      fetch('/api/mentors').then(r => { if (!r.ok) throw new Error(`Mentors: ${r.status}`); return r.json(); }),
      fetch('/api/startups').then(r => { if (!r.ok) throw new Error(`Startups: ${r.status}`); return r.json(); }),
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
                  <p className="text-4xl font-black tabular-nums text-white leading-none"
                     style={{ letterSpacing: '-0.03em' }}>
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
          <Card className="p-6 h-full">
            {/* header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em]"
                   style={{ color: C.muted }}>
                  Daily Pairings
                </p>
                <h3 className="text-base font-black text-white mt-0.5">Total Relationship</h3>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(222,255,154,0.08)', color: C.green, border: `1px solid ${C.green}22` }}>
                {relationships.length} Active
              </span>
            </div>

            {/* list */}
            <div className="space-y-3">
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
                return (
                  <motion.div key={r.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.22 + i * 0.07 }}
                              className="rounded-xl p-4 border transition-all duration-200 group"
                              style={{ background: '#0d0d0d', borderColor: C.border }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = cfg.color + '44')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>

                    {/* status pill */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                           style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </div>
                    </div>

                    {/* pairing */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest w-20 shrink-0"
                              style={{ color: C.muted }}>Mentor</span>
                        <span className="text-sm font-black text-white truncate">
                          {mentorMap[r.mentorId] ?? r.mentorId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest w-20 shrink-0"
                              style={{ color: C.muted }}>Startup</span>
                        <span className="text-sm font-bold truncate" style={{ color: '#aaa' }}>
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
            <div className="mt-6 pt-5 border-t space-y-2" style={{ borderColor: C.border }}>
              {(Object.entries(statusConfig) as [RelStatus, typeof statusConfig[RelStatus]][]).map(([, cfg]) => (
                <div key={cfg.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                  <span className="text-[10px] font-semibold" style={{ color: C.muted }}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── Right: Chart + AI Summary (60%) ── */}
        <motion.div className="lg:col-span-3 space-y-4"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 }}>

          {/* Bar chart card */}
          <Card className="p-7">
            <div className="flex items-center justify-between mb-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em]"
                   style={{ color: C.muted }}>
                  Startup Performance
                </p>
                <h3 className="text-base font-black text-white mt-0.5">Success Rate (%)</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest"
                   style={{ background: 'rgba(59,130,246,0.08)', color: C.blue, borderColor: `${C.blue}30` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.blue }} />
                Live Data
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={startupData} barCategoryGap="38%"
                          margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#181818" vertical={false} />
                  <XAxis dataKey="startup" stroke="#222"
                         tick={{ fill: '#666', fontSize: 12, fontWeight: 700 }}
                         tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#222"
                         tick={{ fill: '#444', fontSize: 11 }}
                         tickLine={false} axisLine={false}
                         tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />}
                           cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                    {startupData.map((d, i) => (
                      <Cell key={i} fill={barFill(d.rate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* chart legend */}
            <div className="flex items-center gap-6 mt-5 pt-5 border-t"
                 style={{ borderColor: C.border }}>
              {[
                { color: C.green,  label: 'High ≥70%' },
                { color: C.blue,   label: 'Mid 55–69%' },
                { color: '#2a2a2a', label: 'Low <55%' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border"
                       style={{ background: l.color, borderColor: l.color === '#2a2a2a' ? '#444' : 'transparent' }} />
                  <span className="text-[11px] font-semibold" style={{ color: C.muted }}>{l.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Summary card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(222,255,154,0.10)', border: `1px solid ${C.green}25` }}>
                <Sparkles size={15} style={{ color: C.green }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em]"
                   style={{ color: C.muted }}>
                  Powered by AI Reasoner
                </p>
                <h4 className="text-sm font-black text-white leading-none mt-0.5">AI Summary</h4>
              </div>
            </div>

            <div className="rounded-xl px-5 py-4 border-l-2 text-sm leading-relaxed font-medium"
                 style={{ background: 'rgba(222,255,154,0.04)', borderLeftColor: C.green, color: '#888' }}>
              <span style={{ color: C.green }} className="font-black">Toy G7</span> shows excellent success
              rate with score of{' '}
              <span style={{ color: C.green }} className="font-black">89%</span>. This indicates{' '}
              <span style={{ color: C.blue }} className="font-black">Enzo</span> is an excellent candidate
              for this startup.
            </div>

            {/* confidence bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest"
                   style={{ color: C.muted }}>
                <span>AI Confidence</span>
                <span style={{ color: C.green }}>92%</span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden"
                   style={{ background: '#1a1a1a' }}>
                <motion.div className="h-full rounded-full"
                             initial={{ width: 0 }}
                             animate={{ width: '92%' }}
                             transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                             style={{ background: `linear-gradient(90deg, ${C.green} 0%, #a8e063 100%)` }} />
              </div>
            </div>
          </Card>

        </motion.div>
      </div>
    </motion.div>
  );
}
