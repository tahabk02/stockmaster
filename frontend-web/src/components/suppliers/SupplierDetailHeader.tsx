import React from "react";
import { ArrowLeft, PlusCircle, Download, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

interface SupplierDetailHeaderProps {
  supplier: any;
  id?: string;
  isOverLimit: boolean;
  onOpenModal: () => void;
  onNavigateBack: () => void;
  isRtl: boolean;
}

export const SupplierDetailHeader = ({ 
  supplier, id, isOverLimit, onOpenModal, onNavigateBack, isRtl 
}: SupplierDetailHeaderProps) => (
  <header className={cn("flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-colors shrink-0", isRtl && "lg:flex-row-reverse")}>
    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
      <button onClick={onNavigateBack} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90 border-none bg-transparent"><ArrowLeft size={20} className={isRtl ? "rotate-180" : ""} /></button>
      <div className="min-w-0">
        <div className={cn("flex items-center gap-3 mb-2 flex-wrap", isRtl && "flex-row-reverse")}>
           <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">Authorized Node</span>
           {isOverLimit && <span className="px-3 py-1 bg-rose-500/10 text-rose-600 text-[9px] font-black rounded-full border border-rose-500/20 uppercase tracking-widest flex items-center gap-1 shadow-sm animate-pulse"><AlertTriangle size={10}/> Exposure Critical</span>}
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">REF: {id?.slice(-8).toUpperCase()}</p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic truncate leading-none">{supplier?.name}</h1>
      </div>
    </div>
    <div className={cn("flex gap-4 w-full lg:w-auto", isRtl && "flex-row-reverse")}>
       <button onClick={onOpenModal} className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95 border-none"><PlusCircle size={18} /> Record Signal</button>
       <button className="p-5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-transparent hover:text-slate-900 transition-all border-none bg-transparent active:scale-90"><Download size={20}/></button>
    </div>
  </header>
);
