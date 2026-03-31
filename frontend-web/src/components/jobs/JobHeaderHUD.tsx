import React from "react";
import { RefreshCw, Play, Activity, CheckCircle2, ShieldAlert, Cpu, Radio, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { PulseNode } from "../team/TeamUI";
import { motion } from "framer-motion";

interface JobHeaderHUDProps {
  stats: {
    total: number;
    running: number;
    failed: number;
    completed: number;
  };
  onRefresh: () => void;
  onRunAll: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const StatNode = ({ label, value, color, icon: Icon }: any) => (
  <div className="flex flex-col gap-1 group cursor-crosshair">
    <div className="flex items-center gap-2">
      <div className={cn("w-1 h-1 rounded-full animate-pulse", `bg-${color}-500 shadow-[0_0_8px_currentColor]`)} />
      <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <Icon size={12} className={cn(`text-${color}-500 group-hover:scale-110 transition-transform`)} />
      <span className="text-xl font-black text-white italic tracking-tighter leading-none">{value}</span>
    </div>
  </div>
);

const SaturationGauge = ({ value }: { value: number }) => (
  <div className="relative w-14 h-14 flex items-center justify-center">
    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-white/5" />
      <motion.circle
        cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="10"
        strokeDasharray="251.2"
        initial={{ strokeDashoffset: 251.2 }}
        animate={{ strokeDashoffset: 251.2 - (251.2 * value) / 100 }}
        transition={{ duration: 2, ease: "easeOut" }}
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center scale-75">
      <span className="text-[10px] font-black text-white leading-none">{value}%</span>
    </div>
  </div>
);

export const JobHeaderHUD = ({ stats, onRefresh, onRunAll, isRtl, t }: JobHeaderHUDProps) => (
  <header className="bg-slate-950 text-white p-6 md:p-8 rounded-[2.5rem] shadow-4xl relative overflow-hidden group border border-white/5">
    <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
    <div className="scanline opacity-20" />
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -mr-48 -mt-48" />

    <div className={cn("relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8", isRtl && "flex-row-reverse")}>
      <div className="flex items-center gap-6">
        <div className="relative">
           <div className="p-5 bg-indigo-600 rounded-[1.8rem] shadow-[0_0_40px_rgba(79,70,229,0.4)] rotate-3 group-hover:rotate-180 transition-transform duration-1000 relative border border-white/20">
             <Cpu size={28} className="animate-pulse" />
           </div>
           <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-lg border-2 border-slate-950">
              <ShieldAlert size={10} color="black" />
           </div>
        </div>
        <div className={isRtl ? "text-right" : "text-left"}>
          <div className={cn("flex items-center gap-2 mb-1", isRtl && "flex-row-reverse")}>
            <div className="px-2 py-0.5 bg-indigo-500/20 rounded border border-indigo-500/30 flex items-center gap-1.5">
               <Radio size={8} className="text-indigo-400 animate-pulse" />
               <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">{t('jobs.subtitle')}</span>
            </div>
            <PulseNode color="indigo" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">{t('jobs.title').split(' ')[0]} <span className="text-indigo-500">{t('jobs.title').split(' ')[1]}</span></h1>
        </div>
      </div>

      <div className={cn("flex items-center gap-8 border-l border-white/10 pl-8", isRtl && "border-l-0 border-r pr-8 text-right flex-row-reverse")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           <StatNode label={t('jobs.stats.total')} value={stats.total} color="indigo" icon={Activity} />
           <StatNode label={t('jobs.stats.active')} value={stats.running} color="amber" icon={Zap} />
           <StatNode label={t('jobs.stats.failed')} value={stats.failed} color="rose" icon={ShieldAlert} />
           <StatNode label={t('jobs.stats.done')} value={stats.completed} color="emerald" icon={CheckCircle2} />
        </div>
        <div className="hidden xl:block border-l border-white/5 pl-8">
           <SaturationGauge value={84} />
        </div>
      </div>

      <div className={cn("flex gap-3 w-full lg:w-auto", isRtl && "flex-row-reverse")}>
        <button onClick={onRunAll} className="flex-1 lg:flex-none px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border-none flex items-center justify-center gap-3 group/btn relative overflow-hidden">
          <Play size={14} fill="currentColor" /> {t('jobs.actions.initialize')}
        </button>
        <button onClick={onRefresh} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-indigo-600/20 transition-all active:scale-90 border-none group/refresh">
          <RefreshCw size={20} className="animate-spin-slow group-hover/refresh:rotate-180 transition-transform duration-700" />
        </button>
      </div>
    </div>
  </header>
);
