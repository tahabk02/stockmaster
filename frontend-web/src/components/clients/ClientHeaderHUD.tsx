import React from "react";
import { Contact, Radio, Activity, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ClientHeaderHUDProps {
  totalClients: number;
  totalExposure: number;
  isRtl: boolean;
  t: (key: string) => string;
}

export const ClientHeaderHUD = ({ totalClients, totalExposure, isRtl, t }: ClientHeaderHUDProps) => (
  <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-slate-950 text-white p-10 md:p-12 rounded-[3.5rem] shadow-4xl relative overflow-hidden shrink-0 border border-white/10">
     {/* TECHNICAL UNDERLAY */}
     <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
     <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full -mr-300 -mt-300 blur-[120px] animate-pulse" />
     <div className="scanline opacity-20" />

     <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(79,70,229,0.4)] rotate-3 border-2 border-white/20">
           <Contact size={48} strokeWidth={2.5} />
        </div>
        <div className={cn("text-center md:text-left", isRtl && "md:text-right")}>
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <div className="px-4 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]" />
                 <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">IDENTITY_LATTICE_ACTIVE</span>
              </div>
              <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                 <Radio size={12} className="text-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">SIGNAL_SYNC_OK</span>
              </div>
           </div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-3">
              {t('clients.title')} <span className="text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">{t('clients.subtitle')}.</span>
           </h1>
           <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 italic opacity-70">Sovereign_Client_Registry_OS_v9.4</p>
        </div>
     </div>

     <div className="flex flex-wrap gap-6 relative z-10 w-full xl:w-auto">
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-12 shadow-4xl grow">
           <div className="flex flex-col items-center md:items-start gap-3">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-2">
                 <Globe size={10} className="text-indigo-500" /> Active_Nodes
              </p>
              <div className="flex items-baseline gap-3">
                 <span className="text-5xl font-black text-white italic tracking-tighter">{totalClients}</span>
                 <span className="text-[10px] font-black text-indigo-500 uppercase">Deployed</span>
              </div>
              <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ duration: 2 }} className="h-full bg-indigo-600" />
              </div>
           </div>

           <div className="hidden md:block w-px h-20 bg-white/10" />

           <div className="flex flex-col items-center md:items-start gap-3">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-2">
                 <Activity size={10} className="text-rose-500" /> Global_Exposure
              </p>
              <div className="flex items-baseline gap-3">
                 <span className="text-5xl font-black text-rose-500 italic tracking-tighter">{totalExposure.toLocaleString()}</span>
                 <span className="text-[10px] font-black text-rose-900 uppercase tracking-widest">MAD</span>
              </div>
              <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: "40%" }} transition={{ duration: 2, delay: 0.5 }} className="h-full bg-rose-600" />
              </div>
           </div>
        </div>
     </div>
  </header>
);
