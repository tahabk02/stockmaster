import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { Search, Loader2, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/auth.slice";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { SupplierHeader } from "../components/suppliers/SupplierHeader";
import { SupplierCard } from "../components/suppliers/SupplierCard";
import { SupplierFormModal } from "../components/suppliers/SupplierFormModal";

export const Suppliers = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = useMemo(() => ["ADMIN", "SUPER_ADMIN", "VENDOR"].includes(user?.role || ""), [user]);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const fetchSuppliers = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get("/suppliers"); setSuppliers(data.data || []); } 
    catch (e) { toast.error(t('errors.networkError')); } finally { setLoading(false); }
  }, [t]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/suppliers", form);
      toast.success(t('common.success')); setIsModalOpen(false); setForm({ name: "", phone: "", email: "", address: "" }); fetchSuppliers();
    } catch (err: any) { toast.error(err.response?.data?.message || t('errors.serverError')); } finally { setIsSubmitting(false); }
  };

  const filtered = suppliers.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const isRtl = i18n.language === 'ar';

  if (loading) return <div className="h-screen flex flex-col items-center justify-center opacity-20"><Loader2 className="animate-spin text-indigo-600 mb-4" size={48} /><p className="font-black text-[10px] uppercase tracking-[0.5em]">{t('suppliers.scanning')}</p></div>;

  return (
    <div className={cn("w-full space-y-8 pb-32 animate-reveal", isRtl ? "text-right" : "text-left px-2 md:px-0")}>
      <SupplierHeader count={suppliers.length} onAdd={()=>{setForm({ name: "", phone: "", email: "", address: "" }); setIsModalOpen(true);}} isAdmin={isAdmin} isRtl={isRtl} />

      <div className="flex flex-col md:flex-row gap-4 bg-white/5 dark:bg-slate-950/40 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-pro">
        <div className="relative flex-1 group"><Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-6" : "left-6")} size={20} /><input placeholder={t('suppliers.searchPlaceholder')} className={cn("w-full bg-slate-100/50 dark:bg-black/40 border-none rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl ? "pr-16 text-right" : "pl-16")} value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
         {filtered.map((s, i) => <SupplierCard key={s._id || `supp-${i}`} s={s} idx={i} onClick={(id)=>navigate(`/suppliers/${id}`)} isRtl={isRtl} />)}
      </div>

      <AnimatePresence>{isModalOpen && <SupplierFormModal form={form} handleFormChange={(e)=>setForm({...form, [e.target.name]: e.target.value})} isSubmitting={isSubmitting} onClose={()=>setIsModalOpen(false)} onSubmit={handleSubmit} isRtl={isRtl} t={t} />}</AnimatePresence>
    </div>
  );
};

export default Suppliers;
