import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface InsightsFeedProps {
  insights: any[];
  isRtl: boolean;
}

export const InsightsFeed = ({ insights, isRtl }: InsightsFeedProps) => (
  <div className="space-y-4">
     {insights.map((insight, i) => (
       <motion.div 
         initial={{ opacity: 0, x: 20 }}
         whileInView={{ opacity: 1, x: 0 }}
         transition={{ delay: i * 0.1 }}
         key={i} 
         className={cn(
           "p-5 md:p-6 rounded-[1.8rem] md:rounded-[2.2rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 shadow-2xl group hover:border-indigo-500/30 transition-all cursor-default relative overflow-hidden",
           isRtl && "text-right"
         )}
       >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          
          <div className={cn("flex justify-between items-start mb-4 relative z-10", isRtl && "flex-row-reverse")}>
             <div className={cn(
               "p-2.5 md:p-3 rounded-xl shadow-inner group-hover:rotate-12 transition-transform",
               insight.type === "WARNING" ? "bg-rose-500/10 text-rose-600 shadow-rose-500/20" : "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/20"
             )}>
                {insight.type === "WARNING" ? <AlertTriangle size={18} /> : <TrendingUp size={18} />}
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black uppercase text-slate-400 tracking-[0.3em] italic mb-1">Signal ID</span>
                <span className="text-[9px] font-black text-indigo-500 italic uppercase tracking-tighter">#INS_{Math.random().toString(36).substring(7).toUpperCase()}</span>
             </div>
          </div>
          
          <div className="relative z-10 space-y-2">
             <h4 className="font-black text-xs md:text-sm text-slate-950 dark:text-white uppercase tracking-tighter italic leading-none group-hover:text-indigo-600 transition-colors">{insight.title}</h4>
             <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed opacity-80 italic">
                <span className="text-indigo-500/40 mr-1">»</span>
                {insight.message}
             </p>
          </div>

          <div className={cn("mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10", isRtl && "flex-row-reverse")}>
             <div className="flex gap-1">
                {[0, 1, 2].map(dot => <div key={dot} className={cn("w-1 h-1 rounded-full", insight.type === "WARNING" ? "bg-rose-500" : "bg-emerald-500")} />)}
             </div>
             <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
          </div>
       </motion.div>
     ))}
  </div>
);
