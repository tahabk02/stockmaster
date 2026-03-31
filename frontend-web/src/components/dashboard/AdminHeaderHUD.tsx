import React from "react";
import { motion } from "framer-motion";
import { Terminal, Radio, Globe2, RefreshCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import { PulseNode } from "../team/TeamUI";
import { useTranslation } from "react-i18next";

interface AdminHeaderHUDProps {
  stats: any;
  currentTime: Date;
  isLoading: boolean;
  onRefetch: () => void;
  isRtl: boolean;
}

export const AdminHeaderHUD = ({ stats, currentTime, isLoading, onRefetch, isRtl }: AdminHeaderHUDProps) => {
  const { t } = useTranslation();
  
  return (
    <header className="relative group">
       <div className="absolute inset-0 bg-indigo-600/20 rounded-[2.5rem] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
       <div className={cn("bg-slate-950 dark:bg-black/40 backdrop-blur-3xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-4xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8", isRtl && "lg:flex-row-reverse")}>
          <div className="absolute inset-0 grid-pattern opacity-[0.05]" /><div className="scanline" />
          
          <div className={cn("flex flex-col md:flex-row items-center gap-6 relative z-10", isRtl && "md:flex-row-reverse")}>
             <motion.div whileHover={{ rotate: 90, scale: 1.1 }} className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.5rem] md:rounded-[1.8rem] shadow-2xl flex items-center justify-center text-white shrink-0"><Terminal size={32} /></motion.div>
             <div className={isRtl ? "text-right" : "text-left"}>
                <div className={cn("flex items-center justify-center md:justify-start gap-3 mb-1", isRtl && "md:justify-end")}>
                   <PulseNode color="indigo" />
                   <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">{t('admin.hud.saasCoreCommand')}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white truncate max-w-[500px]">
                   {t('admin.hud.systemOverlord').split(' ')[0]} <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-4 decoration-4">{t('admin.hud.systemOverlord').split(' ')[1]}.</span>
                </h1>
                <div className={cn("flex gap-4 opacity-40 justify-center md:justify-start mt-2", isRtl && "md:justify-end")}>
                   <span className="text-[7px] font-black uppercase tracking-widest italic">Lattice_v4.2</span>
                   <span className="text-[7px] font-black uppercase tracking-widest italic">Sync_{currentTime.toLocaleTimeString()}</span>
                </div>
             </div>
          </div>

          <div className={cn("flex flex-wrap justify-center gap-4 md:gap-6 relative z-10 w-full lg:w-auto", isRtl && "lg:flex-row-reverse")}>
             <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] flex flex-col items-center justify-center min-w-[140px] shadow-3xl flex-1 md:flex-none">
                <Radio size={24} className="text-indigo-500 animate-pulse mb-2" />
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">{t('admin.hud.globalHealth')}</p>
                <p className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">{t('admin.hud.prime')}</p>
             </div>
             <div onClick={onRefetch} className={cn("bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl border border-indigo-400/20 relative overflow-hidden group/mrr cursor-pointer active:scale-95 transition-all min-w-[180px] flex-1 md:flex-none", isRtl ? "text-right" : "text-left")}>
                <div className={cn("absolute top-0 p-3 opacity-10 group-hover/mrr:scale-125 transition-transform", isRtl ? "left-0" : "right-0")}><Globe2 size={40} /></div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-1 opacity-60">{t('admin.hud.systemYield')}</p>
                <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none tabular-nums">{(stats?.kpis?.estimatedMRR || 0).toLocaleString()} <span className="text-[10px] not-italic opacity-40 uppercase">EUR</span></h2>
                <button className={cn("mt-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-[7px] font-black uppercase border border-white/10 hover:bg-white hover:text-indigo-600 transition-all border-none", isRtl && "flex-row-reverse")}>
                   <RefreshCcw size={8} className={isLoading ? "animate-spin" : ""} /> {t('admin.hud.syncRegistry')}
                </button>
             </div>
          </div>
       </div>
    </header>
  );
};
