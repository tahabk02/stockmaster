import React from "react";
import { Activity, ShoppingCart } from "lucide-react";
import { cn } from "../../lib/utils";

interface RecentSignalsProps {
  orders: any[];
  isRtl: boolean;
  t: (key: string) => string;
}

export const RecentSignals = ({ orders, isRtl, t }: RecentSignalsProps) => (
  <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden">
    <div className={cn("p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/30 dark:bg-white/[0.02]", isRtl && "flex-row-reverse")}>
      <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
         <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg"><Activity size={18}/></div>
         <h2 className="text-lg font-black text-indigo-950 dark:text-white uppercase italic tracking-tighter">{t('dashboard.recentSignals')}</h2>
      </div>
      <button className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-all border-none bg-transparent">{t('dashboard.viewStream')}</button>
    </div>
    <div className="overflow-x-auto custom-scrollbar">
      <table className={cn("w-full text-left border-collapse", isRtl && "text-right")}>
        <thead>
          <tr className="text-[7px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20">
            <th className="p-6">{t('dashboard.traceId')}</th>
            <th className="p-6">{t('dashboard.entity')}</th>
            <th className="p-6">{t('dashboard.value')}</th>
            <th className="p-6">{t('dashboard.protocolLabel')}</th>
            <th className="p-6 text-right">{t('dashboard.timestamp')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
          {orders.map((o: any, i) => (
            <tr key={i} className="hover:bg-indigo-600/[0.02] dark:hover:bg-white/[0.02] transition-all group cursor-default">
              <td className="p-6 font-mono font-bold text-[9px] text-slate-400 group-hover:text-indigo-500 transition-colors">#{o._id?.slice(-6).toUpperCase() || `ORD-0${i}`}</td>
              <td className="p-6">
                <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-[10px] border border-indigo-500/20 shadow-inner group-hover:rotate-6 transition-transform">{(o.clientId?.name || "U").charAt(0)}</div>
                  <span className="font-black text-[11px] text-slate-900 dark:text-white uppercase italic truncate max-w-[120px]">{o.clientId?.name || "Anonymous Node"}</span>
                </div>
              </td>
              <td className="p-6 font-black text-indigo-600 dark:text-indigo-400 italic text-[13px]">{(o.totalPrice || 0).toLocaleString()} <span className="text-[8px] not-italic opacity-50 uppercase">DH</span></td>
              <td className="p-6">
                <span className={cn("px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all", 
                  o.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20")}>
                  SIG_{o.status}
                </span>
              </td>
              <td className="p-6 text-right text-slate-400 font-bold text-[9px] uppercase tracking-tighter">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
