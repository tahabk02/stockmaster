import React from "react";
import { Brain, Radio, Globe, Target, Crosshair } from "lucide-react";
import { cn } from "../../lib/utils";
import { PulseNode } from "../team/TeamUI";

interface AIHeaderProps {
  isRtl: boolean;
  t: (key: string) => string;
}

export const AIHeader = ({ isRtl, t }: AIHeaderProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      <div className="lg:col-span-3 p-6 md:p-8 bg-slate-900 dark:bg-slate-950 text-white rounded-[2.2rem] shadow-2xl relative overflow-hidden border border-white/10">
         <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
         
         <div className={cn("relative z-10 flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8", isRtl && "md:flex-row-reverse")}>
            <div className={isRtl ? "text-right" : "text-left"}>
              <div className={cn("flex items-center gap-3 mb-6 flex-wrap", isRtl && "flex-row-reverse")}>
                 <div className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center gap-2">
                    <Brain size={14} className="text-indigo-500 animate-pulse" />
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em]">{t('ai.header.deck')}</span>
                 </div>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                    <Radio size={10} className="text-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('ai.header.signal_secure')}</span>
                 </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-[0.8] mb-6 text-white">
                Neural <br />
                <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">{t('nav.ai')}.</span>
              </h1>
              
              <div className={cn("flex flex-wrap gap-4 md:gap-6 pt-6 border-t border-white/5", isRtl && "flex-row-reverse")}>
                 <div className="flex flex-col"><span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{t('ai.header.processing')}</span><span className="text-xs font-black text-white italic">14.8ms</span></div>
                 <div className="flex flex-col"><span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('ai.header.accuracy')}</span><span className="text-xs font-black text-emerald-500 italic uppercase">99.9%</span></div>
                 <div className="flex flex-col"><span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('ai.header.sync')}</span><span className="text-xs font-black text-indigo-400 italic">Universal</span></div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4 shrink-0 w-full md:w-auto">
               <div className="p-6 md:p-8 bg-white/5 backdrop-blur-3xl rounded-[2.2rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center min-w-[160px] w-full md:w-auto">
                  <div className="relative mb-3">
                     <Radio size={32} className="text-indigo-500 animate-pulse" />
                     <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('common.status')}</p>
                  <p className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{t('ai.header.thinking')}</p>
               </div>
            </div>
         </div>
      </div>
      <div className="hidden lg:block lg:col-span-1">
         <div className="bg-indigo-600 h-full rounded-[2.2rem] p-6 text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
            <Crosshair className="absolute bottom-[-15px] right-[-15px] w-24 h-24 opacity-10" />
            <div className="relative z-10 space-y-3">
               <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-60">{t('ai.header.priority')}</p>
               <p className="text-xl font-black italic uppercase leading-none tracking-tighter">{t('ai.header.max_yield')}</p>
            </div>
         </div>
      </div>
    </div>
  );
};
