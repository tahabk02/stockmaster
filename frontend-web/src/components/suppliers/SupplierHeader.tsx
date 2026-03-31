import React from "react";
import { Truck, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SupplierHeaderProps {
  count: number;
  onAdd: () => void;
  isAdmin: boolean;
  isRtl: boolean;
}

export const SupplierHeader = ({ count, onAdd, isAdmin, isRtl }: SupplierHeaderProps) => {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
       <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl rotate-3"><Truck size={28} /></div>
          <div>
             <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">{t('nav.suppliers')} <span className="text-indigo-500">Registry.</span></h1>
             <p className="text-indigo-300 font-bold uppercase text-[8px] tracking-[0.4em] mt-2 opacity-60">Global Node Network v4.0</p>
          </div>
       </div>
       <div className="flex items-center gap-6 relative z-10">
          <div className="text-center px-8 border-r border-white/10">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Nodes</p>
             <p className="text-3xl font-black text-indigo-400 italic leading-none">{count}</p>
          </div>
          {isAdmin && (
            <button onClick={onAdd} className="btn-pro px-8 py-4 rounded-2xl border-none"><Plus size={18} /> {t('suppliers.add')}</button>
          )}
       </div>
    </header>
  );
};
