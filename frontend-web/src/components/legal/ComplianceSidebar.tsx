import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, Activity, Fingerprint, Zap, TrendingUp, Cpu } from "lucide-react";
import { cn } from "../../lib/utils";

const ComplianceNode = ({ label, val, inverse, icon }: any) => (
  <div className="space-y-4 group/node">
     <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
           <span className="text-white/40 group-hover/node:text-white transition-colors">{icon}</span>
           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 group-hover/node:opacity-100 transition-opacity">{label}</span>
        </div>
        <span className="text-sm font-black italic text-white">{val}%</span>
     </div>
     <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner p-0.5">
        <motion.div 
          initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 2, ease: "easeOut" }} 
          className={cn("h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]", 
            inverse ? (val > 10 ? "bg-rose-400" : "bg-emerald-400") : (val > 90 ? "bg-emerald-400" : (val > 70 ? "bg-amber-400" : "bg-rose-500"))
          )} 
        />
     </div>
  </div>
);

export const ComplianceSidebar = () => {
  return (
    <aside className="xl:col-span-4 space-y-8">
       <div className="bg-indigo-600 text-white p-10 rounded-[3rem] shadow-4xl relative overflow-hidden group border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] opacity-50" />
          <Scale className="absolute top-[-40px] right-[-40px] w-80 h-80 opacity-10 -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none" />
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl"><ShieldCheck size={24} /></div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Risk Control</h3>
             </div>
             
             <div className="space-y-8">
                <ComplianceNode label="SLA Performance Index" val={98.4} icon={<Activity size={12}/>} />
                <ComplianceNode label="Registry Integrity" val={100} icon={<Fingerprint size={12}/>} />
                <ComplianceNode label="Entity Exposure" val={4.2} inverse icon={<Zap size={12}/>} />
             </div>

             <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">Compliance Status</span>
                <span className="px-4 py-1.5 bg-white text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Optimal</span>
             </div>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.5em] italic flex items-center gap-3"><Cpu size={14}/> Analytics Node</h3>
             <div className="flex gap-1"><div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" /><div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-75" /><div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-150" /></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="text-center p-6 bg-slate-50 dark:bg-black/40 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner group/stat hover:border-rose-500/30 transition-colors"><TrendingUp size={16} className="mx-auto mb-3 opacity-30 group-hover/stat:opacity-100 group-hover/stat:text-rose-500 transition-all rotate-90" /><p className="text-[8px] font-black text-slate-400 uppercase mb-2">Expiring</p><p className="text-3xl font-black text-rose-500 italic leading-none">02</p></div>
             <div className="text-center p-6 bg-slate-50 dark:bg-black/40 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner group/stat hover:border-amber-500/30 transition-colors"><Activity size={16} className="mx-auto mb-3 opacity-30 group-hover/stat:opacity-100 group-hover/stat:text-amber-500 transition-all" /><p className="text-[8px] font-black text-slate-400 uppercase mb-2">Pending</p><p className="text-3xl font-black text-amber-500 italic leading-none">05</p></div>
          </div>
          <button className="w-full mt-8 py-5 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 transition-all border-none bg-transparent">Extract Forensic Report</button>
       </div>
    </aside>
  );
};
