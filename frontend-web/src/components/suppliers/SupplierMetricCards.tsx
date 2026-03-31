import React from "react";
import { Wallet, Landmark, ShieldCheck, FileStack } from "lucide-react";
import { cn } from "../../lib/utils";

const MetricCard = ({ label, value, unit, color, icon: Icon, isRtl }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-all shadow-sm hover:shadow-2xl">
    <div className={cn("absolute w-24 h-24 bg-500/5 dark:bg-500/10 rounded-full group-hover:scale-150 transition-transform duration-1000", isRtl ? "-left-4 -bottom-4" : "-right-4 -bottom-4", `bg-${color}`)} />
    <div className={cn("relative z-10 flex flex-col gap-6", isRtl && "items-end")}>
       <div className={cn(`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors group-hover:rotate-6`, `bg-${color}-50 dark:bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`)}><Icon size={24} /></div>
       <div className={isRtl ? "text-right" : "text-left"}>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 leading-none">{label}</p>
          <div className={cn("flex items-baseline gap-2", isRtl && "flex-row-reverse")}>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{value?.toLocaleString()}</h4>
             <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600">{unit}</span>
          </div>
       </div>
    </div>
  </div>
);

export const SupplierMetricCards = ({ supplier, purchasesCount, isOverLimit, isRtl, t }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <MetricCard label="Current Exposure" value={supplier?.totalDebt} unit="MAD" color={isOverLimit ? "rose" : "indigo"} icon={Wallet} isRtl={isRtl} />
    <MetricCard label="Node Capacity" value={supplier?.creditLimit || 100000} unit="MAD" color="indigo" icon={Landmark} isRtl={isRtl} />
    <MetricCard label="Lattice Tier" value={supplier?.category} unit="LEVEL" color="emerald" icon={ShieldCheck} isRtl={isRtl} />
    <MetricCard label="Active Deeds" value={purchasesCount} unit="Nodes" color="amber" icon={FileStack} isRtl={isRtl} />
  </div>
);
