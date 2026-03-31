import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Database, ArrowUpRight, Scan, X, Globe2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ZoneNode } from "./WarehouseUI";

interface ZoneDetailsSidebarProps {

  selectedZone: ZoneNode | null;
  setSelectedZone: (zone: ZoneNode | null) => void;
  setIsSyncing: (syncing: boolean) => void;
}

export const ZoneDetailsSidebar = ({ selectedZone, setSelectedZone, setIsSyncing }: ZoneDetailsSidebarProps) => {
  return (
    <aside className="xl:col-span-4 space-y-6 h-full min-h-[450px]">
      <AnimatePresence mode="wait">
         {selectedZone ? (
           <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} key={selectedZone.id} className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-4xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
              <button onClick={() => setSelectedZone(null)} className="absolute top-8 right-8 p-3.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-90 border border-white/5 shadow-2xl"><X size={20} strokeWidth={3} /></button>
              <div className="space-y-10 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className={cn("p-6 rounded-[1.8rem] text-white shadow-4xl rotate-6 group-hover:rotate-0 transition-all duration-1000", selectedZone.status === 'CRITICAL' ? 'bg-rose-600 shadow-rose-500/20' : 'bg-indigo-600 shadow-indigo-500/20')}>
                       <Box size={32} />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" /><span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">Node Selection Active</span></div>
                       <h4 className="text-3xl font-black uppercase italic text-slate-950 dark:text-white leading-none tracking-tighter">{selectedZone.name}</h4>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-[2rem] border border-white/5 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5"><Database size={70} /></div>
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3"><Database size={14} className="text-indigo-500" /> Node Density Matrix</span>
                          <span className="text-2xl font-black italic text-slate-950 dark:text-white">{selectedZone.load}%</span>
                       </div>
                       <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${selectedZone.load}%` }} className="h-full bg-indigo-500 shadow-[0_0_20px_#6366f1]" />
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-[2rem] border border-white/5 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5"><Database size={70} /></div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3"><ArrowUpRight size={14} className="text-indigo-500" /> Unit Manifest</p>
                       <div className="flex items-baseline gap-3">
                          <span className="text-5xl font-black italic text-indigo-500 tracking-tighter">{(selectedZone.capacity * selectedZone.load / 100).toLocaleString()}</span>
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Units_Sync</span>
                       </div>
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsSyncing(true)} className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-4xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 group/btn mt-10 relative overflow-hidden"><div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" /><span className="relative z-10 flex items-center justify-center gap-4"><Scan size={20} /> EXECUTE COGNITIVE SYNC</span></button>
           </motion.div>
         ) : (
           <div className="h-full bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-1000 relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-10" /><motion.div animate={{ rotateY: 360, scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}><Globe2 size={80} strokeWidth={0.5} className="mb-10 text-indigo-500" /></motion.div>
              <h4 className="text-2xl font-black uppercase italic text-white mb-4 tracking-tighter">Lattice Node link required</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 leading-loose">Initialize Interception for<br/>Forensic Telemetry</p>
           </div>
         )}
      </AnimatePresence>
    </aside>
  );
};
