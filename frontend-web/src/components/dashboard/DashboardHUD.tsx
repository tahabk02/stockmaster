import React from "react";
import { motion } from "framer-motion";
import { Zap, Sparkles, Clock, Compass } from "lucide-react";
import { cn } from "../../lib/utils";
import { PulseNode } from "../team/TeamUI";

interface DashboardHUDProps {
  t: (key: string) => string;
  isVendor: boolean;
  currentTime: Date;
  stockValue: number;
  isRtl: boolean;
  storeName?: string;
}

export const DashboardHUD = ({ t, isVendor, currentTime, stockValue, isRtl, storeName }: DashboardHUDProps) => (
  <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="xl:col-span-3 flex flex-col justify-between p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-700 bg-slate-950 dark:bg-black/40 backdrop-blur-3xl border border-white/10 shadow-4xl"
    >
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="scanline" />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

      <div className={cn("relative z-10 flex flex-col md:flex-row justify-between items-start gap-8", isRtl && "flex-row-reverse")}>
        <div className="flex-1">
          <div className={cn("flex flex-wrap items-center gap-4 mb-6", isRtl && "flex-row-reverse")}>
            <div className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center gap-3">
              <PulseNode color="indigo" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">{t('dashboard.nodeActive')}</span>
            </div>
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 shadow-inner">
              <Clock size={10} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl mb-2 text-white leading-none font-black italic tracking-tighter uppercase">
            {storeName ? storeName.split(" ")[0] : (isVendor ? t('dashboard.marketplace') : t("dashboard.title").split(" ")[0])}{" "}
            <span className="text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)] underline decoration-indigo-500/30 underline-offset-8 decoration-8">
              {storeName ? storeName.split(" ").slice(1).join(" ") : (isVendor ? t('team.title').split(" ")[1] : t("dashboard.title").split(" ").slice(1).join(" "))}.
            </span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 mt-6 italic opacity-70">{t('dashboard.protocol')}</p>
        </div>

        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <button className="px-10 py-5 bg-white text-black rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-3xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-4 group border-none active:scale-95">
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" /> {isVendor ? t('dashboard.marketplace') : t('dashboard.scan')}
          </button>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-4xl relative overflow-hidden flex flex-col justify-between border border-indigo-400/20 group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
      <div className="relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-60 mb-2 italic">{t('dashboard.equity')}</p>
        <h2 className="text-4xl font-black italic tracking-tighter leading-none drop-shadow-2xl">{stockValue.toLocaleString()} <span className="text-sm not-italic opacity-40 uppercase">DH</span></h2>
      </div>
      <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex justify-between items-end">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{t('dashboard.velocity')}</p>
          <p className="text-2xl font-black italic leading-none text-emerald-400">SIGNAL_PRIME</p>
        </div>
        <Zap size={28} fill="white" className="opacity-20 animate-pulse text-white" />
      </div>
    </motion.div>
  </div>
);
