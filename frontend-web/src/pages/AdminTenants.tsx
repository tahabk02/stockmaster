import React, { useState, useEffect } from 'react';
import { useAdminTenants, useUpdateTenantStatusMutation } from '../hooks/useAdminQuery';
import { 
  ShieldCheck, ShieldX, Database, Search, Filter, 
  RefreshCcw, Radio, Server, Globe2, Settings2, Activity, Cpu, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTranslation } from "react-i18next";

// --- Modular Components ---
import { AdminHeaderHUD } from "../components/dashboard/AdminHeaderHUD";
import { ResourcePulse } from "../components/dashboard/ResourcePulse";
import { NodeControlModal } from "../components/dashboard/NodeControlModal";

const Scanline = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-50">
    <motion.div 
      animate={{ y: ["-100%", "100%"] }} 
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="w-full h-[150px] bg-gradient-to-b from-transparent via-indigo-500/[0.05] to-transparent opacity-30"
    />
  </div>
);

const AdminTenants = () => {
  const { t, i18n } = useTranslation();
  const { data: tenants, isLoading, refetch } = useAdminTenants();
  const updateStatus = useUpdateTenantStatusMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isRtl = i18n.language === 'ar';
  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10" />
      <Globe2 size={64} className="text-indigo-600 animate-spin-slow mb-8 shadow-[0_0_30px_rgba(79,70,229,0.3)]" />
      <p className="font-black text-[12px] uppercase tracking-[1em] text-white animate-pulse italic mr-[-1em]">{t('admin.syncingLattices')}</p>
    </div>
  );

  const filtered = tenants?.filter((t: any) => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={cn("w-full space-y-8 pb-32 animate-reveal relative", isRtl ? "text-right" : "text-left")}>
      <header className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-4xl p-1">
         <Scanline />
         <AdminHeaderHUD stats={{kpis:{estimatedMRR: 8420}}} currentTime={currentTime} isLoading={isLoading} onRefetch={refetch} isRtl={isRtl} />
      </header>
      
      <div className={cn("flex flex-col md:flex-row gap-4 bg-white/10 dark:bg-slate-950 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl transition-all duration-500", isRtl && "md:flex-row-reverse")}>
         <div className="relative flex-1 group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-6" : "left-6")} size={20} />
            <input 
               placeholder={t('admin.scanInstance')} 
               className={cn("w-full bg-slate-50/50 dark:bg-black/40 border-none rounded-2xl py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner italic", isRtl ? "pr-16 text-right" : "pl-16 pr-6")} 
               value={searchTerm} 
               onChange={(e) => setSearchTerm(e.target.value)} 
            />
         </div>
         <div className={cn("flex gap-3", isRtl && "flex-row-reverse")}>
            <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-4 italic shadow-xl">
               <Filter size={18} /> {t('common.filter')}
            </button>
            <button className="px-10 py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase shadow-4xl active:scale-95 transition-all italic hover:bg-indigo-600 hover:text-white">
               {t('common.export')}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filtered?.map((tenant: any, i: number) => (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }} 
               key={tenant._id} 
               className={cn("bg-white dark:bg-slate-900/40 backdrop-blur-xl border rounded-[3rem] p-10 shadow-xl relative overflow-hidden group hover:shadow-4xl transition-all duration-700", tenant.isActive ? "border-white/5 hover:border-indigo-500/30" : "border-rose-500/20 shadow-rose-500/5")}
            >
               <Scanline />
               <div className={cn("absolute top-10", isRtl ? "left-10" : "right-10")}>
                  <div className={cn("flex items-center gap-2.5 px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border shadow-pro", tenant.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20")}>
                     <div className={cn("w-1.5 h-1.5 rounded-full", tenant.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                     {tenant.isActive ? t('admin.nodeActive') : t('admin.suspended')}
                  </div>
               </div>
               
               <div className="relative z-10 space-y-10">
                  <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                     <div className="w-24 h-24 rounded-[2.2rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0 p-4 text-left">
                        {tenant.logo ? <img src={tenant.logo} className="w-full h-full object-contain" /> : <Database className="text-indigo-600" size={40} />}
                     </div>
                     <div className={cn("min-w-0 flex-1", isRtl ? "text-right" : "text-left")}>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white uppercase italic truncate group-hover:text-indigo-500 transition-colors leading-none mb-4">{tenant.name}</h3>
                        <span className="px-4 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase border border-indigo-500/10 shadow-pro italic tracking-widest">{tenant.plan}</span>
                     </div>
                  </div>
                  
                  <div className="p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner space-y-8">
                     <ResourcePulse label={t('admin.assetSaturation')} current={tenant.usage?.products?.current} limit={tenant.usage?.products?.limit} percent={tenant.usage?.products?.percent} isRtl={isRtl} />
                     <ResourcePulse label={t('admin.agentAllocation')} current={tenant.usage?.users?.current} limit={tenant.usage?.users?.limit} percent={tenant.usage?.users?.percent} isRtl={isRtl} />
                  </div>
                  
                  <div className={cn("flex gap-4 pt-4", isRtl && "flex-row-reverse")}>
                     <button onClick={() => setSelectedNode(tenant)} className="flex-[2] py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[11px] font-black uppercase shadow-4xl flex items-center justify-center gap-4 hover:bg-indigo-600 hover:text-white border-none transition-all active:scale-95 italic group/btn">
                        <Settings2 size={18} className="group-hover/btn:rotate-90 transition-transform duration-500"/> {t('admin.nodeControl')}
                     </button>
                     <button onClick={() => updateStatus.mutate({ id: tenant._id, isActive: !tenant.isActive })} className={cn("flex-1 py-6 rounded-2xl text-[11px] font-black uppercase transition-all active:scale-95 shadow-4xl flex items-center justify-center border-none", tenant.isActive ? "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-600 hover:text-white" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-600 hover:text-white")}>
                        {tenant.isActive ? <ShieldX size={20}/> : <ShieldCheck size={20}/>}
                     </button>
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-24 text-left">
         <StatusNode label={t('admin.clusterLoad')} value="84.2%" icon={TrendingUp} color="indigo" isRtl={isRtl} />
         <StatusNode label={t('admin.enginePulse')} value="12.8ms" icon={Cpu} color="emerald" isRtl={isRtl} />
         <StatusNode label={t('admin.globalHealth')} value="OPTIMAL" icon={ShieldCheck} color="indigo" isRtl={isRtl} isPulse />
      </div>

      <AnimatePresence>{selectedNode && <NodeControlModal tenant={selectedNode} onClose={() => setSelectedNode(null)} t={t} isRtl={isRtl} />}</AnimatePresence>
    </div>
  );
};

const StatusNode = ({ label, value, icon: Icon, color, isRtl, isPulse }: any) => (
  <div className={cn("bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all", isRtl && "flex-row-reverse")}>
     <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
        <div className={cn("p-5 rounded-[1.5rem] shadow-inner transition-transform group-hover:rotate-12", `bg-${color}-500/10 text-${color}-600`)}>
           <Icon size={32} />
        </div>
        <div className={isRtl ? "text-right" : "text-left"}>
           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2 italic leading-none">{label}</p>
           <p className="text-4xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none tabular-nums">{value}</p>
        </div>
     </div>
     {isPulse ? <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" /> : <ArrowUpRight size={28} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />}
  </div>
);

export default AdminTenants;
