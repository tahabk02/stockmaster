import React from "react";
import { motion } from "framer-motion";
import { X, History, Wallet, Package } from "lucide-react";
import { cn } from "../../lib/utils";

interface OrderDetailModalProps {
  order: any;
  isRtl: boolean;
  currencySymbol: string;
  onClose: () => void;
  t: (key: string) => string;
}

export const OrderDetailModal = ({ order, isRtl, currencySymbol, onClose, t }: OrderDetailModalProps) => (
  <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
     <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#111b21] w-full max-w-3xl rounded-[3rem] p-10 md:p-14 shadow-2xl relative border border-white/5 overflow-hidden my-auto">
        <button onClick={onClose} className="absolute top-10 right-10 p-3 bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-2xl transition-all border-none bg-transparent shadow-sm"><X size={20} /></button>
        
        <div className="flex items-center gap-6 mb-12">
           <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl"><History size={32} /></div>
           <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">{t('sales.history')} <span className="text-indigo-600">{t('common.info')}.</span></h2>
              <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Node ID: #ODR-{order._id.toUpperCase()}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-white/5">
           <div className="space-y-4">
              <div>
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1 block">Creation Timestamp</span>
                 <p className="text-xs font-bold text-slate-950 dark:text-white uppercase">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1 block">Payment Protocol</span>
                 <div className="flex items-center gap-2 text-slate-950 dark:text-white">
                    <Wallet size={14} className="text-indigo-400" />
                    <span className="text-xs font-black uppercase">{order.paymentMethod}</span>
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <div>
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1 block">Target Client Node</span>
                 <p className="text-xs font-black text-slate-950 dark:text-white uppercase italic">{order.clientId?.name || "Anonymous / Walk-in"}</p>
              </div>
              <div>
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1 block">Protocol Status</span>
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">{order.status}</span>
              </div>
           </div>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-10">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic">Manifest Items ({order.items?.length || 0})</h4>
           {order.items?.map((item: any, i: number) => (
             <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-white/5">
                      <Package size={18} className="text-slate-500" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[200px]">{item.productId?.name || "Removed Asset"}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.quantity} Units x {item.price?.toLocaleString()} {currencySymbol}</p>
                   </div>
                </div>
                <p className="text-sm font-black text-indigo-400 italic">{(item.quantity * item.price).toLocaleString()} {currencySymbol}</p>
             </div>
           ))}
        </div>

        <div className="bg-indigo-600/10 p-8 rounded-[2rem] border border-indigo-500/20 flex justify-between items-center">
           <div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] block mb-1">Final Aggregated Payload</span>
              <span className="text-xs font-black text-slate-400 uppercase">Includes Operational Taxes (2%)</span>
           </div>
           <div className="text-right">
              <span className="text-4xl font-black text-indigo-500 italic tracking-tighter">{order.totalPrice?.toLocaleString()}</span>
              <span className="text-xs font-black text-slate-400 ml-2 uppercase">{currencySymbol}</span>
           </div>
        </div>
     </motion.div>
  </div>
);
