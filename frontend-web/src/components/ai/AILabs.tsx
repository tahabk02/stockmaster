import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, Eye, Truck, Target, Search, Loader2, Lightbulb, 
  ShieldCheck, Camera, Fingerprint, X, Activity, TrendingUp, Sparkles, ShoppingCart
} from "lucide-react";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip
} from "recharts";
import { cn } from "../../lib/utils";

interface AILabsProps {
  activeTab: "DIAGNOSTIC" | "VISION" | "SUPPLY";
  setActiveTab: (tab: "DIAGNOSTIC" | "VISION" | "SUPPLY") => void;
  selectedProduct: string;
  setSelectedProduct: (id: string) => void;
  products: any[];
  analyzing: boolean;
  diagnosis: any;
  handleDiagnose: () => void;
  visionImage: string | null;
  setVisionImage: (img: string | null) => void;
  visionResult: any;
  setVisionResult: (res: any) => void;
  handleVisionAnalyze: (e: React.ChangeEvent<HTMLInputElement>) => void;
  supplyData: any;
  radarData: any[];
  isRtl: boolean;
  t: (key: string) => string;
}

export const AILabs = (props: AILabsProps) => {
  const { 
    activeTab, setActiveTab, selectedProduct, setSelectedProduct, products, 
    analyzing, diagnosis, handleDiagnose, visionImage, setVisionImage, 
    visionResult, setVisionResult, handleVisionAnalyze, supplyData, 
    radarData, isRtl, t 
  } = props;
  const visionInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-8 h-full">
       {/* --- CLASSY MINIMAL TABS --- */}
       <div className={cn("flex justify-center p-1.5 bg-slate-100 dark:bg-white/5 backdrop-blur-xl rounded-full border border-white/10 w-fit mx-auto shadow-inner", isRtl && "flex-row-reverse")}>
          {[
            { id: "DIAGNOSTIC", label: "Diagnostic" },
            { id: "VISION", label: "Vision HUD" },
            { id: "SUPPLY", label: "Logistics" }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border-none bg-transparent whitespace-nowrap",
                activeTab === tab.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
               {tab.label}
            </button>
          ))}
       </div>

       <AnimatePresence mode="wait">
          {activeTab === "DIAGNOSTIC" && (
            <motion.div key="diag" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-3xl flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 mb-8">
                  <Target size={32} />
               </div>
               <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter mb-4">Signal Diagnostic</h2>
               <p className="text-slate-500 text-[11px] font-medium uppercase tracking-[0.3em] mb-10 max-w-sm">Deep-scan asset nodes for lattice trajectory and yield health.</p>
               
               <div className="w-full max-w-md space-y-6">
                  <div className="relative group">
                     <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-xs font-black uppercase italic outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-950 dark:text-white appearance-none text-center shadow-inner">
                        <option value="">-- SELECT ASSET NODE --</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                     </select>
                  </div>
                  <button onClick={handleDiagnose} disabled={analyzing || !selectedProduct} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] hover:bg-slate-950 transition-all shadow-2xl disabled:opacity-30 border-none active:scale-95">
                     {analyzing ? <Loader2 className="animate-spin mx-auto" /> : "EXECUTE SCAN"}
                  </button>
               </div>

               {diagnosis && (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="bg-slate-50 dark:bg-black/20 p-8 rounded-[2rem] border border-white/5 flex flex-col items-center">
                       <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 shadow-xl border-2 border-white"><img src={diagnosis.product.image} className="w-full h-full object-cover" alt="" /></div>
                       <h3 className="font-black text-slate-950 dark:text-white uppercase tracking-widest">{diagnosis.product.name}</h3>
                       <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-indigo-600 italic leading-none">{diagnosis.analysis.score}%</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Health Score</span>
                       </div>
                    </div>
                    <div className="bg-indigo-600 p-8 rounded-[2.2rem] text-white shadow-2xl text-left relative overflow-hidden group">
                       <Lightbulb className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">Neural Strategy</p>
                       <p className="text-xl font-bold italic leading-relaxed">"{diagnosis.analysis.advice}"</p>
                    </div>
                 </motion.div>
               )}
            </motion.div>
          )}

          {activeTab === "VISION" && (
            <motion.div key="vision" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-3xl">
               {!visionImage ? (
                 <div onClick={() => visionInputRef.current?.click()} className="w-full aspect-[16/9] rounded-[2rem] border-2 border-dashed border-indigo-500/20 bg-indigo-500/[0.02] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-indigo-500/[0.05] transition-all group overflow-hidden">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><Camera size={32} className="text-indigo-600" /></div>
                    <div className="text-center space-y-2">
                       <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none">Optical Forensics</h3>
                       <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em] italic">Click to transmit visual data node</p>
                    </div>
                 </div>
               ) : (
                 <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-square">
                       <img src={visionImage} className="w-full h-full object-cover" alt="" />
                       {analyzing && <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex items-center justify-center"><Loader2 size={48} className="animate-spin text-white" /></div>}
                    </div>
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">IDENTIFIED: {visionResult?.confidence || '--'}%</span>
                          <h3 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter italic uppercase leading-none">{visionResult?.name || 'ANALYZING...'}</h3>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-2xl border border-white/5 space-y-4">
                          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-[8px] font-black text-slate-400 uppercase">Protocol</span><span className="text-xs font-black text-slate-900 dark:text-white italic">{visionResult?.category || '---'}</span></div>
                          <div className="flex justify-between"><span className="text-[8px] font-black text-slate-400 uppercase">State</span><span className="text-xs font-black text-emerald-500 italic">ACTIVE_NODE</span></div>
                       </div>
                       <button onClick={() => setVisionImage(null)} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-indigo-600 transition-all border-none">RESET OPTICS</button>
                    </div>
                 </div>
               )}
               <input type="file" ref={visionInputRef} className="hidden" accept="image/*" onChange={handleVisionAnalyze} />
            </motion.div>
          )}

          {activeTab === "SUPPLY" && (
            <motion.div key="supply" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-3xl">
                     <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3"><Activity className="text-indigo-600" size={24}/> Logistics Pulse</h3>
                     <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}><PolarGrid stroke="currentColor" opacity={0.1} /><PolarAngleAxis dataKey="subject" tick={{fontSize: 8, fontWeight: 'black', fill: 'currentColor', opacity: 0.5}} /><Radar name="IA Plan" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} /></RadarChart></ResponsiveContainer></div>
                  </div>
                  <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border border-indigo-400/20">
                     <TrendingUp className="absolute -bottom-4 -right-4 w-48 h-48 opacity-10" />
                     <div className="relative z-10 space-y-6">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-tight">System Flux <br /> Optimization.</h3>
                        <p className="text-base font-medium text-indigo-100 opacity-80 leading-relaxed italic">Neural Engine identified potential yield recovery through supply node synchronization.</p>
                        <div className="px-8 py-4 bg-white/10 rounded-2xl w-fit border border-white/10 backdrop-blur-md"><p className="text-[8px] font-black uppercase tracking-widest opacity-60">Efficiency Index</p><p className="text-4xl font-black italic">{supplyData?.healthIndex}%</p></div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};
