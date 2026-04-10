import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";

interface RevenueFlowProps {
  data: any[];
  isRtl: boolean;
  t: (key: string) => string;
}

export const RevenueFlow = ({ data, isRtl, t }: RevenueFlowProps) => (
  <div className="xl:col-span-2 bg-white dark:bg-black/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)] relative group overflow-hidden h-full min-h-[380px]">
    <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
    <div className="scanline opacity-10" />
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8", isRtl && "flex-row-reverse")}>
      <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
        <div className="w-1 h-10 bg-indigo-500 rounded-full" />
        <div className={isRtl ? "text-right" : "text-left"}>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{t('dashboard.revenueFlow')}</h2>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">{t('dashboard.temporalResonance')}</p>
        </div>
      </div>
      <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-inner">
         {['7D', '30D', 'ALL'].map(p => (
           <button key={p} className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black transition-all border-none relative overflow-hidden", p === '30D' ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md" : "text-slate-500 hover:text-indigo-500")}>
              <span className="relative z-10 uppercase tracking-widest">{p}</span>
           </button>
         ))}
      </div>
    </div>
    <div className="h-[250px] w-full px-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25}/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="currentColor" opacity={0.03} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 9, fontWeight: '900', letterSpacing: '0.5px'}} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '10 10', opacity: 0.2 }}
            contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '15px'}}
            itemStyle={{color: '#6366f1', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', fontStyle: 'italic'}}
            labelStyle={{color: '#94a3b8', fontSize: '9px', fontWeight: '900', marginBottom: '4px', textTransform: 'uppercase'}}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#6366f1" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorRev)" 
            animationDuration={2000} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
