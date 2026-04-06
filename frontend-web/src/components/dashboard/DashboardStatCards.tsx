import React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import { GlassCard } from "../ui/pro/GlassCard";

const colorStyles: Record<
  string,
  {
    iconBg: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    cardBorder: string;
    glow: string;
    text: string;
  }
> = {
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-700 dark:text-indigo-400",
    pillBg: "bg-indigo-50 text-indigo-700",
    pillText: "text-indigo-700",
    pillBorder: "border-indigo-100",
    cardBorder: "border-indigo-100",
    glow: "bg-indigo-500",
    text: "text-slate-950",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-700 dark:text-emerald-400",
    pillBg: "bg-emerald-50 text-emerald-700",
    pillText: "text-emerald-700",
    pillBorder: "border-emerald-100",
    cardBorder: "border-emerald-100",
    glow: "bg-emerald-500",
    text: "text-slate-950",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-700 dark:text-amber-400",
    pillBg: "bg-amber-50 text-amber-700",
    pillText: "text-amber-700",
    pillBorder: "border-amber-100",
    cardBorder: "border-amber-100",
    glow: "bg-amber-500",
    text: "text-slate-950",
  },
  rose: {
    iconBg: "bg-rose-50 text-rose-700 dark:text-rose-400",
    pillBg: "bg-rose-50 text-rose-700",
    pillText: "text-rose-700",
    pillBorder: "border-rose-100",
    cardBorder: "border-rose-100",
    glow: "bg-rose-500",
    text: "text-slate-950",
  },
};

const StatCard = ({ title, value, trend, icon, color }: any) => {
  const styles = colorStyles[color] || colorStyles.indigo;
  return (
    <GlassCard
      className={cn(
        "p-6 h-full flex flex-col justify-between overflow-hidden group border",
        styles.cardBorder,
        "bg-white dark:bg-slate-950 shadow-sm",
      )}
      animate
    >
      <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div
          className={cn(
            "p-4 rounded-xl shadow-inner group-hover:scale-110 transition-all duration-500",
            styles.iconBg,
          )}
        >
          {React.cloneElement(icon as React.ReactElement, { size: 18 } as any)}
        </div>
        <div className="flex flex-col items-end">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-xl text-[8px] font-black italic border transition-all",
              styles.pillBg,
              styles.pillBorder,
              styles.pillText,
            )}
          >
            <TrendingUp size={10} /> {trend}
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none italic">
          {title}
        </p>
        <h3
          className={cn(
            "text-3xl md:text-4xl font-black italic tracking-tighter leading-none drop-shadow-sm",
            styles.text,
            "dark:text-white",
          )}
        >
          {value}
        </h3>
      </div>

      <div
        className={cn(
          "absolute -bottom-8 -right-8 w-36 h-36 rounded-full blur-[60px] opacity-10 group-hover:opacity-25 transition-all duration-1000",
          styles.glow,
        )}
      />
    </GlassCard>
  );
};

export const DashboardStatCards = ({ stats, systemHealth, t: tProp }: any) => {
  const { t: tHook } = useTranslation();
  const t = tProp || tHook;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t ? t("dashboard.revenue") : "Daily Revenue"}
        value={`${stats?.revenue?.toLocaleString() || 0} DH`}
        trend="Optimal"
        icon={<TrendingUp size={20} />}
        color="indigo"
      />
      <StatCard
        title={t ? t("dashboard.activeSignals") : "Active Signals"}
        value={stats?.ordersCount || 0}
        trend="Active"
        icon={<TrendingUp size={20} />}
        color="emerald"
      />
      <StatCard
        title={t ? t("dashboard.assetDensity") : "Asset Density"}
        value={stats?.productsCount}
        trend="Optimal"
        icon={<TrendingUp size={20} />}
        color="amber"
      />
      <StatCard
        title={t ? t("dashboard.systemHealth") : "System Health"}
        value={`${systemHealth?.cpu || 0}%`}
        trend="Stable"
        icon={<TrendingUp size={20} />}
        color="rose"
      />
    </div>
  );
};
