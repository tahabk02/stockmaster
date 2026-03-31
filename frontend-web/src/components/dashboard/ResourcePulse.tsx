import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ResourcePulseProps {
  label: string;
  current: number;
  limit: number;
  percent: number;
  isRtl: boolean;
}

export const ResourcePulse = ({ label, current, limit, percent, isRtl }: ResourcePulseProps) => (
  <div className="space-y-3">
    <div className={cn("flex justify-between items-end px-1", isRtl && "flex-row-reverse")}>
       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
       <p className="text-[10px] font-black text-slate-900 dark:text-white italic">{current} / {limit}</p>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner relative border border-slate-200 dark:border-white/5">
       <motion.div 
         initial={{ width: 0 }} 
         animate={{ width: `${percent}%` }} 
         transition={{ duration: 1.5, ease: "circOut" }}
         className={cn(
           "h-full relative z-10",
           percent > 90 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 
           percent > 70 ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 
           'bg-indigo-500 shadow-[0_0_15px_#6366f1]'
         )} 
       />
       {percent > 85 && <div className="absolute inset-0 bg-rose-500/20 animate-pulse" />}
    </div>
  </div>
);
