import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../services/subscriptionPlan.service";

import type { SubscriptionPlan } from "../types/subscriptionPlan";
import { PlanStatus, BillingCycle } from "../types/subscription.constants";

import {
  PlusCircle,
  Loader2,
  Search,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Zap,
  ShieldCheck,
  Package,
  Users,
  Database,
  ArrowRight,
  TrendingUp,
  RefreshCcw,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/auth.slice";

import FormInput from "../components/ui/FormInput";

export const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [form, setForm] = useState({
    name: "",
    description: "",
    features: "",
    price: "0",
    currency: "MAD",
    billingCycle: BillingCycle.MONTHLY,
    status: PlanStatus.ACTIVE,
    isTrialAvailable: false,
    trialDays: "0",
    maxProducts: "100",
    maxUsers: "5",
    maxStorageGB: "1",
    order: "0",
  });

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionPlans(1, searchTerm);
      setPlans(data.data || []);
    } catch (error) {
      toast.error("Database Sync Failure");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<SubscriptionPlan> = {
        ...form,
        features: form.features.split(",").map((f) => f.trim()).filter(f => f),
        price: Number(form.price),
        trialDays: Number(form.trialDays),
        maxProducts: Number(form.maxProducts),
        maxUsers: Number(form.maxUsers),
        maxStorageGB: Number(form.maxStorageGB),
        order: Number(form.order),
      };

      if (editingId) {
        await updateSubscriptionPlan(editingId, payload as any);
        toast.success("Updated Successfully");
      } else {
        await createSubscriptionPlan(payload as any);
        toast.success("Created Successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      toast.error("Operation Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Authorize permanent removal?")) return;
    try {
      await deleteSubscriptionPlan(id);
      toast.success("Removed Successfully");
      fetchPlans();
    } catch (e) {
      toast.error("Action Restricted");
    }
  };

  const openEdit = (plan: any) => {
    setEditingId(plan._id);
    setForm({
      name: plan.name,
      description: plan.description || "",
      features: plan.features ? plan.features.join(", ") : "",
      price: String(plan.price),
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      status: plan.status,
      isTrialAvailable: plan.isTrialAvailable,
      trialDays: String(plan.trialDays),
      maxProducts: String(plan.maxProducts || 100),
      maxUsers: String(plan.maxUsers || 5),
      maxStorageGB: String(plan.maxStorageGB || 1),
      order: String(plan.order),
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      features: "",
      price: "0",
      currency: "MAD",
      billingCycle: BillingCycle.MONTHLY,
      status: PlanStatus.ACTIVE,
      isTrialAvailable: false,
      trialDays: "0",
      maxProducts: "100",
      maxUsers: "5",
      maxStorageGB: "1",
      order: "0",
    });
  };

  const isRtl = i18n.language === "ar";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className={`w-full space-y-6 md:space-y-8 pb-16 px-3 md:px-6 ${isRtl ? "text-right" : "text-left"}`}>
      
      {/* 1. CINEMATIC HEADER - more compact */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
           <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg">
                 <CreditCard className="text-white" size={20} />
              </div>
              <h1 className="text-xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">
                 {t('plans.title').split(' ')[0]} <span className="text-indigo-600">{t('plans.title').split(' ')[1]}.</span>
              </h1>
           </div>
           <p className="text-slate-400 dark:text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mt-1 italic">{t('plans.subtitle')}</p>
        </motion.div>

        <div className="flex gap-2 w-full md:w-auto">
           <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg flex gap-1 shrink-0">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>{t('plans.view.grid')}</button>
              <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>{t('plans.view.table')}</button>
           </div>
           {isAdmin && (
            <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shrink-0">
              <PlusCircle size={14} /> {t('plans.new')}
            </button>
          )}
        </div>
      </header>

      {/* 2. SEARCH BAR - compact */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={16} />
          <input type="text" placeholder={t('plans.search')} className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-600/20 shadow-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => fetchPlans()} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-lg hover:bg-indigo-600 hover:text-white transition-all shrink-0 group">
           <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center opacity-50">
           <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={40} />
           <p className="text-[8px] font-black uppercase tracking-[0.4em]">{t('plans.syncing')}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
          {plans.map((plan: any, i) => (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} key={plan._id} className={`relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl overflow-hidden group hover:border-indigo-500/30 transition-all ${plan.status !== PlanStatus.ACTIVE ? 'opacity-50 grayscale' : ''}`}>
               <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 group-hover:rotate-6 transition-transform shrink-0"><Zap size={20} fill="currentColor" /></div>
                  <div className={`px-2.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border shrink-0 ${plan.status === PlanStatus.ACTIVE ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>{plan.status}</div>
               </div>

               <div className="space-y-4 mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic truncate">{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5">
                     <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-indigo-600 leading-none">{plan.price} {plan.currency}</span>
                     <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest truncate">/ {plan.billingCycle}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight leading-relaxed line-clamp-2">{plan.description || t('plans.defaultDescription')}</p>
               </div>

               <div className="grid grid-cols-3 gap-2 mb-6 md:mb-8">
                  <ConstraintBadge icon={<Package size={10}/>} val={plan.maxProducts} label={t('plans.labels.assets')} />
                  <ConstraintBadge icon={<Users size={10}/>} val={plan.maxUsers} label={t('plans.labels.nodes')} />
                  <ConstraintBadge icon={<Database size={10}/>} val={`${plan.maxStorageGB}G`} label={t('plans.labels.vault')} />
               </div>

               <div className="space-y-2.5 mb-8 flex-1">
                  {plan.features.slice(0, 4).map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 truncate">
                       <CheckCircle2 size={12} className="text-indigo-600 shrink-0" /> {f}
                    </div>
                  ))}
               </div>

               <div className="flex gap-2.5 pt-4 border-t border-slate-50 dark:border-white/5">
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(plan)} className="flex-1 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 shrink-0"><Edit size={12} /> {t('plans.actions.update')}</button>
                      <button onClick={() => handleDelete(plan._id)} className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl border border-rose-100 dark:border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-95 shrink-0"><Trash2 size={14} /></button>
                    </>
                  )}
               </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden transition-all">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-6">{t('plans.table.protocol')}</th>
                  <th className="p-6">{t('plans.table.config')}</th>
                  <th className="p-6">{t('plans.table.resources')}</th>
                  <th className="p-6">{t('plans.table.status')}</th>
                  {isAdmin && <th className="p-6 text-right">{t('plans.table.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {plans.map((plan: any) => (
                  <tr key={plan._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black italic text-[10px] shrink-0">#{plan.order}</div>
                          <div className="min-w-0"><p className="text-xs font-black text-slate-950 dark:text-white uppercase italic truncate">{plan.name}</p><p className="text-[7px] font-bold text-slate-400 uppercase">ID: {plan._id.slice(-6)}</p></div>
                       </div>
                    </td>
                    <td className="p-6">
                       <p className="text-sm font-black text-slate-900 dark:text-white italic leading-none">{plan.price} {plan.currency}</p>
                       <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">/ {plan.billingCycle}</p>
                    </td>
                    <td className="p-6">
                       <div className="flex gap-4">
                          <div><p className="text-[7px] font-black text-slate-400 uppercase">{t('plans.labels.assets')}</p><p className="text-[10px] font-black text-slate-700 dark:text-slate-300 italic">{plan.maxProducts}</p></div>
                          <div><p className="text-[7px] font-black text-slate-400 uppercase">{t('plans.labels.nodes')}</p><p className="text-[10px] font-black text-slate-700 dark:text-slate-300 italic">{plan.maxUsers}</p></div>
                          <div><p className="text-[7px] font-black text-slate-400 uppercase">{t('plans.labels.vault')}</p><p className="text-[10px] font-black text-slate-700 dark:text-slate-300 italic">{plan.maxStorageGB}G</p></div>
                       </div>
                    </td>
                    <td className="p-6">
                       <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${plan.status === PlanStatus.ACTIVE ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{plan.status}</span>
                    </td>
                    {isAdmin && (
                      <td className="p-6 text-right">
                        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} gap-2`}>
                           <button onClick={() => openEdit(plan)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shrink-0 shadow-sm"><Edit size={12} /></button>
                           <button onClick={() => handleDelete(plan._id)} className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-rose-400 hover:text-rose-600 transition-all shrink-0 shadow-sm"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL - refined for compact display */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] p-6 md:p-10 shadow-2xl relative my-auto border border-slate-100 dark:border-slate-800">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full hover:bg-rose-500 transition-all shrink-0"><X size={20} /></button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl rotate-3 shrink-0"><Star size={24} fill="currentColor" /></div>
                <div><h2 className="text-xl font-black uppercase text-slate-950 dark:text-white italic tracking-tighter leading-none">{editingId ? t('plans.modal.modify') : t('plans.modal.provision')} <span className="text-indigo-600">{t('plans.modal.protocol')}.</span></h2><p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">{t('plans.modal.subtitle')}</p></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormInput label={t('plans.fields.name')} name="name" value={form.name} onChange={handleFormChange} required isRtl={isRtl} />
                  <FormInput label={t('plans.fields.price')} name="price" type="number" value={form.price} onChange={handleFormChange} required isRtl={isRtl} />
                  <div className="md:col-span-2"><FormInput label={t('plans.fields.features')} name="features" value={form.features} onChange={handleFormChange} isRtl={isRtl} /></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('plans.fields.billing')}</label><select name="billingCycle" value={form.billingCycle} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-indigo-600/20">{Object.values(BillingCycle).map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>
                  <div className="space-y-1.5"><label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{t('plans.fields.status')}</label><select name="status" value={form.status} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-indigo-600/20">{Object.values(PlanStatus).map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
                  <div className="md:col-span-2 pt-4 border-t border-slate-50 dark:border-white/5"><div className="grid grid-cols-3 gap-4"><FormInput label={t('plans.fields.maxAssets')} name="maxProducts" type="number" value={form.maxProducts} onChange={handleFormChange} isRtl={isRtl} /><FormInput label={t('plans.fields.maxNodes')} name="maxUsers" type="number" value={form.maxUsers} onChange={handleFormChange} isRtl={isRtl} /><FormInput label={t('plans.fields.maxVault')} name="maxStorageGB" type="number" value={form.maxStorageGB} onChange={handleFormChange} isRtl={isRtl} /></div></div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3">{isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={18} />} {t('plans.actions.commit')}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConstraintBadge = ({ icon, val, label }: any) => (
  <div className="bg-slate-50 dark:bg-slate-950/50 p-2 md:p-3 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center text-center">
     <div className="text-indigo-600 mb-1">{icon}</div>
     <p className="text-[10px] font-black text-slate-950 dark:text-white italic leading-none">{val}</p>
     <p className="text-[6px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{label}</p>
  </div>
);

export default SubscriptionPlans;
