import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Zap, 
  Target, 
  Users, 
  ArrowRight,
  Sparkles,
  Network
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { cn } from '../lib/utils';

const mockRadarData = [
  { subject: 'Fintech', A: 120, fullMark: 150 },
  { subject: 'HealthTech', A: 98, fullMark: 150 },
  { subject: 'AI Ops', A: 86, fullMark: 150 },
  { subject: 'SaaS', A: 140, fullMark: 150 },
  { subject: 'Logistics', A: 70, fullMark: 150 },
];

const mockEfficiencyData = [
  { epoch: 'Cycle 1', accuracy: 65, connections: 45 },
  { epoch: 'Cycle 2', accuracy: 72, connections: 52 },
  { epoch: 'Cycle 3', accuracy: 85, connections: 68 },
  { epoch: 'Cycle 4', accuracy: 94, connections: 84 },
];

export default function EcosystemInsights() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-12 gap-6">
        {/* Learning Loop Meta */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 glow-indigo relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                 <BrainCircuit className="w-4 h-4 text-indigo-400" /> Intelligence Layer
              </h3>
              <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
                 The system continuously processes post-engagement outcomes to retrain the matching algorithm weights.
              </p>
              
              <div className="space-y-3">
                 <InsightStat label="Neural Weight Distribution" value="Active" status="success" />
                 <InsightStat label="Backpropagation Cycle" value="Every 24h" status="regular" />
                 <InsightStat label="Feature Extraction" value="Multimodal" status="regular" />
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden group">
              <Sparkles className="absolute top-4 right-4 w-6 h-6 text-indigo-400 opacity-20 group-hover:rotate-12 transition-transform" />
              <div className="relative z-10">
                 <h4 className="text-xl font-black text-white tracking-tight mb-4 uppercase">Programmable Relationships</h4>
                 <p className="text-[13px] text-indigo-300/80 leading-relaxed font-medium mb-8">
                    Relationships are treated as tokens of intelligence, allowing the ecosystem to replicate success patterns automatically.
                 </p>
                 <button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest border border-white/10 shadow-xl shadow-indigo-600/20">
                    Export Logic Graph <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* Intelligence Charts */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 group">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <Network className="w-4 h-4 text-indigo-500" /> Cluster Saturation
                 </h4>
                 <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                    <Radar
                      name="Ecosystem Strength"
                      dataKey="A"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 group">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Matching Efficiency
                 </h4>
                 <span className="text-[9px] font-mono text-emerald-400 font-black">+14.2%</span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                       {mockEfficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === mockEfficiencyData.length - 1 ? '#6366f1' : '#0f172a'} stroke={index === mockEfficiencyData.length - 1 ? 'none' : '#1e293b'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>

      {/* Predicted Success Pairs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Prescriptive Success Predictions (Next Cycle)
           </h3>
           <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">AI Confidence: 92%</span>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-950/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Industry Cluster</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Growth Forecast</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ideal Mentor Persona</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action Priority</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                 <PredictionRow 
                  cluster="Fintech Infrastructure" 
                  forecast="+24% Success" 
                  mentor="Regulatory Compliance Experts" 
                  priority="High" 
                 />
                 <PredictionRow 
                  cluster="Generative AI (Healthcare)" 
                  forecast="+41% Success" 
                  mentor="Pharma-Tech Founders" 
                  priority="Critical" 
                 />
                 <PredictionRow 
                  cluster="B2B Logistics" 
                  forecast="+12% Success" 
                  mentor="Operational Efficiency Specialists" 
                  priority="Normal" 
                 />
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function InsightStat({ label, value, status }: { label: string, value: string, status: 'success' | 'regular' }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
       <span className="text-xs text-slate-400 font-medium">{label}</span>
       <span className={cn(
        "text-xs font-bold",
        status === 'success' ? "text-emerald-400" : "text-indigo-400 uppercase tracking-tighter"
       )}>{value}</span>
    </div>
  );
}

function PredictionRow({ cluster, forecast, mentor, priority }: { cluster: string; forecast: string; mentor: string; priority: string }) {
  return (
    <tr className="hover:bg-slate-800/30 transition-colors group">
       <td className="px-8 py-6">
          <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{cluster}</p>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Market Segment</p>
       </td>
       <td className="px-8 py-6">
          <div className="flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-emerald-400" />
             <span className="text-sm font-black text-emerald-400 tabular-nums">{forecast}</span>
          </div>
       </td>
       <td className="px-8 py-6">
          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
             <p className="text-[11px] text-slate-400 font-medium italic">"{mentor}"</p>
          </div>
       </td>
       <td className="px-8 py-6">
          <span className={cn(
            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
            priority === 'Critical' ? "bg-rose-500/10 text-rose-500 border-rose-500/30 glow-rose" :
            priority === 'High' ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
            "bg-slate-800 text-slate-400 border-slate-700"
          )}>
            {priority}
          </span>
       </td>
    </tr>
  );
}
