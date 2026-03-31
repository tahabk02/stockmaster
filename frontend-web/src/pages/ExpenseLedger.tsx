import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Wallet, DollarSign, PieChart, TrendingUp, Calendar, 
  Plus, Search, Filter, RefreshCcw, Loader2,
  ArrowUpRight, Landmark, Receipt, CreditCard,
  MoreHorizontal, ChevronRight, Activity, Zap, X, Save,
  AlertCircle, ShieldCheck, Trash2, Download, Eye,
  BarChart3, FileStack, TrendingDown, Sparkles, Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { GlassCard } from "../components/ui/pro/GlassCard";
import { NeonInput } from "../components/ui/pro/NeonInput";

export const ExpenseLedger = () => {
  const { t, i18n } = useTranslation();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  
  const [newExpense, setNewExpense] = useState({
    category: "OTHER",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "CASH"
  });

  const isRtl = i18n.language === 'ar';

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses");
      setExpenses(res.data.data || []);
    } catch (e) {
      toast.error(t('expenses.toast.lost'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return toast.error(t('expenses.toast.error_data'));
    
    setIsSubmitting(true);
    const loadId = toast.loading(t('expenses.toast.syncing'));
    try {
      await api.post("/expenses", { ...newExpense, amount: Number(newExpense.amount) });
      toast.success(t('expenses.toast.success'), { id: loadId });
      setIsModalOpen(false);
      resetForm();
      fetchExpenses();
    } catch (e) {
      toast.error(t('expenses.toast.failure'), { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReceipt = async (id: string) => {
    const loadId = toast.loading(t('expenses.inspector.generating'));
    try {
      const response = await api.get(`/expenses/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('expenses.inspector.syncOk'), { id: loadId });
    } catch (e) {
      toast.error(t('expenses.inspector.syncFail'), { id: loadId });
    }
  };

  const deleteExpense = async (id: string) => {
    if (!window.confirm(t('expenses.toast.purge'))) return;
    const loadId = toast.loading(t('expenses.toast.decoupling'));
    try {
      await api.delete(`/expenses/${id}`);
      toast.success(t('expenses.toast.purged'), { id: loadId });
      fetchExpenses();
    } catch (e) {
      toast.error(t('errors.unauthorized'), { id: loadId });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const loadId = toast.loading(t('expenses.toast.exporting'));
    try {
      // Simulation or Real API
      await new Promise(r => setTimeout(r, 1500));
      toast.success(t('expenses.toast.exported'), { id: loadId });
    } finally {
      setIsExporting(false);
    }
  };

  const resetForm = () => {
    setNewExpense({
      category: "OTHER",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "CASH"
    });
  };

  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);

  const filtered = expenses.filter(ex => 
    ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("w-full space-y-4 md:space-y-6 pb-16 px-2 md:px-4 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. FISCAL CONTROL HEADER */}
      <header>
         <GlassCard variant="dark" className="p-6 md:p-8 border-none overflow-hidden group" animate>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
               <div className="space-y-2">
                  <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                     <div className="p-3 bg-emerald-600 rounded-xl shadow-xl rotate-3 transition-transform hover:rotate-0 duration-700 relative group shrink-0">
                        <Wallet size={24} className="group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl animate-ping opacity-20" />
                     </div>
                     <div>
                        <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic leading-none">{t('expenses.title').split(' ')[0]} <span className="text-emerald-500">{t('expenses.title').split(' ').slice(1).join(' ')}.</span></h1>
                        <p className="text-emerald-300 font-black uppercase text-[8px] tracking-[0.4em] mt-1 opacity-80">{t('expenses.subtitle')}</p>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap gap-4 shrink-0 w-full lg:w-auto">
                  <GlassCard className="p-4 flex items-center gap-8 shadow-2xl border-white/10 bg-white/5 flex-1 lg:flex-none justify-center">
                     <div className="text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('expenses.totalBurn')}</p>
                        <p className="text-2xl font-black text-emerald-400 italic leading-none">{totalExpenses.toLocaleString()} <span className="text-[8px] not-italic opacity-40 uppercase">DH</span></p>
                     </div>
                     <div className="w-px h-8 bg-white/10" />
                     <div className="text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('expenses.efficiency')}</p>
                        <p className="text-2xl font-black text-indigo-400 italic leading-none">94%</p>
                     </div>
                  </GlassCard>
                  <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-white text-slate-950 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-3xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 flex items-center gap-3 group flex-1 lg:flex-none justify-center border-none">
                     <Plus size={18} className="group-hover:rotate-90 transition-transform" /> {t('expenses.add')}
                  </button>
               </div>
            </div>
         </GlassCard>
      </header>

      {/* 2. REGISTRY FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        <NeonInput 
          placeholder={t('expenses.search')} 
          icon={<Search size={18} />} 
          value={searchTerm} 
          onChange={(e)=>setSearchTerm(e.target.value)} 
          isRtl={isRtl}
          className="flex-1"
        />
        <div className="flex gap-2">
           <button onClick={handleExport} disabled={isExporting} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-xl shadow-lg transition-all active:scale-95 border-none">
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
           </button>
           <button onClick={fetchExpenses} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-xl shadow-lg transition-all active:scale-95 group border-none">
              <RefreshCcw className={cn("group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} size={18} />
           </button>
        </div>
      </div>

      {/* 2. OPERATIONAL GRID */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         
         <div className="xl:col-span-8 space-y-6">
            <div className="grid gap-4">
               {loading ? (
                 <div className="py-20 flex flex-col items-center justify-center opacity-20"><Loader2 size={40} className="animate-spin text-emerald-600 mb-4"/><p className="text-[8px] font-black uppercase tracking-[0.8em]">Retrieving Ledger...</p></div>
               ) : filtered.length === 0 ? (
                 <div className="py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-30 grayscale">
                    <Receipt size={64} strokeWidth={1} className="mb-6 text-emerald-600" />
                    <p className="font-black uppercase text-xs tracking-[0.4em]">{t('common.noData')}</p>
                 </div>
               ) : filtered.map((ex, i) => (
                 <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={ex._id} className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-lg transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity" />
                    
                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                       <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                          <DollarSign size={28} />
                       </div>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <div className={cn("flex items-center gap-3 mb-1.5", isRtl && "flex-row-reverse")}>
                             <h4 className="text-base font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">{ex.description}</h4>
                             <span className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-lg text-[7px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5">{(t(`expenses.categories.${ex.category}`) as string)}</span>
                          </div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">{new Date(ex.date).toLocaleDateString()} • {t('common.status')}: <span className="text-emerald-500">{ex.status}</span></p>
                       </div>
                    </div>
                    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Burn Payload</p>
                          <p className="text-2xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none">{ex.amount.toLocaleString()} <span className="text-[8px] not-italic opacity-40 uppercase">DH</span></p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setSelectedExpense(ex)} className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"><Eye size={18}/></button>
                          <button onClick={() => deleteExpense(ex._id)} className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90 shadow-sm"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* 3. SIDEBAR INTELLIGENCE */}
         <aside className="xl:col-span-4 space-y-6">
            <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] shadow-3xl relative overflow-hidden group">
               <PieChart className="absolute top-[-30px] right-[-30px] w-64 h-64 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
               <div className="relative z-10">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">{t('expenses.sidebar.liquidity')}</h3>
                  <div className="space-y-8">
                     <FiscalNode label={t('expenses.categories.RENT')} pulse={72} />
                     <FiscalNode label={t('expenses.categories.SALARY')} pulse={45} />
                     <FiscalNode label={t('expenses.categories.MARKETING')} pulse={18} />
                  </div>
                  <button className="w-full mt-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-emerald-600 transition-all flex items-center justify-center gap-3 border-none">
                     <BarChart3 size={14}/> {t('expenses.sidebar.syncMatrix')}
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-pro relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-3xl" />
               <h3 className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3">
                  <Sparkles size={14} className="text-amber-400" /> {t('expenses.sidebar.insight')}
               </h3>
               <div className="space-y-4">
                  <Recommendation text={t('expenses.ai.tip1', { defaultValue: "High Burn in 'Utilities' sector detected." })} />
                  <Recommendation text={t('expenses.ai.tip2', { defaultValue: "Fiscal projection indicates 12% growth window." })} />
                  <button className="w-full mt-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl font-black uppercase text-[7px] tracking-widest text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 border-none">
                     <Activity size={12}/> {t('expenses.sidebar.diagnostic')}
                  </button>
               </div>
            </div>
         </aside>

      </main>

      {/* RECORD EXPENSE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] p-10 md:p-16 shadow-[0_0_100px_rgba(16,185,129,0.2)] relative border border-white/5 my-auto">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-2xl shadow-xl transition-all active:scale-90"><X size={24} /></button>
                
                <div className={cn("flex items-center gap-8 mb-16", isRtl && "flex-row-reverse")}>
                   <div className="p-6 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl rotate-3"><DollarSign size={40} /></div>
                   <div className={isRtl ? 'text-right' : 'text-left'}>
                      <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{t('expenses.add')}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 italic">{t('expenses.modal.protocol', { defaultValue: "Fiscal Registry Update Protocol" })}</p>
                   </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className={cn("text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right mr-1")}>{t('expenses.fields.category')}</label>
                        <select className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-8 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner uppercase", isRtl && "text-right")} value={newExpense.category} onChange={(e)=>setNewExpense({...newExpense, category: e.target.value})}>
                           {Object.keys(t('expenses.categories', { returnObjects: true })).map(key => (
                             <option key={key} value={key}>{t(`expenses.categories.${key}`)}</option>
                           ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className={cn("text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right mr-1")}>{t('expenses.fields.amount')}</label>
                        <input required type="number" placeholder="0.00" className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-8 font-black text-2xl italic text-emerald-600 outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner", isRtl && "text-right")} value={newExpense.amount} onChange={(e)=>setNewExpense({...newExpense, amount: e.target.value})} />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className={cn("text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right mr-1")}>{t('expenses.fields.description')}</label>
                      <input required type="text" placeholder="Service / Operational Signal Details..." className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-8 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner", isRtl && "text-right")} value={newExpense.description} onChange={(e)=>setNewExpense({...newExpense, description: e.target.value})} />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className={cn("text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right mr-1")}>{t('expenses.fields.date')}</label>
                        <input type="date" className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-8 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner", isRtl && "text-right")} value={newExpense.date} onChange={(e)=>setNewExpense({...newExpense, date: e.target.value})} />
                      </div>
                      <div className="space-y-3">
                        <label className={cn("text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right mr-1")}>{t('expenses.fields.method')}</label>
                        <select className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-8 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner uppercase", isRtl && "text-right")} value={newExpense.paymentMethod} onChange={(e)=>setNewExpense({...newExpense, paymentMethod: e.target.value})}>
                           <option value="CASH">CASH_NODE</option>
                           <option value="CARD">CREDIT_CIRCUIT</option>
                           <option value="TRANSFER">NETWORK_WIRE</option>
                        </select>
                      </div>
                   </div>

                   <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-8 rounded-[3rem] font-black uppercase text-sm tracking-[0.5em] shadow-3xl shadow-emerald-500/30 hover:bg-slate-950 transition-all active:scale-95 mt-6 flex items-center justify-center gap-5 group border-none">
                      {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : <><Save size={28} className="group-hover:rotate-12 transition-transform" /> {t('team.actions.commit')}</>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECT EXPENSE MODAL */}
      <AnimatePresence>
         {selectedExpense && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl overflow-y-auto">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white dark:bg-[#0b141a] w-full max-w-4xl rounded-[4rem] shadow-3xl relative my-auto border border-white/5 overflow-hidden">
                 <button onClick={() => setSelectedExpense(null)} className={cn("absolute top-10 p-4 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl transition-all shadow-xl z-20 active:scale-90", isRtl ? "left-10" : "right-10")}><X size={24} /></button>
                 
                 <div className="p-12 md:p-20 space-y-12">
                    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                       <div className="p-6 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl rotate-3 shrink-0"><Fingerprint size={48} /></div>
                       <div className={isRtl ? 'text-right' : 'text-left'}>
                          <div className={cn("flex items-center gap-4 mb-4", isRtl && "flex-row-reverse")}>
                             <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">{(t(`expenses.categories.${selectedExpense.category}`) as string)}</span>
                             <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">SIGNAL_ID_{selectedExpense._id.slice(-8).toUpperCase()}</span>
                          </div>
                          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{selectedExpense.description}</h2>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 border-y border-slate-100 dark:border-white/5">
                       <SpecItem label={t('expenses.inspector.value')} val={`${selectedExpense.amount.toLocaleString()} DH`} icon={<DollarSign size={20}/>} isRtl={isRtl} />
                       <SpecItem label={t('expenses.inspector.temporal')} val={new Date(selectedExpense.date).toLocaleDateString()} icon={<Calendar size={20}/>} isRtl={isRtl} />
                       <SpecItem label={t('expenses.inspector.circuit')} val={selectedExpense.paymentMethod} icon={<CreditCard size={20}/>} isRtl={isRtl} />
                    </div>

                    <div className={cn("flex flex-wrap gap-6 pt-10", isRtl && "flex-row-reverse")}>
                       <button onClick={() => downloadReceipt(selectedExpense._id)} className="px-12 py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-3xl hover:bg-emerald-500 transition-all active:scale-95 flex items-center gap-4 border-none">
                          <Download size={20} /> {t('expenses.inspector.receipt')}
                       </button>
                       <button onClick={() => { deleteExpense(selectedExpense._id); setSelectedExpense(null); }} className="p-6 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[1.8rem] transition-all border border-rose-500/20 active:scale-95 border-none">
                          <Trash2 size={24} />
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
};

const FiscalNode = ({ label, pulse }: any) => (
  <div className="space-y-4">
     <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{label}</span>
        <span className="text-sm font-black italic tracking-tighter">{pulse}%</span>
     </div>
     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pulse}%` }} transition={{ duration: 2.5, ease: "circOut" }} className={cn("h-full bg-white", pulse > 90 ? 'shadow-[0_0_20px_white]' : '')} />
     </div>
  </div>
);

const Recommendation = ({ text }: any) => (
  <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all cursor-default">
     <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">"{text}"</p>
  </div>
);

const SpecItem = ({ label, val, icon, isRtl }: any) => (
  <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
     <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-emerald-600 shadow-inner border border-white/5 shrink-0">{icon}</div>
     <div className={isRtl ? "text-right" : "text-left"}>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[120px]">{val}</p>
     </div>
  </div>
);

export default ExpenseLedger;
