import React, { useState, useEffect } from "react";
import { 
  Megaphone, Target, TrendingUp, Users, Zap, 
  Plus, Calendar, BarChart3, Clock, LayoutGrid,
  Search, Filter, RefreshCcw, ArrowUpRight,
  Sparkles, MousePointer2, Percent, Loader2, X, Save,
  AlertCircle, ShieldCheck, CheckCircle2, MoreHorizontal,
  ChevronRight, ExternalLink, Info, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export const MarketingHub = () => {
  const { t, i18n } = useTranslation();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "PROMOTION",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: "",
    discountPercentage: "",
    description: ""
  });

  const isRtl = i18n.language === 'ar';

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get("/marketing");
      setCampaigns(res.data.data || []);
    } catch (e) {
      toast.error(t('marketing.toast.lost'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.budget) return toast.error(t('marketing.toast.error_data'));
    
    setIsSubmitting(true);
    const loadId = toast.loading(t('marketing.toast.syncing'));
    try {
      await api.post("/marketing", {
        ...formData,
        budget: Number(formData.budget),
        discountPercentage: Number(formData.discountPercentage)
      });
      toast.success(t('marketing.toast.success'), { id: loadId });
      setIsModalOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (e) {
      toast.error(t('marketing.toast.failure'), { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "PROMOTION",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: "",
      discountPercentage: "",
      description: ""
    });
  };

  const filtered = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("w-full space-y-8 pb-32 px-3 md:px-6 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. CAMPAIGN COMMAND HUD */}
      <header className="bg-indigo-600 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000" />
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
               <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                  <div className="p-4 bg-white/20 backdrop-blur-xl rounded-[1.5rem] shadow-xl border border-white/20">
                     <Megaphone size={32} />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">{t('marketing.title').split(' ')[0]} <span className="text-slate-900 dark:text-white underline decoration-white/30 decoration-thickness-2">{t('marketing.title').split(' ').slice(1).join(' ')}.</span></h1>
               </div>
               <p className="text-indigo-100 font-black uppercase text-[9px] tracking-[0.5em] ml-1">{t('marketing.subtitle')}</p>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-white hover:text-indigo-600 transition-all active:scale-95 flex items-center gap-3">
               <Plus size={20} /> {t('marketing.add')}
            </button>
         </div>
      </header>

      {/* 2. ANALYTICS PREVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <PromoMetric label={t('marketing.stats.reach')} value="48.2K" icon={Users} color="indigo" />
         <PromoMetric label={t('marketing.stats.resonance')} value="12.4%" icon={MousePointer2} color="emerald" />
         <PromoMetric label={t('marketing.stats.active')} value={campaigns.filter(c => c.status === 'ACTIVE').length} icon={Zap} color="amber" />
         <PromoMetric label={t('marketing.stats.growth')} value="+24%" icon={TrendingUp} color="indigo" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* 3. CAMPAIGN ARCHITECTURE */}
         <div className="xl:col-span-8 space-y-6">
            <div className={cn("flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-[2.2rem] border border-slate-100 dark:border-white/5 shadow-xl backdrop-blur-md", isRtl && "md:flex-row-reverse")}>
               <div className="relative flex-1 group">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-5" : "left-5")} size={20} />
                  <input placeholder={t('common.search')} className={cn("w-full bg-slate-50 dark:bg-black/20 border-none rounded-3xl py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner", isRtl ? "pr-14 pl-6" : "pl-14 pr-6")} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
               </div>
               <div className="flex gap-2">
                  <button className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-lg transition-all active:scale-95"><Filter size={20} /></button>
                  <button onClick={fetchCampaigns} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-lg transition-all active:scale-95 group">
                     <RefreshCcw className={cn("group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} size={20} />
                  </button>
               </div>
            </div>

            <div className="grid gap-4">
               {loading ? (
                 <div className="py-20 flex flex-col items-center justify-center opacity-20"><Loader2 className="animate-spin text-indigo-600 mb-4" size={40}/><p className="text-[10px] font-black uppercase tracking-widest">{t('common.loading')}</p></div>
               ) : filtered.length === 0 ? (
                 <div className="py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-30 grayscale">
                    <Megaphone size={64} strokeWidth={1} className="mb-6 text-indigo-600" />
                    <p className="font-black uppercase text-xs tracking-widest italic">{t('common.noData')}</p>
                 </div>
               ) : filtered.map((c, i) => (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={c._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between group hover:shadow-2xl transition-all gap-8">
                    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                       <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center font-black text-white italic text-2xl shadow-xl shrink-0 transition-transform group-hover:scale-110", c.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')}>
                          {c.discountPercentage}%
                       </div>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <div className={cn("flex items-center gap-3 mb-2", isRtl && "flex-row-reverse")}>
                             <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{c.name}</h4>
                             <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-slate-500/10 text-slate-500 border-slate-500/20')}>SIGNAL_{c.status}</span>
                          </div>
                          <div className={cn("flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4", isRtl && "flex-row-reverse")}>
                             <span className="flex items-center gap-1.5"><Calendar size={12} className="text-indigo-500"/> {new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}</span>
                             <span className="flex items-center gap-1.5 text-indigo-500"><Target size={12}/> {(t(`marketing.types.${c.type}`) as string)}</span>
                          </div>
                       </div>
                    </div>
                    <div className={cn("flex items-center gap-10", isRtl && "flex-row-reverse")}>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reach Pulse</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white italic leading-none">{c.reach.toLocaleString()}</p>
                       </div>
                       <button className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-indigo-500/20 active:scale-90"><MoreHorizontal size={20}/></button>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* 4. MARKETPLACE INTELLIGENCE */}
         <div className="xl:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
               <div className="relative z-10">
                  <div className={cn("flex items-center gap-3 mb-8", isRtl && "flex-row-reverse")}>
                     <Sparkles size={24} className="text-amber-400" />
                     <h3 className="text-xl font-black uppercase italic tracking-tighter">{t('marketing.ai.title')}</h3>
                  </div>
                  <div className="space-y-6">
                     <AITip text={t('marketing.ai.tip1', { defaultValue: "Signal boost recommended for 'Mechanical' sector. Efficiency +18%." })} />
                     <AITip text={t('marketing.ai.tip2', { defaultValue: "Optimize 'Clearance' protocol for stock aging beyond 90 cycles." })} />
                  </div>
                  <button className="w-full mt-10 py-5 bg-white text-indigo-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 border-none">
                     {t('marketing.ai.compute')}
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl">
               <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8 italic">{t('marketing.yield.title')}</h3>
               <div className="space-y-8">
                  <YieldNode label={t('marketing.yield.resonance')} val={72} color="indigo" />
                  <YieldNode label={t('marketing.yield.conversion')} val={45} color="emerald" />
                  <YieldNode label={t('marketing.yield.dominance')} val={18} color="rose" />
               </div>
            </div>
         </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] p-10 md:p-16 shadow-[0_0_100px_rgba(99,102,241,0.2)] relative border border-white/5">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-2xl shadow-xl transition-all border-none"><X size={24} /></button>
                
                <div className={cn("flex items-center gap-6 mb-12", isRtl && "flex-row-reverse")}>
                   <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl rotate-3 shrink-0"><Megaphone size={32} /></div>
                   <div className={isRtl ? 'text-right' : 'text-left'}>
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{t('marketing.add')}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">Market Pulse Synchronization Protocol</p>
                   </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                   <div className="space-y-2">
                      <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('marketing.fields.name')}</label>
                      <input required type="text" placeholder="Summer Resonance Cluster v1" className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('marketing.fields.type')}</label>
                        <select className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase", isRtl && "text-right")} value={formData.type} onChange={(e)=>setFormData({...formData, type: e.target.value})}>
                           {Object.keys(t('marketing.types', { returnObjects: true })).map(key => (
                             <option key={key} value={key}>{t(`marketing.types.${key}`)}</option>
                           ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('marketing.fields.discount')}</label>
                        <input required type="number" placeholder="%" className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={formData.discountPercentage} onChange={(e)=>setFormData({...formData, discountPercentage: e.target.value})} />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('marketing.fields.start')}</label>
                        <input type="date" className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={formData.startDate} onChange={(e)=>setFormData({...formData, startDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('marketing.fields.end')}</label>
                        <input type="date" className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={formData.endDate} onChange={(e)=>setFormData({...formData, endDate: e.target.value})} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('marketing.fields.budget')} (DH)</label>
                      <input required type="number" placeholder="4500.00" className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={formData.budget} onChange={(e)=>setFormData({...formData, budget: e.target.value})} />
                   </div>

                   <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-indigo-500/30 hover:bg-slate-950 transition-all active:scale-95 mt-6 flex items-center justify-center gap-4 border-none">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={24} /> {t('common.save')}</>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PromoMetric = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl relative group hover:scale-105 transition-all">
     <div className={cn("p-3 rounded-2xl w-fit mb-6 shadow-inner", color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-600')}>
        <Icon size={22} />
     </div>
     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
     <h4 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{value}</h4>
  </div>
);

const AITip = ({ text }: any) => (
  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
     <p className="text-[11px] font-bold text-slate-300 italic leading-relaxed">"{text}"</p>
  </div>
);

const YieldNode = ({ label, val, color }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black italic text-slate-900 dark:text-white">{val}%</span>
     </div>
     <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 2 }} className={cn("h-full", color === 'indigo' ? 'bg-indigo-600' : color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500')} />
     </div>
  </div>
);

export default MarketingHub;
