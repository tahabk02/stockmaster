import React, { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { 
  FileText, Search, Download, ExternalLink, Filter, 
  RefreshCcw, Loader2, ArrowUpRight, ArrowDownRight,
  Activity, Zap, ShieldCheck, Clock, Layers, Wallet,
  CreditCard, Landmark, Globe, CheckCircle2, MoreHorizontal,
  FileSearch, Trash2, Cpu, Eye, CheckSquare, Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useTenant } from "../store/tenant.slice";
import { cn } from "../lib/utils";
import { InvoiceDetailDrawer } from "../components/invoices/InvoiceDetailDrawer";

export const Invoices = () => {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const currencySymbol = tenant?.currency?.symbol || "DH";

  const fetchInvoices = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get("/orders");
      setInvoices(res.data.data || []);
    } catch (e) {
      toast.error(t('errors.networkError'));
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [t]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDownload = async (id: string, ref: string) => {
    const toastId = toast.loading(`${t('common.download')}... ${ref}`);
    try {
      const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${ref}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success(t('common.success'), { id: toastId });
    } catch (e) {
      toast.error(t('errors.serverError'), { id: toastId });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(i => i._id));
  };

  const filtered = invoices.filter(inv => {
    if (!inv) return false;
    const rNum = (inv.receiptNumber || "").toLowerCase();
    const cName = (inv.clientId?.name || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return rNum.includes(search) || cName.includes(search);
  });

  const isRtl = i18n.language === 'ar';

  return (
    <div className={`w-full space-y-10 pb-32 px-3 md:px-6 transition-all duration-500 font-sans ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* 1. FINANCIAL CONTROL HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/40 rotate-3 transition-transform hover:rotate-0 duration-500">
                  <Landmark size={28} />
               </div>
               <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">{t('invoices.title')} <span className="text-indigo-500 text-4xl md:text-6xl">{t('invoices.subtitle')}.</span></h1>
            </div>
            <p className="text-indigo-300 font-bold uppercase text-[9px] tracking-[0.4em] ml-1">{t('common.system')} Invoicing & Fiscal Protocol v5.0</p>
         </div>

         <div className="flex flex-wrap gap-4 relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center gap-8 shadow-2xl">
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest text-center">{t('invoices.totalYield')}</p>
                  <p className="text-3xl font-black text-indigo-400 italic leading-none text-center">
                    {invoices.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0).toLocaleString()} <span className="text-[10px] not-italic text-indigo-600">{currencySymbol}</span>
                  </p>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest text-center">{t('invoices.signalStatus')}</p>
                  <div className="flex items-center gap-2 justify-center">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                     <p className="text-xl font-black text-emerald-400 italic leading-none">{t('invoices.messages.verified')}</p>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* 2. ACTIVITY HUD (MICRO-METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <MetricNode label={t('invoices.stats.dispatched')} value={invoices.length} icon={FileText} color="indigo" />
         <MetricNode label={t('invoices.stats.avgValue')} value={Math.round(invoices.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0) / (invoices.length || 1))} unit={currencySymbol} icon={Zap} color="amber" />
         <MetricNode label={t('invoices.stats.efficiency')} value="98.2%" icon={ShieldCheck} color="emerald" />
         <MetricNode label={t('invoices.stats.latency')} value="14ms" icon={Activity} color="indigo" />
      </div>

      {/* 3. LOOKUP & SIGNAL FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl backdrop-blur-sm transition-all">
        <div className="relative flex-1 group">
          <Search className={`absolute ${isRtl ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all`} size={20} />
          <input
            type="text"
            placeholder={t('common.search')}
            className={`w-full bg-slate-50 dark:bg-[#0b141a] border-none rounded-[1.5rem] ${isRtl ? "pr-14 pl-6" : "pl-14 pr-6"} py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 outline-none ring-1 ring-slate-100 dark:ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
           <AnimatePresence>
             {selectedIds.length > 0 && (
               <motion.button 
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                 className="px-8 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-500/30"
                 onClick={() => { toast.success(`${selectedIds.length} Manifests Selected for Batch Export`); }}
               >
                 <Download size={16} /> Batch_Export
               </motion.button>
             )}
           </AnimatePresence>
           <button className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-lg transition-all active:scale-95"><Filter size={20} /></button>
           <button onClick={fetchInvoices} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-lg transition-all active:scale-95 group">
              <RefreshCcw className={isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} size={20} />
           </button>
        </div>
      </div>

      {/* 4. FINANCIAL DATA GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden transition-all">
        <div className="overflow-x-auto custom-scrollbar">
          <table className={`w-full text-left border-collapse min-w-[1100px] ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <th className="p-8 w-20 text-center">
                  <button onClick={selectAll} className="text-indigo-500">
                    {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="p-8">{t('invoices.table.ref')}</th>
                <th className="p-8">{t('invoices.table.client')}</th>
                <th className="p-8 text-center">{t('invoices.table.value')}</th>
                <th className="p-8 text-center">{t('invoices.table.status')}</th>
                <th className="p-8 text-right">{t('invoices.table.document')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={6} className="p-32 text-center">
                  <Cpu className="animate-spin mx-auto text-indigo-500 mb-6" size={48} />
                  <p className="font-black uppercase text-[10px] tracking-[0.5em] text-slate-400">{t('common.loading')}</p>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-32 text-center opacity-20 grayscale">
                  <FileSearch size={80} strokeWidth={1} className="mx-auto mb-6" />
                  <p className="font-black uppercase text-xs tracking-[0.5em]">{t('common.noData')}</p>
                </td></tr>
              ) : filtered.map((inv, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.02 }}
                  key={inv._id} 
                  className={cn(
                    "hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group cursor-default",
                    selectedIds.includes(inv._id) && "bg-indigo-50/50 dark:bg-indigo-500/5"
                  )}
                >
                  <td className="p-8 text-center">
                    <button onClick={() => toggleSelect(inv._id)} className={cn("transition-colors", selectedIds.includes(inv._id) ? "text-indigo-600" : "text-slate-300 group-hover:text-indigo-400")}>
                      {selectedIds.includes(inv._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="p-8" onClick={() => { setSelectedInvoice(inv); setIsDrawerOpen(true); }}>
                    <div className="flex items-center gap-4 cursor-pointer">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                          <FileText size={20} />
                       </div>
                       <div>
                          <span className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter block">{inv.receiptNumber}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(inv.createdAt).toLocaleString()}</span>
                       </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 text-[10px] uppercase">{(inv.clientId?.name || "W").charAt(0)}</div>
                       <div>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase italic transition-colors block">{inv.clientId?.name || t('invoices.messages.walkIn')}</span>
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{inv.paymentMethod} • PROCESSED</span>
                       </div>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <p className="text-base font-black text-slate-950 dark:text-white italic tracking-tighter">{inv.totalPrice.toLocaleString()} <span className="text-[10px] not-italic text-slate-400 uppercase">{currencySymbol}</span></p>
                    <p className="text-[7px] font-black text-indigo-500 uppercase tracking-widest mt-1">Full Value Signal</p>
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex justify-center">
                       <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                         {t('invoices.messages.validated')}
                       </span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3">
                       <button onClick={() => { setSelectedInvoice(inv); setIsDrawerOpen(true); }} className="p-4 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-lg transition-all active:scale-90 border border-slate-100 dark:border-white/5">
                          <Eye size={18} />
                       </button>
                       <button onClick={() => handleDownload(inv._id, inv.receiptNumber)} className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all active:scale-90 group/btn">
                          <Download size={18} className="group-hover/btn:translate-y-0.5 transition-transform" />
                       </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceDetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        invoice={selectedInvoice} 
        tenant={tenant}
        isRtl={isRtl} 
        currencySymbol={currencySymbol} 
        t={t} 
      />
    </div>
  );
};

// --- Atomic HUD Components ---
const MetricNode = ({ label, value, unit, color, icon: Icon }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group transition-all">
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-1000`} />
    <div className="relative z-10 flex flex-col gap-6">
       <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-600 mb-2 w-fit group-hover:rotate-6 transition-transform shadow-inner`}><Icon size={22} /></div>
       <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
          <div className="flex items-baseline gap-2">
             <h4 className="text-3xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none">
               {typeof value === 'number' ? value.toLocaleString() : value}
             </h4>
             {unit && <span className="text-[9px] font-bold text-slate-400 uppercase">{unit}</span>}
          </div>
       </div>
    </div>
  </div>
);

export default Invoices;
