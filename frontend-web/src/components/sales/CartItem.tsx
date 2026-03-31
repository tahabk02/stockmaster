import React from "react";
import { motion } from "framer-motion";
import { Package, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface CartItemProps {
  item: any;
  idx: number;
  isRtl: boolean;
  currencySymbol: string;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onAddToCart: (p: any) => void;
}

export const CartItem = ({ item, idx, isRtl, currencySymbol, onUpdateQty, onRemove, onAddToCart }: CartItemProps) => (
  <motion.div 
    initial={{ opacity: 0, x: isRtl ? -20 : 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    transition={{ delay: idx * 0.05 }} 
    className={cn("p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 group transition-all hover:border-indigo-500/30", isRtl && "flex-row-reverse")}
  >
     <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-100 dark:border-white/10">
        {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <Package size={18} className="m-auto mt-3 text-slate-200" />}
     </div>
     <div className={cn("flex-1 min-w-0", isRtl && "text-right")}>
        <p className="text-[10px] font-black text-slate-950 dark:text-white uppercase truncate italic leading-tight">{item.name}</p>
        <p className="text-xs font-black text-indigo-600 italic tracking-tighter">{(item.price * item.cartQty).toLocaleString()} <span className="text-[8px] not-italic text-slate-400 uppercase">{currencySymbol}</span></p>
     </div>
     <div className={cn("flex items-center gap-2 bg-white dark:bg-slate-950 p-1.5 rounded-xl shadow-inner border border-slate-100 dark:border-white/5", isRtl && "flex-row-reverse")}>
        <button onClick={() => onUpdateQty(item._id, Math.max(1, item.cartQty - 1))} className="p-1 text-slate-400 hover:text-rose-500 border-none bg-transparent transition-colors"><Minus size={12}/></button>
        <span className="text-[11px] font-black w-5 text-center text-slate-900 dark:text-white">{item.cartQty}</span>
        <button onClick={() => onAddToCart(item)} className="p-1 text-slate-400 hover:text-indigo-600 border-none bg-transparent transition-colors"><Plus size={12}/></button>
     </div>
     <button onClick={() => onRemove(item._id)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-600 transition-all active:scale-90 border-none bg-transparent"><Trash2 size={16}/></button>
  </motion.div>
);
