import React, { useEffect, useState } from "react";
import api from "../api/client";
import { 
  ArrowUpRight, ArrowDownRight, Package, Search, Filter, 
  Clock, Cpu, History, AlertCircle, Info, ChevronRight,
  TrendingUp, TrendingDown, RefreshCcw, Database, Shield,
  Activity, Radio, Box, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

export const StockLedger = () => {
  const { t, i18n } = useTranslation();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/stock/movements");
      setMovements(data.data || []);
    } catch (error) {
      toast.error(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = movements.filter(m => 
    m.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.productId?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isRtl = i18n.language === 'ar';

  return (
    <div className={`w-full space-y-6 pb-24 px-2 md:px-4 transition-all ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* 1. TACTICAL TELEMETRY HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 p-6 md:p-8 bg-slate-900 dark:bg-slate-950 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5 group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5" />
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" />
           
           <div className={cn("relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6", isRtl && "md:flex-row-reverse")}>
              <div>
                <div className={cn("flex items-center gap-3 mb-4", isRtl && "flex-row-reverse")}>
                   <div className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">{t('sales.registry')} Active</span>
                   </div>
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentTime.toLocaleTimeString()}</span>
                   </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                  {t('stockLedger.title')} <span className="text-indigo-500">{t('stockLedger.subtitle')}</span>
                </h1>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4 ml-1">{t('stockLedger.sync')}</p>
              </div>

              <div className="flex gap-4">
                 <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center min-w-[100px]">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('stockLedger.stats.volume')}</p>
                    <p className="text-xl font-black text-white italic">{movements.length}</p>
                 </div>
                 <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center min-w-[100px]">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('stockLedger.stats.integrity')}</p>
                    <p className="text-xl font-black text-emerald-400 italic">100%</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-6 md:p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between group cursor-pointer border border-indigo-400/20">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10">
              <Database size={24} className="mb-6 opacity-60" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">{t('stockLedger.stats.registrySize')}</p>
              <h2 className="text-4xl font-black tracking-tighter italic leading-none">{movements.length} <span className="text-xs opacity-40 uppercase not-italic">{t('stockLedger.stats.nodes')}</span></h2>
           </div>
           <button onClick={fetchMovements} className="relative z-10 w-full mt-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-black text-[8px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
              <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> {t('stockLedger.actions.refresh')}
           </button>
        </div>
      </div>

      {/* 2. FORENSIC FILTER HUD */}
      <div className={cn("flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900/40 backdrop-blur-xl p-3 rounded-[1.8rem] border border-slate-100 dark:border-white/5 shadow-xl", isRtl && "md:flex-row-reverse")}>
         <div className="relative flex-1 group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors", isRtl ? "right-4" : "left-4")} size={16} />
            <input 
               placeholder={t('stockLedger.actions.placeholder')}
               className={cn("w-full bg-slate-50/50 dark:bg-slate-950/50 border-none rounded-xl py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner", isRtl ? "pr-12 pl-4" : "pl-12 pr-4")}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
            <button className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-[9px] font-black uppercase text-slate-400 border border-slate-100 dark:border-white/5 hover:text-indigo-600 transition-all flex items-center gap-2">
               <Filter size={14} /> {t('common.filter')}
            </button>
            <button className="px-6 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-95">
               {t('common.export')}
            </button>
         </div>
      </div>

      {/* 3. ADAPTIVE LEDGER INTERFACE */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden">
         {/* Desktop Table View */}
         <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className={`w-full border-collapse ${isRtl ? 'text-right' : 'text-left'}`}>
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/50 text-[8px] font-black uppercase text-slate-400 tracking-[0.4em] border-b border-slate-100 dark:border-white/10">
                     <th className="px-8 py-6">{t('stockLedger.table.signature')}</th>
                     <th className="px-8 py-6">{t('stockLedger.table.id')}</th>
                     <th className="px-8 py-6 text-center">{t('stockLedger.table.protocol')}</th>
                     <th className="px-8 py-6 text-center">{t('stockLedger.table.payload')}</th>
                     <th className="px-8 py-6">{t('stockLedger.table.reference')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                  <AnimatePresence>
                     {loading ? (
                        <tr><td colSpan={5} className="py-32 text-center">
                           <div className="relative inline-block">
                              <Cpu size={40} className="animate-spin text-indigo-600" />
                              <div className="absolute inset-0 scale-150 border-2 border-indigo-500/10 rounded-full animate-ping" />
                           </div>
                           <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">{t('common.loading')}</p>
                        </td></tr>
                     ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="py-24 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest italic opacity-30">Registry State: {t('common.noData')}</td></tr>
                     ) : filtered.map((m, i) => (
                        <motion.tr 
                           initial={{ opacity: 0, y: 10 }} 
                           animate={{ opacity: 1, y: 0 }} 
                           transition={{ delay: i * 0.02 }}
                           key={m._id} 
                           className="hover:bg-indigo-500/[0.03] transition-all group cursor-default"
                        >
                           <td className="px-8 py-6">
                              <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                                 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center border border-slate-100 dark:border-white/5 shadow-inner">
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none mb-0.5">{new Date(m.createdAt).getDate()}</span>
                                    <span className="text-[6px] font-black text-indigo-500 uppercase">{new Date(m.createdAt).toLocaleString('default', { month: 'short' })}</span>
                                 </div>
                                 <div className={cn("flex flex-col", isRtl && "items-end")}>
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{new Date(m.createdAt).toLocaleTimeString()}</span>
                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{t('stockLedger.table.tsRegistry')}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden p-1 shrink-0 group-hover:border-indigo-500/30 transition-colors">
                                    {m.productId?.image ? <img src={m.productId.image} className="w-full h-full object-cover rounded-xl" /> : <Box className="text-slate-200 m-auto mt-2" size={20} />}
                                 </div>
                                 <div className={cn("flex flex-col min-w-0", isRtl && "items-end")}>
                                    <span className="text-xs font-black text-slate-950 dark:text-white uppercase truncate italic tracking-tight">{m.productId?.name || t('stockLedger.table.terminated')}</span>
                                    <span className="text-[8px] font-mono font-bold text-indigo-500 mt-1 opacity-60">ID: #{m.productId?.sku || "---"}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <div className={cn(
                                 "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                 m.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                              )}>
                                 <div className={cn("w-1 h-1 rounded-full animate-pulse", m.type === 'IN' ? "bg-emerald-500" : "bg-rose-500")} />
                                 {m.type === 'IN' ? t('stockLedger.table.incoming') : t('stockLedger.table.outgoing')}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <span className={cn(
                                 "text-lg font-black italic tracking-tighter",
                                 m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'
                              )}>
                                 {m.type === 'IN' ? '+' : '-'}{m.quantity} <span className="text-[9px] not-italic opacity-40 uppercase ml-1">U</span>
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className={cn("flex flex-col max-w-[200px]", isRtl && "items-end")}>
                                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 italic truncate group-hover:whitespace-normal transition-all leading-relaxed">"{m.reason || t('stockLedger.table.auto')}"</span>
                                 <div className={cn("flex items-center gap-2 mt-2", isRtl && "flex-row-reverse")}>
                                    <span className="text-[7px] font-black uppercase text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">{m.referenceType || "System"}</span>
                                    <span className="text-[7px] font-mono text-slate-400">REF: {m.referenceId?.slice(-6) || "---"}</span>
                                 </div>
                              </div>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>

         {/* Mobile Card View */}
         <div className="md:hidden p-4 space-y-4">
            {loading ? (
               <div className="py-20 text-center opacity-30"><Cpu size={32} className="animate-spin mx-auto mb-4" /><p className="text-[10px] font-black uppercase">{t('common.loading')}</p></div>
            ) : filtered.map((m, i) => (
               <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={m._id} 
                  className={cn(
                     "p-5 rounded-3xl border bg-white dark:bg-slate-950/50 shadow-sm relative overflow-hidden",
                     m.type === 'IN' ? "border-emerald-500/10" : "border-rose-500/10"
                  )}
               >
                  <div className={cn("flex justify-between items-start mb-4", isRtl && "flex-row-reverse")}>
                     <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 p-1">
                           {m.productId?.image ? <img src={m.productId.image} className="w-full h-full object-cover rounded-lg" /> : <Box className="text-slate-200 m-auto mt-2" size={16} />}
                        </div>
                        <div className={isRtl ? "text-right" : "text-left"}>
                           <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[120px]">{m.productId?.name || t('stockLedger.table.terminated')}</h3>
                           <p className="text-[8px] font-mono text-indigo-500 uppercase">#{m.productId?.sku || "---"}</p>
                        </div>
                     </div>
                     <span className={cn(
                        "text-xl font-black italic tracking-tighter",
                        m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'
                     )}>
                        {m.type === 'IN' ? '+' : '-'}{m.quantity}
                     </span>
                  </div>
                  <div className={cn("flex justify-between items-end pt-4 border-t border-slate-100 dark:border-white/5", isRtl && "flex-row-reverse")}>
                     <div className={cn("space-y-1", isRtl ? "text-right" : "text-left")}>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(m.createdAt).toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-slate-500 italic leading-none">"{m.reason || t('stockLedger.table.auto')}"</p>
                     </div>
                     <span className={cn(
                        "px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border",
                        m.type === 'IN' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                     )}>{m.type}</span>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      {/* FOOTER LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-8 py-10 opacity-30">
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{t('stockLedger.legend.injected')}</span></div>
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{t('stockLedger.legend.extracted')}</span></div>
         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{t('stockLedger.legend.pulse')}</span></div>
      </div>

    </div>
  );
};

export default StockLedger;
