import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Rocket, 
  Trash2, 
  Save,
  BrainCircuit,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Startup } from '../types';

export default function StartupOnboarding() {
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Startup> | null>(null);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setIsExtracting(true);

    // Simulate async extraction with mock data
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setExtractedData({
      name: "Lumina Edge",
      industry: "Cybersecurity",
      stage: "mvp",
      description: "AI-driven edge protection for industrial IoT systems.",
      businessModel: "SaaS - Monthly Licensing",
      keyNeeds: ["Venture Capital", "Scale Compliance"],
    });
    setIsExtracting(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
         <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Onboarding Module</h2>
         <h3 className="text-2xl font-black text-white tracking-tight">AI Startup Data Extraction</h3>
         <p className="text-slate-400 text-sm mt-1">Transform unstructured pitch data into ecosystem-ready vectors.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Input Area */}
        <div className="col-span-12 lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 glow-indigo relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <FileText className="w-24 h-24 text-indigo-400 rotate-12" />
           </div>
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 w-fit px-3 py-1 rounded-full border border-slate-800">
                 Source Pitch Deck Data
              </div>
              <textarea 
                className="flex-1 min-h-[320px] bg-slate-950 border border-slate-800/50 rounded-2xl p-6 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 resize-none font-mono selection:bg-indigo-500/30"
                placeholder="Paste application text or pitch summary..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                onClick={handleExtract}
                disabled={isExtracting || !inputText}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs"
              >
                {isExtracting ? (
                   <>
                     <BrainCircuit className="w-5 h-5 animate-spin" /> Structuring...
                   </>
                ) : (
                   <>
                     <Sparkles className="w-4 h-4" /> Extract Vectors
                   </>
                )}
              </button>
           </div>
        </div>

        {/* Output Preview */}
        <div className="col-span-12 lg:col-span-6 h-full">
           <AnimatePresence mode="wait">
             {extractedData ? (
                <motion.div 
                  key="output"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-emerald-500/5 h-full flex flex-col"
                >
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/20">
                         <Rocket className="w-3.5 h-3.5" /> Structured Output
                      </div>
                      <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors" onClick={() => setExtractedData(null)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="space-y-6 flex-1">
                      <EditableField label="Entity Name" value={extractedData.name} />
                      <div className="grid grid-cols-2 gap-4">
                         <EditableField label="Vertical" value={extractedData.industry} />
                         <EditableField label="Lifecycle Stage" value={extractedData.stage} />
                      </div>
                      <EditableField label="Revenue Model" value={extractedData.businessModel} />
                      
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Key Growth Gaps</label>
                         <div className="flex flex-wrap gap-2">
                            {extractedData.keyNeeds?.map((need, i) => (
                               <span key={i} className="px-3 py-1.5 bg-slate-950 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-colors uppercase tracking-tight">
                                  {need}
                               </span>
                            ))}
                            <button className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-500 hover:text-white transition-colors">
                               <Plus className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </div>
                   </div>

                   <button className="w-full mt-10 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-black py-5 rounded-2xl transition-all border border-indigo-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                      <Save className="w-5 h-5" /> Commit to Intelligence Graph
                   </button>
                </motion.div>
             ) : (
                <div key="empty" className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/30 group">
                   <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-indigo-500/30 transition-colors shadow-inner">
                      <Rocket className="w-10 h-10 text-slate-700" />
                   </div>
                   <h4 className="text-slate-400 font-black uppercase tracking-widest mb-3">Awaiting Injection</h4>
                   <p className="text-slate-500 text-xs leading-relaxed max-w-[240px]">
                      Structure startup profiles automatically by feeding the AI reasoner with unstructured pitch data.
                   </p>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EditableField({ label, value }: { label: string, value?: string }) {
  return (
    <div className="space-y-1.5">
       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
       <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-100 flex items-center justify-between group cursor-text">
          {value || 'Not identified'}
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
       </div>
    </div>
  );
}
