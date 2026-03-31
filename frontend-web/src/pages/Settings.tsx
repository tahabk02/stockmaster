import React, { useState, useEffect } from "react";
import { User, Store, ShieldCheck, ChevronRight, Gem, LayoutDashboard, Settings as SettingsIcon, Terminal, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "../store/tenant.slice";
import { useAuth } from "../store/auth.slice";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { SettingsSidebar } from "../components/settings/SettingsSidebar";
import { ProfileSettings } from "../components/settings/ProfileSettings";
import { StoreSettings } from "../components/settings/StoreSettings";
import { SubscriptionSettings } from "../components/settings/SubscriptionSettings";
import { SecuritySettings } from "../components/settings/SecuritySettings";

// --- Hard System Assets ---

const GridPattern = () => (
  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.03] dark:opacity-[0.1] pointer-events-none" />
);

const Scanline = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-50">
    <motion.div 
      animate={{ y: ["-100%", "100%"] }} 
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="w-full h-[100px] bg-gradient-to-b from-transparent via-indigo-500/[0.05] to-transparent opacity-30"
    />
  </div>
);

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");
  const { tenant, fetchTenant } = useTenant();
  const { user, setUser } = useAuth();
  const isRtl = i18n.language === 'ar';

  useEffect(() => { if (!tenant) fetchTenant(); }, [tenant, fetchTenant]);

  const menuItems = [
    { id: "profile", label: t('settings.profile'), icon: User },
    { id: "store", label: t('settings.branding'), icon: Store },
    { id: "plans", label: t('settings.subscriptions'), icon: Gem },
    { id: "security", label: t('settings.security'), icon: ShieldCheck },
  ];

  if (user?.role === "SUPER_ADMIN") menuItems.push({ id: "saas", label: "SaaS Control", icon: LayoutDashboard });

  return (
    <div className={cn("w-full space-y-10 pb-20 animate-reveal relative", isRtl ? 'text-right' : 'text-left')}>
      
      {/* 1. CALIBRATION HEADER */}
      <header className={cn("group relative bg-white dark:bg-slate-950 p-10 rounded-[3rem] shadow-pro dark:shadow-4xl overflow-hidden border border-slate-200 dark:border-white/5 transition-all duration-700", isRtl && "flex-row-reverse md:flex-row")}>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.03] dark:opacity-[0.1] pointer-events-none" />
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/[0.03] dark:bg-indigo-600/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
         <Scanline />

         <div className={cn("relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10", isRtl && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
               <div className="p-4 bg-indigo-600 rounded-[1.8rem] shadow-xl shadow-indigo-500/20 border border-white/20">
                  <SettingsIcon size={28} className="text-white animate-spin-slow" />
               </div>
               <div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">
                    {t('settings.title')}<span className="text-indigo-600">.</span>
                  </h1>
                  <div className={cn("flex items-center gap-3 mt-3 ml-1", isRtl && "flex-row-reverse")}>
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                     <p className="text-[10px] font-black text-slate-500 dark:text-indigo-300 uppercase tracking-[0.4em] italic leading-none">{t('settings.subtitle')}</p>
                  </div>
               </div>
            </div>

            <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
               <div className="text-right hidden md:block">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 italic">Authorized_Agent</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{user?.name || "UNIDENTIFIED"}</p>
               </div>
               <div className="bg-indigo-50 dark:bg-white/5 px-8 py-4 rounded-3xl border border-indigo-100 dark:border-white/10 shadow-inner relative group/plan overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/plan:translate-y-0 transition-transform duration-500 opacity-10" />
                  <p className="text-[9px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-[0.3em] mb-1 italic">LATTICE_PLAN</p>
                  <div className="flex items-center gap-3">
                     <Gem size={14} className="text-indigo-600 dark:text-indigo-400" />
                     <p className="text-base font-black text-indigo-600 dark:text-white uppercase italic leading-none">{tenant?.plan || 'PRO_ELITE'}</p>
                  </div>
               </div>
            </div>
         </div>
      </header>

      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-10", isRtl && "rtl")}>
        {/* Sidebar Terminal */}
        <div className="lg:col-span-4">
           <SettingsSidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} isRtl={isRtl} />
           
           {/* Hard System Status Node */}
           <div className="mt-8 bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 hidden lg:block relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <Activity size={16} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Core_Lattice_Status</span>
                 </div>
                 <div className="space-y-4">
                    <StatusLine label="ENCRYPTION" val="AES-256_ACTIVE" color="emerald" />
                    <StatusLine label="SYNC_FREQUENCY" val="14ms_LATENCY" color="indigo" />
                    <StatusLine label="LATTICE_VERSION" val="v9.4_SOVEREIGN" color="indigo" />
                 </div>
              </div>
           </div>
        </div>

        {/* Main Configuration Deck */}
        <main className="lg:col-span-8 bg-white dark:bg-slate-950 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-pro dark:shadow-4xl min-h-[700px] relative overflow-hidden transition-all duration-700">
          <GridPattern />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.03] dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="p-10 md:p-16 relative z-10">
            <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {activeTab === 'profile' && <ProfileSettings user={user} setUser={setUser} t={t} isRtl={isRtl} />}
                  {activeTab === 'store' && <StoreSettings t={t} isRtl={isRtl} />}
                  {activeTab === 'plans' && <SubscriptionSettings t={t} isRtl={isRtl} />}
                  {activeTab === 'security' && <SecuritySettings t={t} isRtl={isRtl} />}
                </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 backdrop-blur-sm flex justify-between items-center">
             <div className="flex items-center gap-3">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 italic">CALIBRATION_SYNC_AUTHORIZED</span>
             </div>
             <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-indigo-500/40 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatusLine = ({ label, val, color }: any) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-3 group/line">
     <span className="text-[9px] font-black uppercase text-slate-600 group-hover/line:text-slate-400 transition-colors tracking-tighter">{label}</span>
     <span className={cn("text-[10px] font-black italic tabular-nums", `text-${color}-500`)}>{val}</span>
  </div>
);

export default Settings;
