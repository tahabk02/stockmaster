import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Eye, Edit } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductInventoryGridProps {
  products: any[];
  isRtl: boolean;
  t: (key: string) => string;
  onView: (p: any) => void;
  onEdit: (p: any) => void;
}

export const ProductInventoryGrid = ({ products, isRtl, t, onView, onEdit }: ProductInventoryGridProps) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-2 md:px-0">
    <AnimatePresence>
      {products.map((p, idx) => (
        <motion.div layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: idx * 0.02, duration: 0.4 }} key={p._id || idx} className="bg-white dark:bg-slate-900 shadow-pro border border-slate-200/60 dark:border-white/5 p-3 rounded-[1.5rem] group flex flex-col hover:border-indigo-500/40 transition-all">
          <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative border border-slate-100 dark:border-white/5 transition-colors shadow-inner">
            {p.image ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" /> : <Package className="text-slate-300 dark:text-slate-800" size={32} strokeWidth={1} />}
            <div className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'}`}><span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[6px] font-black uppercase text-indigo-600 border border-slate-200/50 shadow-sm">{(p.category && typeof p.category === 'object') ? (p.category as any).name : 'Asset'}</span></div>
          </div>
          <div className="flex-1 space-y-1.5">
             <h3 className="text-[11px] truncate mb-0 leading-tight group-hover:text-indigo-600 transition-colors text-slate-950 dark:text-white font-black italic uppercase tracking-tighter">{p.name}</h3>
             <div className="flex justify-between items-center">
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 italic">{(p.price || 0).toLocaleString()} <span className="text-[7px] not-italic opacity-50 uppercase font-bold">DH</span></p>
                <div className="flex items-center gap-1.5"><div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)]", p.quantity < 10 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500')} /><p className={cn("text-[9px] font-black uppercase", p.quantity < 10 ? 'text-rose-500' : 'text-slate-500')}>{p.quantity} U</p></div>
             </div>
          </div>
          <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
             <button onClick={() => onView(p)} className="flex-1 bg-black text-white dark:bg-white dark:text-black py-2 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-md active:scale-95 group/btn text-[8px] font-black uppercase border-none"><Eye size={10} className="mr-1" /> {t('common.view')}</button>
             <button onClick={() => onEdit(p)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border-none"><Edit size={12} /></button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
