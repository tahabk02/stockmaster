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
      className="xl:col-span-3 flex flex-col justify-between p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-1000 bg-slate-950 dark:bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
    >
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="scanline opacity-15" />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/15 via-transparent to-transparent pointer-events-none" />
      
      {/* Cinematic Ambient Glow */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className={cn("relative z-10 flex flex-col md:flex-row justify-between items-start gap-6", isRtl && "flex-row-reverse")}>
        <div className="flex-1">
          <div className={cn("flex flex-wrap items-center gap-3 mb-6", isRtl && "flex-row-reverse")}>
            <div className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-lg">
              <PulseNode color="indigo" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">{t('dashboard.nodeActive')}</span>
            </div>
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 shadow-inner backdrop-blur-md">
              <Clock size={10} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl mb-3 text-white leading-[0.9] font-black italic tracking-tighter uppercase">
            <span className="opacity-20 block text-xs mb-1 tracking-[0.3em] italic">{storeName ? "NODE_REGISTER" : (isVendor ? "MARKET_SYNC" : "SYSTEM_CORE")}</span>
            {storeName ? storeName.split(" ")[0] : (isVendor ? t('dashboard.marketplace') : t("dashboard.title").split(" ")[0])}{" "}
            <span className="text-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              {storeName ? storeName.split(" ").slice(1).join(" ") : (isVendor ? t('team.title').split(" ")[1] : t("dashboard.title").split(" ").slice(1).join(" "))}.
            </span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 mt-6 italic opacity-60 leading-relaxed max-w-xl">
            {t('dashboard.protocol')} // OPTIMAL_v4
          </p>
        </div>

        <div className="flex flex-col items-end gap-5 w-full md:w-auto self-stretch justify-center">
          <button className="w-full md:w-auto px-10 py-5 bg-white text-black rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-indigo-600 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 group border-none active:scale-95 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform relative z-10" /> 
            <span className="relative z-10">{isVendor ? t('dashboard.marketplace') : t('dashboard.scan')}</span>
          </button>
          
          <div className="flex items-center gap-5 pr-2 opacity-30 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">DATA_STREAM</span>
              <span className="text-[9px] font-black text-white uppercase italic tracking-tighter">SECURE_v4</span>
            </div>
            <Compass size={18} className="text-indigo-400 animate-spin-slow" />
          </div>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-[0_30px_80px_rgba(99,102,241,0.2)] relative overflow-hidden flex flex-col justify-between border border-indigo-400/20 group cursor-default"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 grid-pattern opacity-15 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-60 italic">{t('dashboard.equity')}</p>
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter leading-none drop-shadow-xl">
          {stockValue.toLocaleString()} 
          <span className="text-sm not-italic opacity-40 ml-1 uppercase font-black tracking-widest">DH</span>
        </h2>
      </div>

      <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex justify-between items-end">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 leading-none">{t('dashboard.velocity')}</p>
          <p className="text-2xl font-black italic leading-none text-emerald-400 tracking-tighter">PRIME_SIGNAL</p>
        </div>
        <Zap size={28} fill="white" className="text-white relative z-10 opacity-30 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  </div>
);
