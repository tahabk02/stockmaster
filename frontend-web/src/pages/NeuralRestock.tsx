import React, { useState, useEffect } from "react";
import { 
  TrendingUp, AlertCircle, ShoppingCart, 
  ArrowRight, Check, RefreshCcw, Loader2, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const NeuralRestock = () => {
  const { t, i18n } = useTranslation();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/logistics/restock-suggestions");
      setSuggestions(res.data.data);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || t('errors.serverError');
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const isRtl = i18n.language === 'ar';

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center bg-transparent">
       <Zap size={48} className="text-indigo-600 animate-pulse mb-4" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 animate-pulse">{t('common.loading')}</p>
    </div>
  );

  return (
    <div className={cn("w-full p-6 space-y-8 pb-24 font-sans", isRtl ? "text-right" : "text-left")}>
      
      {/* HEADER */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10" />
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
         <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">{t('restock.title')} <span className="text-indigo-500">{t('restock.subtitle')}</span></h1>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.4em] max-w-xl leading-relaxed">
               {t('home.hero.tagline')}. {t('restock.tagline')}
            </p>
         </div>
      </div>

      {/* ACTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT: SUGGESTION ENGINE */}
         <div className="lg:col-span-2 space-y-6">
            <div className={cn("flex items-center justify-between px-4", isRtl && "flex-row-reverse")}>
               <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{t('purchases.summary')}</h3>
               <button 
                 onClick={fetchSuggestions}
                 disabled={refreshing}
                 className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100 dark:border-indigo-500/20 shadow-sm", isRtl && "flex-row-reverse")}
               >
                  {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />} 
                  {t('common.refresh')}
               </button>
            </div>

            <div className="space-y-4">
               {suggestions.length > 0 ? suggestions.map((item, i) => (
                 <motion.div 
                   key={item.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className={cn("bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl flex items-center justify-between group hover:border-indigo-500/30 transition-all", isRtl && "flex-row-reverse")}
                 >
                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                       <div className={cn(
                         "w-16 h-16 rounded-3xl flex items-center justify-center font-black text-xl shadow-inner border-2",
                         item.isCritical ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-transparent"
                       )}>
                          {item.current}
                       </div>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{item.name}</h4>
                          <div className={cn("flex items-center gap-3 mt-1", isRtl && "flex-row-reverse")}>
                             <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">#{item.sku}</span>
                             <span className={cn(
                               "text-[7px] font-black uppercase tracking-widest px-3 py-1 rounded-full border", 
                               item.velocity === "High" ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent"
                             )}>
                                {item.velocity === 'High' ? t('restock.high') : item.velocity} {t('restock.velocity')}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                       <div className={isRtl ? "text-left" : "text-right"}>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('restock.targetPO')}</p>
                          <p className="text-2xl font-black text-indigo-600 italic tracking-tighter">+{item.suggested}</p>
                       </div>
                       <button className="p-5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] hover:scale-110 transition-transform shadow-2xl active:scale-95 border border-white/10 dark:border-transparent">
                          <ArrowRight size={24} className={isRtl ? "rotate-180" : ""} />
                       </button>
                    </div>
                 </motion.div>
               )) : (
                 <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/5 opacity-40">
                    <Check className="mx-auto mb-4 text-emerald-500" size={48} />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">{t('common.success')}. {t('suppliers.messages.noHistorical')}</p>
                 </div>
               )}
            </div>
         </div>

         {/* RIGHT: VENDOR STATUS */}
         <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            <h3 className={cn("text-xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-3", isRtl && "flex-row-reverse")}>
               <TrendingUp className="text-emerald-500" size={24} /> {t('restock.vendorPulse')}
            </h3>
            
            <div className="space-y-8">
               <VendorStatus name="Intel Corp" status={t('restock.active')} time="2d" isRtl={isRtl} t={t} />
               <VendorStatus name="Neuralink" status={t('restock.latency')} time="5d" color="amber" isRtl={isRtl} t={t} />
               <VendorStatus name="CryoTech" status={t('restock.active')} time="1d" isRtl={isRtl} t={t} />
               <VendorStatus name="Nvidia" status={t('restock.idle')} time="--" color="rose" isRtl={isRtl} t={t} />
            </div>

            <div className="mt-12 pt-10 border-t border-white/10 relative">
               <div className={cn("flex justify-between items-end mb-8", isRtl && "flex-row-reverse")}>
                  <div className={isRtl ? "text-right" : "text-left"}>
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block mb-1">{t('restock.totalValuation')}</span>
                     <span className="text-3xl font-black italic tracking-tighter text-indigo-400">42,850.00 <span className="text-xs font-normal opacity-40 uppercase">DH</span></span>
                  </div>
               </div>
               <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95 shadow-indigo-500/30">
                  {t('purchases.confirm')}
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

const VendorStatus = ({ name, status, time, color = "emerald", isRtl, t }: any) => (
  <div className={cn("flex items-center justify-between group cursor-default", isRtl && "flex-row-reverse")}>
     <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
        <div className={cn("w-2 h-2 rounded-full shadow-[0_0_12px_currentColor] animate-pulse", `bg-${color}-500 text-${color}-500`)} />
        <span className="text-base font-black uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">{name}</span>
     </div>
     <div className={isRtl ? "text-left" : "text-right"}>
        <p className={cn("text-[9px] font-black uppercase tracking-widest", `text-${color}-500`)}>{status}</p>
        <p className="text-[10px] font-mono text-slate-500 mt-1">{t('common.lead') || 'Lead'}: {time}</p>
     </div>
  </div>
);
