import React, { useState, useEffect } from "react";
import { Cpu } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { useAuth } from "../store/auth.slice";
import { useTenant } from "../store/tenant.slice";

// --- Modular Components ---
import { DashboardHUD } from "../components/dashboard/DashboardHUD";
import { DashboardStatCards } from "../components/dashboard/DashboardStatCards";
import { RevenueFlow } from "../components/dashboard/RevenueFlow";
import { RecentSignals } from "../components/dashboard/RecentSignals";
import { PredictiveEngine } from "../components/dashboard/PredictiveEngine";
import { LegalHealthHUD } from "../components/dashboard/LegalHealthHUD";

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, productsCount: 0, stockValue: 0, recentOrders: [], chartData: [] });
  const [currentTime, setCurrentTime] = useState(new Date());

  const isVendor = user?.role === "VENDOR";

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, orderRes, healthRes] = await Promise.all([api.get("/products"), api.get("/orders"), api.get("/system/health")]);
      const products = prodRes.data.data || [];
      const orders = orderRes.data.data || [];
      setSystemHealth(healthRes.data.data);
      const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split("T")[0]; });
      const chartData = last7Days.map((date) => ({ name: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(date).getDay()], value: orders.filter((o: any) => o.createdAt.startsWith(date)).reduce((a: number, o: any) => a + (o.totalPrice || 0), 0) }));
      setStats({ revenue: orders.reduce((a: number, o: any) => a + (o.totalPrice || 0), 0), ordersCount: orders.length, productsCount: products.length, stockValue: products.reduce((a: number, p: any) => a + p.price * p.quantity, 0), recentOrders: orders.slice(0, 5), chartData: chartData as any });
    } catch (e) { toast.error(t('errors.networkError')); } finally { setLoading(false); }
  };

  const isRtl = i18n.language === "ar";
  if (loading) return (
    <div className="h-[calc(100vh-150px)] flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
       <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
       <div className="relative">
          <div className="w-24 h-24 border-2 border-dashed border-indigo-500/20 rounded-full animate-spin-slow" />
          <Cpu size={40} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
       </div>
       <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-500 animate-pulse italic">{t('common.loading')}</p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div animate={{ x: [-200, 200] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-1/2 h-full bg-indigo-600/40 blur-sm" />
          </div>
       </div>
    </div>
  );

  return (
    <div className={cn("w-full space-y-6 pb-12 animate-reveal text-slate-900 dark:text-slate-100 relative", isRtl ? "text-right" : "text-left")}>
      {/* Ambient Backdrop - Ultra Pro Detail */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <DashboardHUD t={t} isVendor={isVendor} currentTime={currentTime} stockValue={stats.stockValue} isRtl={isRtl} storeName={tenant?.name} />

      <DashboardStatCards stats={stats} systemHealth={systemHealth} t={t} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
          <RevenueFlow data={stats.chartData} isRtl={isRtl} t={t} />
        </div>
        <div className="xl:col-span-1">
          <PredictiveEngine t={t} isRtl={isRtl} />
        </div>
        <div className="xl:col-span-1">
          <LegalHealthHUD t={t} isRtl={isRtl} />
        </div>
      </div>
      
      <div className="pt-2">
        <RecentSignals orders={stats.recentOrders} isRtl={isRtl} t={t} />
      </div>
    </div>
  );
};

export default Dashboard;
