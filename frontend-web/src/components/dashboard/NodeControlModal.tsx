import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Settings2, History as HistoryIcon, Save } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import { useUpdateTenantPlanMutation } from "../../hooks/useAdminQuery";

export const NodeControlModal = ({ tenant, onClose, t, isRtl }: { tenant: any, onClose: () => void, t: any, isRtl: boolean }) => {
  const updatePlan = useUpdateTenantPlanMutation();
  const [formData, setFormData] = useState({
    plan: tenant.plan,
    maxProducts: tenant.maxProducts || 50,
    maxUsers: tenant.maxUsers || 2,
    subscriptionStatus: tenant.subscriptionStatus
  });

  const handleSave = async () => {
    toast.promise(
      updatePlan.mutateAsync({ id: tenant._id, ...formData }),
      {
        loading: t('admin.modal.syncProtocolOverrides'),
        success: t('common.success'),
        error: t('errors.serverError')
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-4 overflow-y-auto">
       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] p-10 md:p-16 shadow-[0_0_100px_rgba(79,70,229,0.2)] relative border border-white/5 my-auto overflow-hidden text-left">
          <button onClick={onClose} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90 border-none bg-transparent"><X size={24} /></button>
          
          <div className={cn("flex items-center gap-8 mb-16", isRtl && "flex-row-reverse")}>
             <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-2xl rotate-3 shrink-0 relative group">
                <Settings2 size={48} className="group-hover:rotate-90 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-ping" />
             </div>
             <div className={isRtl ? "text-right" : "text-left"}>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 dark:text-white leading-none">{t('admin.nodeControl').split(' ')[0]} <span className="text-indigo-500 text-5xl">{t('admin.nodeControl').split(' ')[1]}.</span></h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">{t('admin.modal.instanceConfig')}: {tenant.name}</p>
             </div>
          </div>

          <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12", isRtl && "rtl")}>
             <div className={cn("space-y-10", isRtl ? "text-right" : "text-left")}>
                <div className="space-y-4">
                   <label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1 block", isRtl && "mr-1")}>{t('admin.modal.saasTiersStatus')}</label>
                   <div className="grid grid-cols-2 gap-4">
                      <select className="bg-slate-50 dark:bg-[#0b141a] rounded-2xl p-5 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all uppercase" value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})}>
                         <option value="FREE">{t('admin.modal.plans.free')}</option><option value="PRO">{t('admin.modal.plans.pro')}</option><option value="ENTERPRISE">{t('admin.modal.plans.enterprise')}</option>
                      </select>
                      <select className="bg-slate-50 dark:bg-[#0b141a] rounded-2xl p-5 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all uppercase" value={formData.subscriptionStatus} onChange={(e) => setFormData({...formData, subscriptionStatus: e.target.value})}>
                         <option value="ACTIVE">{t('admin.modal.statuses.active')}</option><option value="TRIAL">{t('admin.modal.statuses.trial')}</option><option value="PAST_DUE">{t('admin.modal.statuses.pastDue')}</option><option value="CANCELED">{t('admin.modal.statuses.canceled')}</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-4">
                   <label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1 block", isRtl && "mr-1")}>{t('admin.modal.resourceReallocation')}</label>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.modal.assetCapacity')}</p><input type="number" className="w-full bg-slate-50 dark:bg-[#0b141a] rounded-2xl p-5 font-black text-indigo-500 outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500" value={formData.maxProducts} onChange={(e) => setFormData({...formData, maxProducts: Number(e.target.value)})} /></div>
                      <div className="space-y-2"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.modal.agentQuota')}</p><input type="number" className="w-full bg-slate-50 dark:bg-[#0b141a] rounded-2xl p-5 font-black text-indigo-500 outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500" value={formData.maxUsers} onChange={(e) => setFormData({...formData, maxUsers: Number(e.target.value)})} /></div>
                   </div>
                </div>
             </div>
             <div className="bg-slate-50 dark:bg-[#0b141a] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 flex flex-col justify-between shadow-inner text-left">
                <div className="space-y-8">
                   <div className={cn("flex items-center gap-3 border-b border-white/5 pb-6", isRtl && "flex-row-reverse")}>
                      <HistoryIcon size={20} className="text-indigo-500" />
                      <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter">{t('admin.modal.liveSignal')}</h3>
                   </div>
                   <div className="space-y-6">
                      <div className={cn("flex justify-between items-center", isRtl && "flex-row-reverse")}><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('admin.modal.nodeUptime')}</span><span className="text-xs font-black text-emerald-500 italic tabular-nums">99.99%</span></div>
                      <div className={cn("flex justify-between items-center", isRtl && "flex-row-reverse")}><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('admin.modal.latencyPulse')}</span><span className="text-xs font-black text-indigo-400 italic tabular-nums">14ms</span></div>
                   </div>
                </div>
                <button onClick={handleSave} className="w-full mt-10 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-4 border-none italic"><Save size={24}/> {t('admin.modal.reallocateInstance')}</button>
             </div>
          </div>
       </motion.div>
    </div>
  );
};
