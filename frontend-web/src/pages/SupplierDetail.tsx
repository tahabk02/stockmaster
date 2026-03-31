import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { SupplierDetailHeader } from "../components/suppliers/SupplierDetailHeader";
import { SupplierMetricCards } from "../components/suppliers/SupplierMetricCards";
import { SupplierAnalytics } from "../components/suppliers/SupplierAnalytics";
import { SupplierTransactionModal } from "../components/suppliers/SupplierTransactionModal";
import { SupplierProfileTab } from "../components/suppliers/SupplierProfileTab";

export const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [supplier, setSupplier] = useState<any>(null);
  const [transactions, setLogs] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: "", reference: "", type: "INVOICE" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, tRes, pRes] = await Promise.all([api.get(`/suppliers/${id}`), api.get(`/suppliers/${id}/transactions`), api.get(`/purchases/supplier/${id}`)]);
      setSupplier(sRes.data.data); setLogs(tRes.data.data || []); setPurchases(pRes.data.data || []);
    } catch (e) { toast.error(t('errors.networkError')); } finally { setLoading(false); }
  }, [id, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const amount = Number(form.amount);
      if (form.type === 'INVOICE' && (supplier.totalDebt + amount) > supplier.creditLimit) {
        if (!window.confirm(`Overlimit Protection Triggered. Authorize?`)) { setIsSubmitting(false); return; }
      }
      await api.post(`/suppliers/${id}/transactions`, { ...form, amount });
      toast.success(t('common.success')); setIsModalOpen(false); setForm({ amount: "", reference: "", type: "INVOICE" }); fetchData();
    } catch (err: any) { toast.error(t('errors.serverError')); } finally { setIsSubmitting(false); }
  };

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = 0;
    return sorted.map(t => {
      if (t.type === 'INVOICE' || t.type === 'DEBIT_NOTE') balance += (t.amount || 0); else balance -= (t.amount || 0);
      return { date: new Date(t.date).toLocaleDateString(), amount: t.amount, balance };
    });
  }, [transactions]);

  const isRtl = i18n.language === 'ar';
  if (loading) return <div className="h-[60vh] flex flex-col items-center justify-center opacity-20"><Loader2 className="animate-spin text-indigo-600 mb-4" size={48} /><p className="font-black text-[10px] uppercase tracking-[0.4em]">{t('common.loading')}</p></div>;

  return (
    <div className={cn("w-full space-y-8 pb-20 animate-reveal", isRtl ? "text-right" : "text-left px-2 md:px-0")}>
      <SupplierDetailHeader supplier={supplier} id={id} isOverLimit={supplier?.totalDebt > (supplier?.creditLimit || 100000)} onOpenModal={()=>setIsModalOpen(true)} onNavigateBack={()=>navigate("/suppliers")} isRtl={isRtl} />
      <SupplierMetricCards supplier={supplier} purchasesCount={purchases.length} isOverLimit={supplier?.totalDebt > (supplier?.creditLimit || 100000)} isRtl={isRtl} t={t} />
      
      <div className={cn("flex items-center gap-2 md:gap-4 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar", isRtl && "flex-row-reverse")}>
         {['analytics', 'history', 'profile'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 md:px-10 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest relative transition-all border-none bg-transparent whitespace-nowrap ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-200'}`}>
             {tab} Unit
             {activeTab === tab && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && <SupplierAnalytics chartData={chartData} isOverLimit={supplier?.totalDebt > (supplier?.creditLimit || 100000)} isRtl={isRtl} />}
        {activeTab === 'profile' && <SupplierProfileTab supplier={supplier} isRtl={isRtl} t={t} />}
      </AnimatePresence>

      <AnimatePresence>{isModalOpen && <SupplierTransactionModal form={form} setForm={setForm} isSubmitting={isSubmitting} onClose={()=>setIsModalOpen(false)} onSubmit={handleSubmit} isRtl={isRtl} t={t} />}</AnimatePresence>
    </div>
  );
};

export default SupplierDetail;
