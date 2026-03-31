import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, X, Box, Package, Minus, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface StoreCartProps {
  cart: any[];
  isRtl: boolean;
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  totalAmount: number;
  onCheckout: () => void;
}

export const StoreCart = ({ cart, isRtl, onClose, onUpdateQty, onRemove, totalAmount, onCheckout }: StoreCartProps) => (
  <motion.aside initial={{ x: isRtl ? -500 : 500 }} animate={{ x: 0 }} exit={{ x: isRtl ? -500 : 500 }} className={cn("fixed top-0 bottom-0 z-[150] w-full md:w-[450px] bg-white dark:bg-[#0b141a] shadow-[-20px_0_100px_rgba(0,0,0,0.3)] border-l border-white/5 flex flex-col", isRtl ? "left-0 border-r" : "right-0")}>
     <div className={cn("p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50", isRtl && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
           <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-2xl shadow-indigo-500/20"><ShoppingCart size={24} /></div>
           <div className={isRtl ? "text-right" : "text-left"}>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Transaction Buffer</h2>
              <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-2">Temporal Order Storage</p>
           </div>
        </div>
        <button onClick={onClose} className="p-2.5 bg-white dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-xl border-none"><X size={24}/></button>
     </div>

     <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
             <Box size={100} strokeWidth={1} className="text-indigo-600 animate-pulse" />
             <p className="font-black uppercase text-xs tracking-[0.6em] mt-8 text-center leading-relaxed">Buffer Empty:<br/>No Assets Detected</p>
          </div>
        ) : cart.map((item, idx) => (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={item._id} className={cn("p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-white/5 flex items-center gap-5 group transition-all hover:border-indigo-500/20 shadow-lg", isRtl && "flex-row-reverse")}>
             <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden shrink-0 border border-white/10 shadow-inner">
                {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <Package size={24} className="m-auto mt-5 text-slate-300 opacity-20" />}
             </div>
             <div className={cn("flex-1 min-w-0", isRtl ? "text-right" : "text-left")}>
                <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase truncate italic tracking-tight">{item.name}</p>
                <p className="text-lg font-black text-indigo-600 italic tracking-tighter mt-1">{(item.price * item.qty).toLocaleString()} <span className="text-[9px] not-italic text-slate-400 uppercase">DH</span></p>
                
                <div className={cn("flex items-center gap-4 mt-4 bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-white/5 w-fit shadow-inner", isRtl && "ml-auto mr-0 flex-row-reverse")}>
                   <button onClick={() => onUpdateQty(item._id, -1)} className="p-1 text-slate-400 hover:text-rose-500 active:scale-90 transition-all border-none bg-transparent"><Minus size={14}/></button>
                   <span className="text-[11px] font-black w-6 text-center text-slate-900 dark:text-white">{item.qty}</span>
                   <button onClick={() => onUpdateQty(item._id, 1)} className="p-1 text-slate-400 hover:text-indigo-600 active:scale-90 transition-all border-none bg-transparent"><Plus size={14}/></button>
                </div>
             </div>
             <button onClick={() => onRemove(item._id)} className="opacity-0 group-hover:opacity-100 p-3 text-rose-400 hover:text-rose-600 transition-all active:scale-90 border-none bg-transparent"><Trash2 size={20}/></button>
          </motion.div>
        ))}
     </div>

     <div className="p-8 md:p-10 bg-slate-50 dark:bg-slate-900 border-t border-white/5 space-y-8 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] mt-auto">
        <div className="space-y-4">
           <div className={cn("flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest", isRtl && "flex-row-reverse")}><span>Lattice Subtotal</span><span className="text-slate-900 dark:text-white">{totalAmount.toLocaleString()} DH</span></div>
           <div className={cn("flex justify-between items-end pt-6 border-t border-slate-200 dark:border-white/10", isRtl && "flex-row-reverse")}>
              <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
                 <span className="text-[8px] font-black uppercase text-indigo-500 tracking-[0.4em] mb-2 leading-none">Total Yield</span>
                 <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{totalAmount.toLocaleString()}</span>
              </div>
              <span className="text-lg font-black text-slate-400 mb-1 ml-3 uppercase">DH</span>
        </div>
        </div>
        <button onClick={onCheckout} disabled={cart.length === 0} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-indigo-500/30 hover:bg-slate-950 transition-all active:scale-95 disabled:opacity-30 group flex items-center justify-center gap-4 border-none">
           Initialize Deployment <ArrowUpRight size={20} className={cn("group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform", isRtl && "rotate-[-90deg]")} />
        </button>
     </div>
  </motion.aside>
);
