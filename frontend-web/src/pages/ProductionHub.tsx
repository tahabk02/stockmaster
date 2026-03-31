import React, { useState, useEffect, useCallback } from "react";
import { 
  Cpu, Cog, Plus, Search, Filter, 
  RefreshCcw, Loader2, Zap, Clock, 
  MoreHorizontal, ChevronRight, Save, X,
  Activity, Target, Box, Layers, Play, CheckCircle2,
  Trash2, AlertTriangle, ArrowRight, TrendingUp, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export const ProductionHub = () => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    formulaId: "",
    quantity: 1,
    notes: ""
  });

  const isRtl = i18n.language === 'ar';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordRes, formRes, prodRes] = await Promise.all([
        api.get("/production/orders"),
        api.get("/production/formulas"),
        api.get("/products")
      ]);
      setOrders(ordRes.data.data || []);
      setFormulas(formRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (e) {
      toast.error(t('production.toast.linkLost'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.formulaId || formData.quantity <= 0) return toast.error(t('production.toast.incomplete'));
    
    setIsSubmitting(true);
    const loadId = toast.loading(t('production.toast.synthesizing'));
    try {
      await api.post("/production/orders", formData);
      toast.success(t('production.toast.dispatched'), { id: loadId });
      setIsModalOpen(false);
      setFormData({ formulaId: "", quantity: 1, notes: "" });
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('production.toast.error'), { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    const loadId = toast.loading(t('production.toast.finalizing'));
    try {
      await api.patch(`/production/orders/${id}/complete`);
      toast.success(t('production.toast.indexed'), { id: loadId });
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('production.toast.failed'), { id: loadId });
    }
  };

  return (
    <div className={cn("w-full space-y-3.5 pb-14 px-2 md:px-4 animate-reveal text-slate-900 dark:text-slate-200", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. COMPACT PRODUCTION HUD */}
      <header className="bg-slate-950 text-white p-5 md:p-7 rounded-[1.8rem] shadow-2xl relative overflow-hidden border border-white/5">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-56 -mt-56 animate-pulse" />
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
            <div className="space-y-1.5">
               <div className={cn("flex items-center gap-3.5", isRtl && "flex-row-reverse")}>
                  <div className="p-2.5 bg-indigo-600 rounded-lg shadow-xl rotate-2">
                     <Cpu size={22} />
                  </div>
                  <div>
                     <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase italic leading-none text-white">{t('production.title').split(' ')[0]} <span className="text-indigo-500">{t('production.title').split(' ').slice(1).join(' ')}.</span></h1>
                     <p className="text-indigo-300 font-bold uppercase text-[7px] tracking-[0.35em] mt-1 opacity-80">{t('production.subtitle')}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-3.5 shrink-0 w-full lg:w-auto">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 rounded-xl flex items-center gap-6 shadow-2xl shadow-black/20 flex-1 lg:flex-none justify-center lg:justify-start">
                  <div className="text-center">
                     <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('production.stats.active')}</p>
                     <p className="text-xl font-black text-indigo-400 italic leading-none">{orders.filter(o => o.status !== 'COMPLETED').length}</p>
                  </div>
                  <div className="w-px h-7 bg-white/10" />
                  <div className="text-center">
                     <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('production.stats.yield')}</p>
                     <p className="text-xl font-black text-emerald-400 italic leading-none">98%</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(true)} className="btn-pro px-6 py-3.5 rounded-xl active:scale-95 flex items-center gap-2.5 flex-1 lg:flex-none justify-center text-[9px]">
                  <Plus size={16} /> {t('production.add')}
               </button>
            </div>
         </div>
      </header>

      {/* 2. OPERATIONAL GRID */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-5">
         
         <div className="xl:col-span-8 space-y-5">
            <div className={cn("flex flex-col md:flex-row gap-2.5 bg-white dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200/60 dark:border-white/5 shadow-pro transition-all", isRtl && "md:flex-row-reverse")}>
               <div className="relative flex-1 group">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-3.5" : "left-3.5")} size={14} />
                  <input placeholder={t('production.filter.placeholder')} className={cn("w-full bg-slate-50/50 dark:bg-black/20 border-none rounded-md py-2 text-[9px] font-black uppercase tracking-widest text-slate-950 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-inner", isRtl ? "pr-9 pl-3.5" : "pl-9 pr-3.5")} />
               </div>
               <div className="flex gap-1.5">
                  <button onClick={fetchData} className="btn-outline p-2.5 rounded-md group border border-slate-200 dark:border-white/10 bg-transparent">
                     <RefreshCcw className={cn("group-hover:rotate-180 transition-transform duration-700 text-slate-400", loading && "animate-spin")} size={14} />
                  </button>
               </div>
            </div>

            <div className="grid gap-3.5">
               {loading ? (
                 <div className="py-16 flex flex-col items-center justify-center opacity-20"><Loader2 size={36} className="animate-spin text-indigo-600 mb-3.5"/><p className="text-[9px] font-black uppercase tracking-[0.5em]">{t('common.loading')}</p></div>
               ) : orders.map((o, i) => (
                 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={o._id} className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-[1.8rem] border border-slate-200/60 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-5 group hover:shadow-lg transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-600/5 rounded-full blur-[35px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
                       <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform duration-700 shrink-0">
                          <Box size={24} />
                       </div>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <div className={cn("flex items-center gap-2.5 mb-1", isRtl && "flex-row-reverse")}>
                             <h4 className="text-base font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">{o.formulaId?.finishedProductId?.name}</h4>
                             <span className={cn("px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-widest border", 
                               o.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-100 border-indigo-500/20")}>SIG_{o.status}</span>
                          </div>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.35em]">{t('production.card.target', { count: o.quantity })}</p>
                       </div>
                    </div>

                    <div className={cn("flex items-center gap-3.5", isRtl && "flex-row-reverse")}>
                       {o.status !== 'COMPLETED' ? (
                         <button onClick={() => handleComplete(o._id)} className="btn-pro px-6 py-3 rounded-lg active:scale-95 flex items-center gap-2.5 text-[9px]">
                            <Play size={12} fill="currentColor" /> {t('production.card.finalize')}
                         </button>
                       ) : (
                         <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest italic leading-tight">{t('production.card.syncOk')}</p>
                         </div>
                       )}
                       <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all active:scale-90 border-none"><MoreHorizontal size={18}/></button>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Formulas Sidebar */}
         <aside className="xl:col-span-4 space-y-5">
            <div className="bg-black dark:bg-indigo-600 text-white p-7 rounded-[2.2rem] shadow-3xl relative overflow-hidden group border border-white/5">
               <Target className="absolute top-[-25px] right-[-25px] w-56 h-56 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
               <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase italic tracking-tighter mb-7 flex items-center gap-2.5">
                     <TrendingUp size={18} className="text-indigo-400 dark:text-white" /> {t('production.sidebar.library')}
                  </h3>
                  <div className="space-y-3.5">
                     {formulas.map(f => (
                       <div key={f._id} className="p-4 bg-white/5 dark:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] group/f cursor-pointer hover:bg-white/20 transition-all shadow-xl">
                          <div className={cn("flex justify-between items-start mb-3.5", isRtl && "flex-row-reverse")}>
                             <p className="text-xs font-black uppercase italic tracking-tighter truncate max-w-[130px]">{f.finishedProductId?.name}</p>
                             <ChevronRight size={12} className="opacity-40 group-f:translate-x-1 transition-transform" />
                          </div>
                          <div className={cn("flex justify-between items-end border-t border-white/10 pt-3.5", isRtl && "flex-row-reverse")}>
                             <span className="text-[7px] font-black uppercase opacity-60">{t('production.sidebar.nodes', { count: f.components.length })}</span>
                             <span className="text-sm font-black italic text-emerald-400">{f.laborCost} DH</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.2rem] border border-slate-200/60 dark:border-white/5 shadow-pro relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-600/5 rounded-full blur-3xl" />
               <h3 className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-7 italic text-center">{t('production.sidebar.integrity')}</h3>
               <div className="space-y-4">
                  <IntegrityNode label={t('production.sidebar.accuracy')} value={99.4} color="emerald" />
                  <IntegrityNode label={t('production.sidebar.throughput')} value={86.2} color="indigo" />
               </div>
            </div>
         </aside>

      </main>

      {/* CREATE PRODUCTION ORDER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0b141a] w-full max-w-lg rounded-[2.5rem] p-8 shadow-3xl relative border border-white/5 my-auto">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-lg active:scale-90 transition-all border-none"><X size={18} /></button>
                <form onSubmit={handleCreateOrder} className="space-y-7">
                   <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">{t('production.modal.title')}</h3>
                   <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.25em] block ml-1">{t('production.fields.formula')}</label>
                        <select required className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-5 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase" value={formData.formulaId} onChange={(e)=>setFormData({...formData, formulaId: e.target.value})}>
                           <option value="">{t('production.modal.selectFormula')}</option>
                           {formulas.map(f => <option key={f._id} value={f._id}>{f.finishedProductId?.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.25em] block ml-1">{t('production.fields.quantity')}</label>
                        <input required type="number" placeholder={t('production.modal.targetUnits')} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-5 text-lg font-black italic text-indigo-600 outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" value={formData.quantity} onChange={(e)=>setFormData({...formData, quantity: Number(e.target.value)})} />
                      </div>
                   </div>
                   <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-5 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-slate-950 transition-all active:scale-95 flex items-center justify-center gap-2.5 border-none">
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><ShieldCheck size={18} /> {t('production.modal.submit')}</>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const IntegrityNode = ({ label, value, color }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center px-1">
        <span className="text-[8px] font-black uppercase tracking-widest opacity-80">{label}</span>
        <span className="text-xs font-black italic">{value}%</span>
     </div>
     <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 2 }} className={cn("h-full", color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-600')} />
     </div>
  </div>
);

export default ProductionHub;
