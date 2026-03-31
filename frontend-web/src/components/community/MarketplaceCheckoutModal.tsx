import React from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, Zap, Truck, CreditCard, UserPlus, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface MarketplaceCheckoutModalProps {
  isRtl: boolean;
  store: any;
  cart: any[];
  totalAmount: number;
  customerInfo: any;
  setCustomerInfo: (info: any) => void;
  processing: boolean;
  onClose: () => void;
  onCheckout: (e: React.FormEvent) => void;
}

export const MarketplaceCheckoutModal = ({ 
  isRtl, store, cart, totalAmount, customerInfo, setCustomerInfo, 
  processing, onClose, onCheckout 
}: MarketplaceCheckoutModalProps) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl overflow-y-auto">
     <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0b141a] w-full max-w-5xl rounded-[3rem] md:rounded-[4rem] shadow-[0_0_150px_rgba(99,102,241,0.2)] relative my-auto border border-white/5 overflow-hidden">
        <button onClick={onClose} className={cn("absolute top-8 right-8 p-4 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl transition-all shadow-2xl z-20 active:scale-90 border-none bg-transparent", isRtl && "left-8 right-auto")}><X size={24} /></button>
        
        <div className="flex flex-col lg:flex-row h-full">
           <div className="lg:w-2/5 bg-indigo-600 p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={200} /></div>
              <div className="relative z-10 space-y-8 md:space-y-10">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-xl shadow-2xl border border-white/20"><Truck size={36} /></div>
                    <div>
                       <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Order <br /><span className="text-slate-900">Deployment.</span></h2>
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] mt-3 opacity-60">Logistics Node Protocol</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-200">Manifest Summary</p>
                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-4 custom-scrollbar">
                       {cart.map(item => (
                         <div key={item._id} className="flex justify-between items-center py-3 border-b border-white/10">
                            <p className="text-xs font-black uppercase italic">{item.name} <span className="opacity-60 not-italic ml-2">x{item.qty}</span></p>
                            <p className="text-sm font-black italic">{(item.price * item.qty).toLocaleString()} DH</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="relative z-10 pt-10 border-t border-white/10 mt-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-200 mb-3">Aggregate Payload</p>
                 <p className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none">{totalAmount.toLocaleString()} <span className="text-lg not-italic opacity-40 uppercase">DH</span></p>
                 <div className="mt-8 flex items-center gap-3 px-5 py-3 bg-white/10 rounded-2xl border border-white/10 w-fit">
                    <CreditCard size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cash on Delivery</span>
                 </div>
              </div>
           </div>

           <div className="lg:w-3/5 p-10 md:p-16">
              <form onSubmit={onCheckout} className="space-y-8 md:space-y-10">
                 <h3 className={cn("text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter border-b border-slate-100 dark:border-white/5 pb-6", isRtl && "text-right")}>Recipient Intelligence</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-3">
                       <label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] ml-1 block", isRtl && "text-right")}>Full Name</label>
                       <div className="relative group">
                          <UserPlus className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors", isRtl ? "right-6" : "left-6")} size={20} />
                          <input required placeholder="IDENTITY NAME" className={cn("w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl md:rounded-3xl py-5 md:py-6 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl ? "pr-16 pl-6 text-right" : "pl-16 pr-6")} value={customerInfo.fullName} onChange={(e)=>setCustomerInfo({...customerInfo, fullName: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] ml-1 block", isRtl && "text-right")}>Secure Signal</label>
                       <div className="relative group">
                          <Phone className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors", isRtl ? "right-6" : "left-6")} size={20} />
                          <input required type="tel" placeholder="+212 XXX-XXXXXX" className={cn("w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl md:rounded-3xl py-5 md:py-6 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl ? "pr-16 pl-6 text-right" : "pl-16 pr-6")} value={customerInfo.phone} onChange={(e)=>setCustomerInfo({...customerInfo, phone: e.target.value})} />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div className="md:col-span-1 space-y-3">
                       <label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] ml-1 block", isRtl && "text-right")}>Node City</label>
                       <input required placeholder="CITY" className={cn("w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl md:rounded-3xl py-5 md:py-6 px-8 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={customerInfo.city} onChange={(e)=>setCustomerInfo({...customerInfo, city: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                       <label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] ml-1 block", isRtl && "text-right")}>Routing Address</label>
                       <div className="relative group">
                          <MapPin className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors", isRtl ? "right-6" : "left-6")} size={20} />
                          <input required placeholder="STREET, BUILDING..." className={cn("w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl md:rounded-3xl py-5 md:py-6 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl ? "pr-16 pl-6 text-right" : "pl-16 pr-6")} value={customerInfo.address} onChange={(e)=>setCustomerInfo({...customerInfo, address: e.target.value})} />
                       </div>
                    </div>
                 </div>

                 <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white py-6 md:py-7 rounded-[2rem] md:rounded-[3rem] font-black uppercase text-xs md:text-sm tracking-[0.5em] shadow-3xl shadow-indigo-500/30 hover:bg-slate-950 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-5 group border-none">
                    {processing ? <Loader2 className="animate-spin" size={28} /> : <><Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" /> Commit Order Protocol</>}
                 </button>
              </form>
           </div>
        </div>
     </motion.div>
  </div>
);
