import React from "react";
import { Building2, FileText, Phone, Mail, Landmark, Shield } from "lucide-react";
import { cn } from "../../lib/utils";

const DataField = ({ label, value, icon: Icon, isRtl }: any) => (
  <div className={cn("flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all group shadow-sm", isRtl && "flex-row-reverse")}>
     <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:scale-110 transition-transform shrink-0"><Icon size={16} className="text-indigo-600 dark:text-indigo-400" /></div>
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{label}</span>
     </div>
     <span className="text-sm font-black italic text-slate-900 dark:text-slate-200 transition-colors truncate ml-4">{value}</span>
  </div>
);

export const SupplierProfileTab = ({ supplier, isRtl, t }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className={cn("text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-10 border-b border-slate-50 dark:border-slate-800 pb-6", isRtl && "text-right")}>Corporate ID</h3>
        <div className="space-y-6">
           <DataField label="Legal Entity" value={supplier?.name} icon={Building2} isRtl={isRtl} />
           <DataField label="Fiscal ID (ICE)" value={supplier?.taxId || "UNPROVISIONED"} icon={FileText} isRtl={isRtl} />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Signal Node" value={supplier?.phone} icon={Phone} isRtl={isRtl} />
              <DataField label="Neural Email" value={supplier?.email} icon={Mail} isRtl={isRtl} />
           </div>
        </div>
     </div>
     <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className={cn("text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-10 border-b border-slate-50 dark:border-slate-800 pb-6", isRtl && "text-right")}>Banking Protocol</h3>
        <div className="space-y-6">
           <DataField label="Bank Provider" value={supplier?.bankDetails?.bankName || "Institutional Bank"} icon={Landmark} isRtl={isRtl} />
           <div className={cn("p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors shadow-inner", isRtl ? "border-r-4 border-r-indigo-600" : "border-l-4 border-l-indigo-600")}>
              <p className={cn("text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3", isRtl && "text-right")}>Institutional RIB (24 Digits)</p>
              <p className={cn("font-mono text-lg text-indigo-600 dark:text-indigo-400 tracking-[0.2em] font-black truncate", isRtl && "text-right")}>{supplier?.bankDetails?.rib || "000 000 00000000000000 00"}</p>
           </div>
           <div className={cn("flex items-center gap-4 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-sm", isRtl && "flex-row-reverse")}>
              <Shield size={24} className="text-emerald-500" />
              <div className={isRtl ? "text-right" : "text-left"}>
                 <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest leading-none">Security Verified</p>
                 <p className="text-[9px] font-bold text-emerald-600/60 uppercase mt-1">Full compliance confirmed</p>
              </div>
           </div>
        </div>
     </div>
  </div>
);
