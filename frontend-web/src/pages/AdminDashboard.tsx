import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdminStats } from '../hooks/useAdminQuery';
import { 
  Users, Building2, Package, CreditCard, Cpu, Binary
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from "react-i18next";

// --- Modular Components ---
import { AdminHeaderHUD } from "../components/dashboard/AdminHeaderHUD";
import { KPIGrid } from "../components/dashboard/KPIGrid";
import { RevenueAnalytics } from "../components/dashboard/RevenueAnalytics";
import { ClusterTopology } from "../components/dashboard/ClusterTopology";
import { InfraTelemetry } from "../components/dashboard/InfraTelemetry";
import { AdminCommandDeck } from "../components/dashboard/AdminCommandDeck";

const Scanline = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-50">
    <motion.div 
      animate={{ y: ["-100%", "100%"] }} 
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="w-full h-[120px] bg-gradient-to-b from-transparent via-indigo-500/[0.05] to-transparent opacity-30"
    />
  </div>
);

export const AdminDashboard = () => {
  const { i18n, t } = useTranslation();
  const { data: stats, isLoading, refetch } = useAdminStats();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kpis = useMemo(() => [
    { label: t('admin.clusterNodes'), value: stats?.kpis?.totalTenants, unit: 'NODES', icon: Building2, color: 'indigo' },
    { label: t('admin.networkMRR'), value: `${(stats?.kpis?.estimatedMRR || 0).toLocaleString()}`, unit: 'EUR', icon: CreditCard, color: 'emerald' },
    { label: t('admin.nodeAgents'), value: stats?.kpis?.totalUsers, unit: 'AGENTS', icon: Users, color: 'rose' },
    { label: t('admin.globalAssets'), value: stats?.kpis?.totalProducts, unit: 'SKUS', icon: Package, color: 'amber' },
  ], [stats, t]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
  const isRtl = i18n.language === 'ar';

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 dark:opacity-10" />
      <div className="relative">
        <div className="w-32 h-32 border-2 border-dashed border-indigo-500/20 rounded-full animate-spin-slow" />
        <Cpu size={48} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
      </div>
      <p className="mt-12 font-black text-[12px] uppercase tracking-[1.5em] text-slate-600 dark:text-white animate-pulse italic mr-[-1.5em]">{t('admin.syncingLattice')}</p>
    </div>
  );

  return (
    <div className={cn("w-full space-y-8 pb-32 animate-reveal relative", isRtl ? 'font-ar text-right' : 'font-sans text-left')}>
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -mr-96 -mt-96 opacity-50" />
      </div>

      <header className="relative overflow-hidden rounded-[3rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-950/40 backdrop-blur-3xl shadow-sm dark:shadow-4xl p-1">
         <Scanline />
         <AdminHeaderHUD stats={stats} currentTime={currentTime} isLoading={isLoading} onRefetch={refetch} isRtl={isRtl} />
      </header>

      <KPIGrid kpis={kpis} colors={COLORS} isRtl={isRtl} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 relative overflow-hidden rounded-[3.5rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-xl shadow-sm dark:shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <RevenueAnalytics data={stats?.growthData || []} isRtl={isRtl} />
         </div>
         <div className="relative overflow-hidden rounded-[3.5rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-xl shadow-sm dark:shadow-2xl">
            <ClusterTopology data={stats?.distribution || []} colors={COLORS} isRtl={isRtl} />
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
         <div className="xl:col-span-2 relative overflow-hidden rounded-[3.5rem] border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-xl shadow-sm dark:shadow-2xl">
            <InfraTelemetry stats={stats} isRtl={isRtl} />
         </div>
         <div className="relative overflow-hidden rounded-[3.5rem] border border-indigo-500/20 dark:border-white/5 bg-indigo-600 shadow-4xl group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20" />
            <AdminCommandDeck isRtl={isRtl} />
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
