import React from "react";
import { motion } from "framer-motion";
import { Compass, Globe, Crosshair } from "lucide-react";
import { PulseNode } from "../team/TeamUI";

interface WarehouseHeaderProps {
  agentCount?: number;
}

export const WarehouseHeader = () => {
  return (
    <header className="relative group">
       <div className="absolute inset-0 bg-indigo-600/20 rounded-[2.5rem] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
       <div className="bg-slate-950 dark:bg-black/40 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-4xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="absolute inset-0 grid-pattern opacity-[0.05]" /><div className="scanline" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
             <motion.div whileHover={{ rotate: 90, scale: 1.1 }} className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-white shrink-0"><Compass size={40} strokeWidth={1} /></motion.div>
             <div className="text-center md:text-left space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1"><PulseNode color="indigo" /><span className="text-[9px] font-black uppercase tracking-[0.6em] text-indigo-400 italic">Facility_Cognitive_v5.0</span></div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-white">Neural <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-4 decoration-4">Map.</span></h1>
                <div className="flex flex-wrap gap-6 opacity-60 justify-center md:justify-start">
                   <div className="flex items-center gap-2"><Globe size={12} className="text-indigo-500" /><span className="text-[8px] font-black uppercase tracking-widest italic">Grid_Lattice</span></div>
                   <div className="flex items-center gap-2"><Crosshair size={12} className="text-emerald-500" /><span className="text-[8px] font-black uppercase tracking-widest italic">Z-Axis_Locked</span></div>
                </div>
             </div>
          </div>
          <div className="flex gap-6 relative z-10">
             <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-10 shadow-4xl group/stats hover:bg-white/10 transition-colors">
                <div className="text-center"><p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Matrix Load</p><p className="text-3xl font-black text-white italic leading-none">64.2 <span className="text-[10px] not-italic opacity-30">%</span></p></div>
                <div className="w-px h-14 bg-white/10 group-hover/stats:h-16 transition-all" />
                <div className="text-center"><p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Sync Nodes</p><div className="flex items-center gap-3 justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /><p className="text-3xl font-black text-emerald-400 italic leading-none uppercase text-white">ONLINE</p></div></div>
             </div>
          </div>
       </div>
    </header>
  );
};
