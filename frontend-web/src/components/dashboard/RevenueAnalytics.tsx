import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, Scan } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

interface RevenueAnalyticsProps {
  data: any[];
  isRtl: boolean;
}

export const RevenueAnalytics = ({ data, isRtl }: RevenueAnalyticsProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-6 md:p-8 rounded-[2.2rem] md:rounded-[2.8rem] border border-white/10 shadow-4xl relative overflow-hidden group h-full transition-all">
       <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
       <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><BarChart3 size={150} /></div>
       <div className={cn("flex justify-between items-center mb-6 md:mb-10 relative z-10", isRtl && "flex-row-reverse")}>
          <div className={isRtl ? "text-right" : "text-left"}>
             <h2 className="text-lg md:text-xl font-black text-slate-950 dark:text-white uppercase tracking-widest italic flex items-center gap-3">
                <Scan size={24} className="text-indigo-500" /> {t('admin.revenue.expansion')}
             </h2>
             <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic">{t('admin.revenue.growthSignal')}</p>
          </div>
          <div className="hidden sm:block px-4 py-1.5 bg-indigo-600 rounded-full shadow-2xl animate-pulse">
             <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Signal_Active</span>
          </div>
       </div>
       <div className="h-[200px] md:h-64 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
                <defs><linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.03} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 'black', fill: '#64748b', opacity: 0.6}} dy={10} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}} 
                   labelStyle={{color: '#6366f1', fontWeight: '900', marginBottom: '4px', fontSize: '10px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#adminRev)" animationDuration={2000} />
             </AreaChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
};
