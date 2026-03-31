import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";

interface RevenueFlowProps {
  data: any[];
  isRtl: boolean;
  t: (key: string) => string;
}

export const RevenueFlow = ({ data, isRtl, t }: RevenueFlowProps) => (
  <div className="xl:col-span-2 bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl relative group overflow-hidden h-full">
    <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10", isRtl && "flex-row-reverse")}>
      <div className={isRtl ? "text-right" : "text-left"}>
        <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none">{t('dashboard.revenueFlow')}</h2>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">{t('dashboard.temporalResonance')}</p>
      </div>
      <div className="flex gap-1.5 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-100 dark:border-white/10">
         {['7D', '30D', 'ALL'].map(p => (
           <button key={p} className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black transition-all border-none bg-transparent", p === '30D' ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}>{p}</button>
         ))}
      </div>
    </div>
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
          <YAxis hide />
          <Tooltip 
            contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
            itemStyle={{color: '#6366f1', fontWeight: 'black', fontSize: '12px', textTransform: 'uppercase'}}
          />
          <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
