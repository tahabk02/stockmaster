import React from "react";
import { Activity, ShoppingCart } from "lucide-react";
import { cn } from "../../lib/utils";

interface RecentSignalsProps {
  orders: any[];
  isRtl: boolean;
  t: (key: string) => string;
}

export const RecentSignals = ({ orders, isRtl, t }: RecentSignalsProps) => (
  <div className="theme-card rounded-[2.5rem] overflow-hidden relative group">
    <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
    <div className="scanline opacity-10" />
    
    <div className={cn("p-6 md:p-8 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] relative z-10", isRtl && "flex-row-reverse")}>
      <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
         <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl">
            <Activity size={20} className="animate-pulse" />
         </div>
         <div>
            <h2 className="text-xl font-black text-indigo-950 dark:text-white uppercase italic tracking-tighter leading-none">{t('dashboard.recentSignals')}</h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 italic">LATTICE_STREAM</p>
         </div>
      </div>
      <button className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white px-6 py-2.5 rounded-xl transition-all border border-indigo-500/20 bg-transparent active:scale-95 italic">
        {t('dashboard.viewStream')} ↗
      </button>
    </div>

    <div className="overflow-x-auto custom-scrollbar relative z-10">
      <table className={cn("pro-table w-full", isRtl && "text-right")}>
        <thead>
          <tr>
            <th>{t('dashboard.traceId')}</th>
            <th>{t('dashboard.entity')}</th>
            <th>{t('dashboard.value')}</th>
            <th>{t('dashboard.protocolLabel')}</th>
            <th className="text-right">{t('dashboard.timestamp')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {orders.map((o: any, i) => (
            <tr key={i} className="group/row cursor-default">
              <td className="font-mono font-black text-[9px] text-slate-400 group-hover/row:text-indigo-500 transition-colors">#{o._id?.slice(-6).toUpperCase() || `ORD-0${i}`}</td>
              <td>
                <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-[10px] border border-indigo-500/20 shadow-inner group-hover/row:rotate-3 transition-all duration-500">
                    {(o.clientId?.name || "U").charAt(0)}
                  </div>
                  <span className="font-black text-[12px] text-slate-900 dark:text-white uppercase italic tracking-tighter truncate max-w-[120px]">{o.clientId?.name || "Anonymous Node"}</span>
                </div>
              </td>
              <td className="font-black text-indigo-600 dark:text-indigo-400 italic text-[14px]">{(o.totalPrice || 0).toLocaleString()} <span className="text-[8px] not-italic opacity-40 uppercase ml-0.5">DH</span></td>
              <td>
                <div className={cn("px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-[0.1em] border inline-flex items-center gap-1.5 transition-all", 
                  o.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20")}>
                  SIG_{o.status}
                </div>
              </td>
              <td className="text-right text-slate-400 font-black text-[9px] uppercase tracking-tighter italic">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

