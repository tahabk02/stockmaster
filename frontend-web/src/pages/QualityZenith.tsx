import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Plus, 
  Search, Filter, RefreshCcw, Loader2, Clock,
  MoreHorizontal, ChevronRight, Save, X, Activity,
  Target, Zap, Microscope, FileCheck, Layers,
  BarChart3, Scale, Fingerprint, AlertCircle, Trash2,
  Terminal, Database, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { useTenant } from "../store/tenant.slice";

export const QualityZenith = () => {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const [history, setHistory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRtl = i18n.language === 'ar';

  const [formData, setFormData] = useState({
    productId: "",
    batchId: "",
    score: 100,
    status: "PASS",
    anomalies: [] as string[],
    notes: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [histRes, prodRes] = await Promise.all([
        api.get("/quality/history"),
        api.get("/products")
      ]);
      setHistory(histRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (e) {
      toast.error(t('quality.messages.linkLost'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return toast.error(t('quality.messages.missingAsset'));
    
    setIsSubmitting(true);
    const loadId = toast.loading(t('quality.messages.indexing'));
    try {
      await api.post("/quality/record", {
        ...formData,
        status: formData.score > 90 ? "PASS" : formData.score > 70 ? "WARNING" : "FAIL"
      });
      toast.success(t('quality.messages.syncOk'), { id: loadId });
      setIsModalOpen(false);
      setFormData({ productId: "", batchId: "", score: 100, status: "PASS", anomalies: [], notes: "" });
      fetchData();
    } catch (e) {
      toast.error(t('quality.messages.syncError'), { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full space-y-5 pb-16 px-2 md:px-3 animate-reveal text-slate-900 dark:text-slate-200", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. COMPACT QUALITY HUB HEADER */}
      <header className="bg-slate-950 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10 group">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />
         
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 text-left">
               <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    className="p-4 bg-emerald-600 rounded-[1.5rem] shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-white/20 relative"
                  >
                     <Microscope size={24} />
                     <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                  </motion.div>
                  <div className={isRtl ? "text-right" : "text-left"}>
                     <h1 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">
                        {t('quality.title')}_<span className="text-emerald-500">{(tenant?.name || "STOCKMASTER").toUpperCase()}.</span>
                     </h1>
                     <div className={cn("flex items-center gap-2 mt-2 ml-1", isRtl && "flex-row-reverse")}>
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-emerald-300 font-black uppercase text-[8px] tracking-[0.5em] opacity-80 leading-none">{t('quality.subtitle')}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className={cn("flex flex-wrap gap-4 relative z-10", isRtl && "flex-row-reverse")}>
               <div className={cn("bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-8 shadow-2xl transition-all", isRtl && "flex-row-reverse")}>
                  <div className="text-center space-y-1">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('quality.stats.passed')}</p>
                     <p className="text-3xl font-black text-emerald-400 italic leading-none tabular-nums">{history.filter(h => h.status === 'PASS').length}</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center space-y-1">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t('quality.stats.compliance')}</p>
                     <p className="text-3xl font-black text-indigo-400 italic leading-none tabular-nums">99<span className="text-base not-italic ml-1 opacity-40">%</span></p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(true)} className="group relative bg-emerald-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-4xl hover:scale-105 transition-all active:scale-95 border-none italic overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center gap-3">{t('quality.record')} <Plus size={16} /></span>
               </button>
            </div>
         </div>
      </header>

      {/* 2. INSPECTION MATRIX HUB - COMPACT */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         
         <div className="xl:col-span-8 space-y-6">
            {/* Control Station */}
            <div className={cn("flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900/40 p-2 rounded-[1.8rem] border border-slate-200 dark:border-white/5 shadow-pro backdrop-blur-xl", isRtl && "md:flex-row-reverse")}>
               <div className="relative flex-1 group">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-all", isRtl ? "right-5" : "left-5")} size={18} />
                  <input placeholder="SCAN_QUALITY_LATTICE_SIGNALS..." className={cn("w-full bg-slate-100 dark:bg-black/40 border-none rounded-2xl py-3.5 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all italic", isRtl ? "pr-14 text-right" : "pl-14 pr-5")} />
               </div>
               <div className="flex gap-2">
                  <button className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-emerald-600 rounded-xl shadow-lg transition-all active:scale-95"><Filter size={18} /></button>
                  <button onClick={fetchData} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-emerald-600 rounded-xl shadow-lg transition-all active:scale-95 group">
                     <RefreshCcw className={cn("group-hover:rotate-180 transition-transform duration-1000", loading && "animate-spin")} size={18} />
                  </button>
               </div>
            </div>

            <div className="grid gap-4">
               {loading ? (
                 <div className="py-24 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                       <div className="w-16 h-16 border-4 border-dashed border-emerald-500/20 rounded-full animate-spin-slow" />
                       <Activity size={28} className="absolute inset-0 m-auto text-emerald-600 animate-pulse" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.8em] text-slate-500 animate-pulse italic">{t('quality.messages.scanning')}</p>
                 </div>
               ) : history.length === 0 ? (
                 <div className="py-24 bg-white dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-30 grayscale">
                    <Database size={64} strokeWidth={1} className="mb-6 text-emerald-600" />
                    <p className="font-black uppercase text-xs tracking-[0.4em] italic text-center">{t('quality.messages.noData')}</p>
                 </div>
               ) : history.map((h, i) => (
                 <motion.div initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} key={h._id} className="bg-white dark:bg-[#050508] p-6 rounded-[2.2rem] border border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-emerald-500/30 shadow-sm transition-all duration-500 relative overflow-hidden">
                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                       <div className="w-16 h-16 rounded-[1.2rem] bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-100 dark:border-white/5 p-1 group-hover:scale-105 transition-transform shadow-inner text-left">
                          {h.productId?.image ? <img src={h.productId.image} className="w-full h-full object-cover rounded-[1rem]" /> : <div className="w-full h-full flex items-center justify-center bg-emerald-500/5"><Layers size={24} className="text-slate-300 dark:text-slate-700" /></div>}
                       </div>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <div className={cn("flex items-center gap-3 mb-1.5", isRtl && "flex-row-reverse")}>
                             <h4 className="text-lg font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none">{h.productId?.name}</h4>
                             <div className={cn("px-3 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border", 
                               h.status === 'PASS' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                               h.status === 'FAIL' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                               "bg-amber-500/10 text-amber-600 border-amber-500/20")}>{h.status === 'PASS' ? t('quality.messages.pass') : h.status === 'FAIL' ? t('quality.messages.fail') : t('quality.messages.warn')}</div>
                          </div>
                          <div className={cn("flex items-center gap-2 text-slate-400 dark:text-slate-500", isRtl && "flex-row-reverse")}>
                             <span className="text-[8px] font-black uppercase tracking-widest">BATCH: {h.batchId || "GLOBAL"}</span>
                             <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                             <span className="text-[8px] font-black uppercase tracking-widest">ID: {h.inspectorId?.name?.split(' ')[0] || "SYS"}</span>
                          </div>
                       </div>
                    </div>
                    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('quality.fields.score')}</p>
                          <p className={cn("text-2xl font-black italic leading-none tabular-nums", h.score > 90 ? "text-emerald-500" : h.score > 70 ? "text-amber-500" : "text-rose-500")}>{h.score}%</p>
                       </div>
                       <div className={cn("px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2", isRtl && "flex-row-reverse")}>
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> {t('quality.messages.nominal')}
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Sidebar Control Deck - COMPACT */}
         <aside className="xl:col-span-4 space-y-6">
            <div className="bg-emerald-600 text-white p-8 rounded-[3rem] shadow-4xl relative overflow-hidden group border border-white/10">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent)]" />
               <Target className="absolute top-[-30px] right-[-30px] w-56 h-56 opacity-10 -rotate-12" />
               <div className="relative z-10">
                  <div className={cn("flex items-center gap-3 mb-8", isRtl && "flex-row-reverse")}>
                     <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xl border border-white/20"><ShieldCheck size={20} /></div>
                     <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">{t('quality.hud.integrity')}</h3>
                  </div>
                  <div className="space-y-8">
                     <ComplianceNode label={t('quality.hud.variance')} val={99.8} isRtl={isRtl} />
                     <ComplianceNode label={t('quality.hud.sensor')} val={94.2} isRtl={isRtl} />
                     <ComplianceNode label={t('quality.hud.anomaly')} val={0.4} inverse isRtl={isRtl} />
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-[#050508] p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-pro relative overflow-hidden group">
               <h3 className={cn("text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-2", isRtl && "flex-row-reverse justify-center")}>
                  <Radio size={12} className="animate-pulse" /> {t('quality.hud.telemetry')}
               </h3>
               <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.8rem] border border-slate-100 dark:border-white/5">
                     <p className="text-[7px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">{t('quality.messages.warnings')}</p>
                     <p className="text-2xl font-black text-amber-500 italic leading-none tabular-nums">04</p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.8rem] border border-slate-100 dark:border-white/5">
                     <p className="text-[7px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">{t('quality.messages.criticalFail')}</p>
                     <p className="text-2xl font-black text-rose-500 italic leading-none tabular-nums">00</p>
                  </div>
               </div>
               <div className="mt-6 p-5 bg-black/5 dark:bg-black/40 rounded-[1.8rem] font-mono text-[7px] text-slate-500 uppercase tracking-widest italic text-left">
                  <p className={cn("flex gap-3 mb-1.5", isRtl && "flex-row-reverse justify-end")}><span className="text-emerald-500">[OK]</span> {t('quality.messages.scanComplete')}</p>
                  <p className={cn("flex gap-3", isRtl && "flex-row-reverse justify-end")}><span className="text-indigo-500">[SYNC]</span> {t('quality.messages.telemetryLocked')}</p>
               </div>
            </div>
         </aside>

      </main>

      {/* INSPECTION MODAL - COMPACT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-4 overflow-y-auto">
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-white dark:bg-[#0a0a0f] w-full max-w-xl rounded-[3.5rem] p-8 md:p-10 shadow-4xl relative border border-white/10 my-auto overflow-hidden">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-600 rounded-xl active:scale-90 transition-all border-none"><X size={20} /></button>
                
                <form onSubmit={handleRecord} className="space-y-8 relative z-10">
                   <div className={cn("flex items-center gap-6 mb-8", isRtl && "flex-row-reverse")}>
                      <div className="p-4 bg-emerald-600 rounded-[1.5rem] text-white shadow-2xl rotate-12"><ShieldCheck size={32} /></div>
                      <div className={isRtl ? "text-right" : "text-left"}>
                         <h3 className="text-2xl font-black uppercase italic text-slate-950 dark:text-white tracking-tighter leading-none">Hard_Inspection_Protocol</h3>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">Diagnostic_Calibration_v4.0</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={cn("text-[9px] font-black text-emerald-600 uppercase tracking-widest block ml-1", isRtl && "text-right mr-1")}>{t('quality.fields.asset')}</label>
                        <select required className={cn("w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-4 font-black text-[10px] text-slate-950 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all uppercase shadow-inner", isRtl && "text-right")} value={formData.productId} onChange={(e)=>setFormData({...formData, productId: e.target.value})}>
                           <option value="">SELECT_ASSET_NODE...</option>
                           {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={cn("text-[9px] font-black text-emerald-600 uppercase tracking-widest block ml-1", isRtl && "text-right mr-1")}>{t('quality.fields.batch')}</label>
                        <input placeholder="BATCH_ID..." className={cn("w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-4 font-black text-[10px] text-slate-950 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner", isRtl && "text-right")} value={formData.batchId} onChange={(e)=>setFormData({...formData, batchId: e.target.value})} />
                      </div>
                   </div>

                   <div className="space-y-4 bg-slate-50 dark:bg-black/40 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner">
                      <div className={cn("flex justify-between items-center px-1", isRtl && "flex-row-reverse")}>
                         <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">{t('quality.fields.score')}</label>
                         <span className={cn("text-2xl font-black italic tabular-nums leading-none", formData.score > 90 ? "text-emerald-500" : "text-rose-500")}>{formData.score}%</span>
                      </div>
                      <input type="range" min="0" max="100" className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-600" value={formData.score} onChange={(e)=>setFormData({...formData, score: Number(e.target.value)})} />
                   </div>

                   <button type="submit" disabled={isSubmitting} className="group relative w-full bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-4xl hover:scale-[1.02] transition-all active:scale-95 border-none italic overflow-hidden text-left">
                      <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="relative z-10 flex items-center justify-center gap-4">
                         {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> {t('quality.fields.deploy')}</>}
                      </span>
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const ComplianceNode = ({ label, val, inverse, isRtl }: any) => (
  <div className="space-y-3">
     <div className={cn("flex justify-between items-center px-1", isRtl && "flex-row-reverse")}>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">{label}</span>
        <span className="text-xs font-black italic tabular-nums">{val}%</span>
     </div>
     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/5">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${val}%` }} 
          transition={{ duration: 2.5, ease: "circOut" }} 
          className={cn("h-full shadow-[0_0_15px_currentColor]", inverse ? (val > 1 ? "bg-rose-400 text-rose-400" : "bg-emerald-400 text-emerald-400") : (val > 95 ? "bg-emerald-400 text-emerald-400" : "bg-amber-400 text-amber-400"))} 
        />
     </div>
  </div>
);

export default QualityZenith;
