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
           <div className="bg-white border border-green-200 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                 <BrainCircuit className="w-4 h-4 text-green-600" /> Intelligence Layer
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                 The system continuously processes post-engagement outcomes to retrain the matching algorithm weights.
              </p>
              
              <div className="space-y-3">
                 <InsightStat label="Neural Weight Distribution" value="Active" status="success" />
                 <InsightStat label="Backpropagation Cycle" value="Every 24h" status="regular" />
                 <InsightStat label="Feature Extraction" value="Multimodal" status="regular" />
              </div>
           </div>

           <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-3xl p-8 relative overflow-hidden group">
              <Sparkles className="absolute top-4 right-4 w-6 h-6 text-green-500 opacity-20 group-hover:rotate-12 transition-transform" />
              <div className="relative z-10">
                 <h4 className="text-xl font-black text-gray-800 tracking-tight mb-4 uppercase">Programmable Relationships</h4>
                 <p className="text-[13px] text-green-700/80 leading-relaxed font-medium mb-8">
                    Relationships are treated as tokens of intelligence, allowing the ecosystem to replicate success patterns automatically.
                 </p>
                 <button className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest border border-white/10 shadow-xl shadow-green-600/20">
                    Export Logic Graph <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* Intelligence Charts */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white border border-green-100 rounded-3xl p-8 group">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Network className="w-4 h-4 text-green-600" /> Cluster Saturation
                 </h4>
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                    <PolarGrid stroke="#d1fae5" />
                    <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={10} fontFamily="monospace" />
                    <Radar
                      name="Ecosystem Strength"
                      dataKey="A"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white border border-green-100 rounded-3xl p-8 group">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Matching Efficiency
                 </h4>
                 <span className="text-[9px] font-mono text-emerald-600 font-black">+14.2%</span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                    <XAxis dataKey="epoch" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#111827' }}
                    />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                       {mockEfficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === mockEfficiencyData.length - 1 ? '#16a34a' : '#dcfce7'} stroke={index === mockEfficiencyData.length - 1 ? 'none' : '#bbf7d0'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>

      {/* Predicted Success Pairs Table */}
      <div className="bg-white border border-green-100 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-green-100 flex items-center justify-between">
           <h3 className="font-bold flex items-center gap-2 text-gray-800">
              <Zap className="w-4 h-4 text-amber-500" /> Prescriptive Success Predictions (Next Cycle)
           </h3>
           <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">AI Confidence: 92%</span>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-green-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Industry Cluster</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth Forecast</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ideal Mentor Persona</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action Priority</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
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
    <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100">
       <span className="text-xs text-gray-500 font-medium">{label}</span>
       <span className={cn(
        "text-xs font-bold",
        status === 'success' ? "text-emerald-600" : "text-green-600 uppercase tracking-tighter"
       )}>{value}</span>
    </div>
  );
}

function PredictionRow({ cluster, forecast, mentor, priority }: { cluster: string; forecast: string; mentor: string; priority: string }) {
  return (
    <tr className="hover:bg-green-50/40 transition-colors group">
       <td className="px-8 py-6">
          <p className="text-sm font-black text-gray-800 uppercase tracking-tight group-hover:text-green-600 transition-colors">{cluster}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Market Segment</p>
       </td>
       <td className="px-8 py-6">
          <div className="flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-emerald-500" />
             <span className="text-sm font-black text-emerald-600 tabular-nums">{forecast}</span>
          </div>
       </td>
       <td className="px-8 py-6">
          <div className="p-3 bg-green-50/50 border border-green-100 rounded-xl">
             <p className="text-[11px] text-gray-500 font-medium italic">"{mentor}"</p>
          </div>
       </td>
       <td className="px-8 py-6">
          <span className={cn(
            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
            priority === 'Critical' ? "bg-rose-50 text-rose-600 border-rose-200" :
            priority === 'High' ? "bg-amber-50 text-amber-600 border-amber-200" :
            "bg-gray-100 text-gray-500 border-gray-200"
          )}>
            {priority}
          </span>
       </td>
    </tr>
  );
}
