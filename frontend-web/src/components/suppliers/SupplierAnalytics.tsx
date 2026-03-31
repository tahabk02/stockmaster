import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from "lucide-react";
import { cn } from "../../lib/utils";

const AgingNode = ({ label, value, color, isRtl }: any) => {
  const colors: any = { emerald: "bg-emerald-500 shadow-[0_0_15px_#10b981]", amber: "bg-amber-500 shadow-[0_0_15px_#f59e0b]", orange: "bg-orange-500 shadow-[0_0_15px_#f97316]", rose: "bg-rose-500 shadow-[0_0_15px_#f43f5e]" };
  return (
    <div className="space-y-3">
       <div className={cn("flex justify-between items-end px-1", isRtl && "flex-row-reverse")}>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
          <span className="text-xs font-black italic text-slate-900 dark:text-white">{value}%</span>
       </div>
       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
          <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full ${colors[color]} rounded-full`} />
       </div>
    </div>
  );
};

export const SupplierAnalytics = ({ chartData, isOverLimit, isRtl }: any) => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
     <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-colors">
        <div className={cn("flex justify-between items-center mb-12", isRtl && "flex-row-reverse")}>
           <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter">Flux History.</h3>
           <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest">Signal Pulse</div>
        </div>
        <div className="h-[400px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                 <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={isOverLimit ? "#f43f5e" : "#6366f1"} stopOpacity={0.2}/><stop offset="95%" stopColor={isOverLimit ? "#f43f5e" : "#6366f1"} stopOpacity={0}/></linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: 'currentColor', opacity: 0.5}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: 'currentColor', opacity: 0.5}} />
                 <Tooltip contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '24px', border: 'none', color: '#fff'}} />
                 <Area type="monotone" dataKey="balance" stroke={isOverLimit ? "#f43f5e" : "#6366f1"} strokeWidth={5} fill="url(#colorBalance)" animationDuration={2000} />
              </AreaChart>
           </ResponsiveContainer>
        </div>
     </div>

     <div className="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col transition-all h-full">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Activity size={180} /></div>
        <h3 className={cn("text-xl font-black uppercase italic tracking-tighter mb-10 relative z-10", isRtl && "text-right")}>Aging Matrix</h3>
        <div className="space-y-8 relative z-10 flex-1 flex flex-col justify-center">
           <AgingNode label="Current (0-30d)" value={isOverLimit ? 30 : 75} color="emerald" isRtl={isRtl} />
           <AgingNode label="Overdue (31-60d)" value={isOverLimit ? 40 : 15} color="amber" isRtl={isRtl} />
           <AgingNode label="Critical (61-90d)" value={isOverLimit ? 20 : 8} color="orange" isRtl={isRtl} />
           <AgingNode label="Legal Phase (90d+)" value={isOverLimit ? 10 : 2} color="rose" isRtl={isRtl} />
        </div>
        <div className="pt-10 border-t border-white/5 relative z-10">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 text-center">Liquidity Index</p>
           <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(i => <div key={i} className={`w-10 h-2 rounded-full ${i <= (isOverLimit ? 2 : 4) ? (isOverLimit ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-indigo-500 shadow-[0_0_10px_#6366f1]') : 'bg-white/5'}`} />)}
           </div>
        </div>
     </div>
  </div>
);
