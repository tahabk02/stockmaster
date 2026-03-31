import React from "react";
import { motion } from "framer-motion";
import { Package, Info, Activity, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

interface StoreInventoryProps {
  products: any[];
  activeTab: string;
  isRtl: boolean;
  onAddToCart: (p: any) => void;
  onShowInfo: (p: any) => void;
}

export const StoreInventory = ({ products, activeTab, isRtl, onAddToCart, onShowInfo }: StoreInventoryProps) => {
  if (activeTab !== "INVENTORY") {
    return (
      <div className="col-span-full py-40 text-center opacity-20">
         <Activity size={100} className="mx-auto mb-10 text-indigo-600 animate-pulse" />
         <p className="text-lg font-black uppercase tracking-[0.8em]">Awaiting Real-time Signals...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
       {products.filter(Boolean).map((p, idx) => (
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={p._id} className="glass-card p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] group hover:border-indigo-500/40 transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mb-6 md:mb-8 relative border border-white/5 shadow-inner">
               {p.image ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" /> : <Package size={50} className="m-auto absolute inset-0 text-slate-300 opacity-20" />}
               <div className={cn("absolute top-4", isRtl ? "right-4" : "left-4")}><span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase text-indigo-600 shadow-xl border border-white/50">{p.category?.name || "Neural Asset"}</span></div>
               <button onClick={(e) => { e.stopPropagation(); onShowInfo(p); }} className={cn("absolute top-4 p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20 border-none", isRtl ? "left-4" : "right-4")}><Info size={18} /></button>
            </div>
            
            <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4 md:mb-6 line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
            
            <div className={cn("flex justify-between items-end", isRtl && "flex-row-reverse")}>
               <div className={isRtl ? "text-right" : "text-left"}>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Exchange Value</p>
                  <p className="text-2xl md:text-3xl font-black text-indigo-600 italic tracking-tighter leading-none">{p.price.toLocaleString()} <span className="text-[10px] md:text-xs not-italic opacity-40 uppercase">DH</span></p>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => onShowInfo(p)} className="p-4 md:p-5 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all active:scale-95 border-none"><Activity size={20}/></button>
                  <button onClick={() => onAddToCart(p)} className="p-4 md:p-5 bg-slate-950 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 group/buy relative overflow-hidden border-none"><Plus size={24} className="relative z-10 group-hover/buy:rotate-90 transition-transform duration-500" /></button>
               </div>
            </div>
         </motion.div>
       ))}
    </div>
  );
};
