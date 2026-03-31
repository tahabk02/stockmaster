import React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import { GlassCard } from "../ui/pro/GlassCard";

const StatCard = ({ title, value, trend, icon, color }: any) => (
  <GlassCard className="p-6 h-full flex flex-col justify-between overflow-hidden group border-none" animate>
    <div className="relative z-10 flex justify-between items-start mb-6">
      <div className={cn("p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500", `bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`)}>
        {icon}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl text-[8px] font-black italic shadow-inner">
        <TrendingUp size={10} /> {trend}
      </div>
    </div>
    <div className="relative z-10">
       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{title}</p>
       <h3 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none">{value}</h3>
    </div>
    
    {/* Specialized Glow for Stat Cards */}
    <div className={cn("absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-all duration-1000", `bg-${color}-500`)} />
  </GlassCard>
);

export const DashboardStatCards = ({ stats, systemHealth, t: tProp }: any) => {
  const { t: tHook } = useTranslation();
  const t = tProp || tHook;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title={t ? t('dashboard.revenue') : "Daily Revenue"} value={`${stats?.revenue?.toLocaleString() || 0} DH`} trend="Optimal" icon={<TrendingUp size={20} />} color="indigo" />
      <StatCard title={t ? t('dashboard.activeSignals') : "Active Signals"} value={stats?.ordersCount || 0} trend="Active" icon={<TrendingUp size={20} />} color="emerald" />
      <StatCard title={t ? t('dashboard.assetDensity') : "Asset Density"} value={stats?.productsCount} trend="Optimal" icon={<TrendingUp size={20} />} color="amber" />
      <StatCard title={t ? t('dashboard.systemHealth') : "System Health"} value={`${systemHealth?.cpu || 0}%`} trend="Stable" icon={<TrendingUp size={20} />} color="rose" />
    </div>
  );
};
