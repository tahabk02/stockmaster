import React from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "../../lib/utils";

interface KPIGridProps {
  kpis: any[];
  colors: string[];
  isRtl: boolean;
}

export const KPIGrid = ({ kpis, colors, isRtl }: KPIGridProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
    {kpis.map((kpi, i) => (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-3xl hover:border-indigo-500/30 transition-all group relative overflow-hidden">
         <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
         <div className={cn("flex justify-between items-start mb-4 md:mb-6", isRtl && "flex-row-reverse")}>
            <div className={cn("p-3 md:p-4 rounded-xl shadow-inner group-hover:rotate-12 transition-transform", `bg-${kpi.color}-500/10 text-${kpi.color}-500`)}><kpi.icon size={20} /></div>
            <div className="h-8 w-16 opacity-30 group-hover:opacity-100 transition-opacity">
               <ResponsiveContainer width="100%" height="100%"><LineChart data={Array.from({length: 10}, () => ({v: Math.random()}))}><Line type="monotone" dataKey="v" stroke={colors[i % colors.length]} strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>
            </div>
         </div>
         <div className={isRtl ? "text-right" : "text-left"}>
            <p className="text-slate-500 font-black uppercase text-[7px] md:text-[8px] tracking-[0.2em] mb-1 leading-none">{kpi.label}</p>
            <div className={cn("flex items-baseline gap-2 md:gap-2.5", isRtl && "flex-row-reverse")}>
               <h3 className="text-xl md:text-3xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none">{kpi.value}</h3>
               <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase italic opacity-40">{kpi.unit}</span>
            </div>
         </div>
      </motion.div>
    ))}
  </div>
);
