import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptions,
  cancelSubscription,
} from "../services/subscription.service";

import type { Subscription } from "../types/subscription";
import { SubscriptionStatus } from "../types/subscription.constants";

import {
  Loader2, Search, Eye, X, CheckCircle2, DollarSign, Calendar, 
  CreditCard, Zap, ShieldCheck, Activity, ArrowUpRight, Clock,
  RefreshCcw, Layers, LayoutDashboard, Fingerprint
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/auth.slice";

export const MySubscriptions = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions(1, searchTerm);
      const filteredData =
        user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
          ? data.data
          : data.data.filter((sub: Subscription) => sub.userId === user?.id);
      setSubscriptions(filteredData || []);
    } catch (error) {
      toast.error("Subscription Sync Failure");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, user]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const handleCancelSubscription = async (id: string) => {
    if (!window.confirm("Authorize permanent termination of this protocol?")) return;
    const toastId = toast.loading("Processing termination...");
    try {
      await cancelSubscription(id);
      toast.success("Protocol Terminated", { id: toastId });
      fetchSubscriptions();
      setIsDrawerOpen(false);
    } catch (e) {
      toast.error("Termination Protocol Denied", { id: toastId });
    }
  };

  const openDrawer = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setIsDrawerOpen(true);
  };

  const isRtl = i18n.language === "ar";

  return (
    <div className={`w-full space-y-10 pb-32 px-3 md:px-6 transition-all duration-500 font-sans ${isRtl ? "text-right" : "text-left"}`}>
      
      {/* 1. CINEMATIC HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/40 rotate-3">
                  <Fingerprint size={28} />
               </div>
               <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">Subscription <span className="text-indigo-500">Lifecycle.</span></h1>
            </div>
            <p className="text-indigo-300 font-bold uppercase text-[9px] tracking-[0.4em] ml-1">Universal Access Protocols v3.0</p>
         </div>

         <div className="flex flex-wrap gap-4 relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center gap-8 shadow-2xl">
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest text-center">Active nodes</p>
                  <p className="text-3xl font-black text-indigo-400 italic leading-none text-center">{subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length}</p>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest text-center">Status</p>
                  <div className="flex items-center gap-2 justify-center">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                     <p className="text-xl font-black text-emerald-400 italic leading-none uppercase">Verified</p>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* 2. SEARCH RIBBON */}
      <div className="flex gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-all">
        <div className="relative flex-1 group">
          <Search className={`absolute ${isRtl ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
          <input
            type="text"
            placeholder="LOOKUP SUBSCRIPTION PROTOCOL..."
            className={`w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-[1.5rem] ${isRtl ? "pr-14 pl-6" : "pl-14 pr-6"} py-5 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => fetchSubscriptions()} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] shadow-lg hover:bg-indigo-600 hover:text-white transition-all group active:scale-95 shrink-0">
           <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* 3. SUBSCRIPTIONS DATA GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden transition-all">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <th className="p-8">Protocol Details</th>
                <th className="p-8 text-center">Value Payload</th>
                <th className="p-8 text-center">Renewal Pulse</th>
                <th className="p-8 text-center">Node Status</th>
                <th className="p-8 text-right">Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="p-32 text-center">
                  <Activity className="animate-spin mx-auto text-indigo-500 mb-6" size={48} />
                  <p className="font-black uppercase text-[10px] tracking-[0.5em] text-slate-400">Syncing Subscription Registry...</p>
                </td></tr>
              ) : (
                subscriptions.map((sub, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    key={sub._id} 
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group cursor-default"
                  >
                    <td className="p-8">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                             <Layers size={24} />
                          </div>
                          <div>
                             <p className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none mb-1.5">{sub.planName}</p>
                             <div className="flex items-center gap-2">
                                <Clock size={10} className="text-slate-400" />
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Initialized: {new Date(sub.startDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="p-8 text-center">
                       <p className="text-lg font-black text-slate-950 dark:text-white italic tracking-tighter">{sub.price} <span className="text-[10px] not-italic opacity-50">{sub.currency}</span></p>
                       <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg uppercase tracking-widest text-slate-500">{sub.billingCycle}</span>
                    </td>
                    <td className="p-8 text-center">
                       <div className="space-y-1.5">
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{new Date(sub.nextRenewalDate).toLocaleDateString()}</p>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Automatic Renewal</p>
                       </div>
                    </td>
                    <td className="p-8 text-center">
                       <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRIAL 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${sub.status === SubscriptionStatus.ACTIVE ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
                            {sub.status}
                          </span>
                       </div>
                    </td>
                    <td className="p-8 text-right">
                       <button onClick={() => openDrawer(sub)} className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 rounded-xl transition-all active:scale-90 border border-transparent hover:border-indigo-500/30 shadow-sm">
                          <Eye size={18} />
                       </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DIAGNOSTIC DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedSubscription && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]" onClick={() => setIsDrawerOpen(false)} />
            <motion.aside
              initial={{ x: isRtl ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className={`fixed ${isRtl ? "left-0" : "right-0"} top-0 h-full w-full max-w-lg bg-white dark:bg-[#020617] shadow-2xl z-[101] flex flex-col`}
            >
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-3xl -mr-32 -mt-32" />
                 <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl rotate-3"><ShieldCheck size={36} /></div>
                    <div>
                       <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{selectedSubscription.planName}</h2>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">PROTOCOL ID: {selectedSubscription._id.slice(-8).toUpperCase()}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsDrawerOpen(false)} className="relative z-10 p-4 bg-white/10 text-white rounded-2xl hover:bg-rose-500 transition-all active:scale-90"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                 <div className="grid grid-cols-1 gap-6">
                    <DetailNode label="Price Unit" value={`${selectedSubscription.price} ${selectedSubscription.currency}`} icon={DollarSign} />
                    <DetailNode label="Billing Engine" value={selectedSubscription.billingCycle} icon={Calendar} />
                    <DetailNode label="Payment Method" value={selectedSubscription.paymentMethod} icon={CreditCard} />
                    <DetailNode label="Next Pulse" value={new Date(selectedSubscription.nextRenewalDate).toLocaleDateString()} icon={Zap} />
                 </div>

                 <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex justify-between items-center">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2"><Activity size={14}/> Access Integrity</h4>
                       <span className="text-[8px] font-black px-2 py-1 bg-indigo-600 text-white rounded-lg">LIVE SIGNAL</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed">
                       Current access protocol is {selectedSubscription.status}. Resource nodes are verified and operational.
                    </p>
                 </div>
              </div>

              {(selectedSubscription.status === SubscriptionStatus.ACTIVE || selectedSubscription.status === SubscriptionStatus.TRIAL) && (
                <div className="p-10 border-t border-white/5 bg-slate-50 dark:bg-slate-950/50">
                  <button
                    onClick={() => handleCancelSubscription(selectedSubscription._id)}
                    className="w-full bg-rose-500/10 text-rose-500 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-95 shadow-xl"
                  >
                    Terminate Protocol
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailNode = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/30 transition-all">
     <div className="flex items-center gap-4">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-md group-hover:scale-110 transition-transform"><Icon size={18} className="text-indigo-600 dark:text-indigo-400" /></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
     </div>
     <p className="text-base font-black text-slate-950 dark:text-white italic tracking-tighter">{value}</p>
  </div>
);

export default MySubscriptions;
