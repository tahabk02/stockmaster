import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Activity, Loader2, Fingerprint, Cpu, ShoppingBag, Binary, Globe2, Star, Shield, Database } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, Tooltip } from "recharts";
import api from "../../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import { PulseNode } from "./TeamUI";

interface ActivityData {
  chartData: Array<{ month: string; amount: number; count: number }>;
  recentOrders: Array<{ receiptNumber: string; createdAt: string; totalPrice: number }>;
}

interface DiagnosticModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

export const DiagnosticModal = ({ userId, userName, onClose, isRtl, t }: DiagnosticModalProps) => {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get(`/users/activity/${userId}`);
        if (res.data.success) setData(res.data.data);
      } catch (err) { 
        console.error(err);
        toast.error(t('errors.serverError')); 
      } finally { setLoading(false); }
    };
    fetchActivity();
  }, [userId, t]);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostic-modal-title"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }} 
        className="bg-white dark:bg-[#0b0c10] w-full max-w-2xl rounded-[3rem] p-6 md:p-8 shadow-[0_0_100px_rgba(79,70,229,0.2)] relative border border-white/10 my-auto overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Accessibility Title (Visually Hidden) */}
        <h2 id="diagnostic-modal-title" className="sr-only">
          {userName} Diagnostic Data
        </h2>
        <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="scanline opacity-20" />
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-xl transition-all z-50 active:scale-90 border border-white/5"><X size={18} strokeWidth={3} /></button>
        
        <div className="flex items-center gap-5 mb-8 relative z-10 shrink-0">
           <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl text-white shadow-2xl relative overflow-hidden shrink-0">
              <Activity size={24} className="relative z-10" />
              <div className="absolute inset-0 bg-white/20 animate-pulse opacity-10" />
           </div>
           <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                 <PulseNode color="indigo" />
                 <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Forensic Scan</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none truncate">{userName}<span className="text-indigo-600">.OS</span></h2>
           </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
          {loading ? (
            <div className="h-[300px] flex flex-col items-center justify-center">
               <Loader2 size={40} className="animate-spin text-indigo-500 opacity-50 mb-4" />
               <p className="text-[8px] font-black uppercase tracking-[0.8em] text-indigo-500 animate-pulse">Scanning Buffer...</p>
            </div>
          ) : (
            <div className={cn("space-y-6 relative z-10 pb-4", isRtl && "rtl")}>
              
              {/* COMPACT KPI HUD */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-indigo-600 p-5 rounded-[2rem] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none"><Globe2 size={40} /></div>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-60 mb-1 relative z-10">Yield</p>
                    <p className="text-2xl font-black italic leading-none relative z-10">{data?.chartData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} <span className="text-[10px] not-italic opacity-40">DH</span></p>
                 </div>
                 <div className="bg-slate-900 p-5 rounded-[2rem] text-indigo-400 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none"><Cpu size={40} /></div>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-40 mb-1 relative z-10 text-white">Ops</p>
                    <p className="text-2xl font-black italic leading-none relative z-10">{data?.chartData.reduce((acc, curr) => acc + curr.count, 0)} <span className="text-[10px] not-italic opacity-40 text-white">UNIT</span></p>
                 </div>
              </div>

              {/* COMPACT CHART */}
              <div className="bg-slate-50 dark:bg-black/40 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-inner">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3"><Binary size={12} /> Performance Vector</h3>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm"><Star size={14} fill="currentColor" /></div><span className="text-[9px] font-black text-emerald-400 italic uppercase">MASTER</span></div>
                 </div>
                 <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={data?.chartData}>
                          <defs>
                             <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.03} />
                          <XAxis dataKey="month" hide />
                          <Tooltip contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '8px'}} />
                          <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="url(#colorAmt)" animationDuration={1000} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              
              {/* SIGNAL SEQUENCE */}
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Fingerprint size={60} /></div>
                 <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center gap-3"><Activity size={12} /> Registry Logs</h3>
                 <div className="space-y-3">
                    {!data?.recentOrders || data.recentOrders.length === 0 ? (
                      <div className="py-10 text-center opacity-20"><Database size={32} className="mx-auto mb-2" /><p className="text-[8px] font-black uppercase tracking-widest">No Signals</p></div>
                    ) : data.recentOrders.slice(0, 4).map((o, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200/60 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-800">
                          <div className="flex items-center gap-4">
                             <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl text-slate-400 shadow-sm"><ShoppingBag size={16}/></div>
                             <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-white leading-none mb-1">DEED_#{o.receiptNumber}</p>
                                <p className="text-[7px] font-black uppercase opacity-40">{new Date(o.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <p className="text-sm font-black text-indigo-600 italic shrink-0">{o.totalPrice.toLocaleString()} <span className="text-[8px] not-italic opacity-40">DH</span></p>
                       </div>
                    ))}
                 </div>
              </div>

              {/* FOOTER METADATA */}
              <div className="pt-4 flex justify-between items-center opacity-40">
                 <div className="flex gap-4"><div className="flex items-center gap-1.5"><Binary size={8} className="text-indigo-500" /><span className="text-[6px] font-black uppercase tracking-[0.2em]">SIG_LOCKED</span></div><div className="flex items-center gap-1.5"><Shield size={8} className="text-indigo-500" /><span className="text-[6px] font-black uppercase tracking-[0.2em]">ENCR_STABLE</span></div></div>
                 <span className="text-[6px] font-black uppercase tracking-[0.3em]">Sector_0_Node</span>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
