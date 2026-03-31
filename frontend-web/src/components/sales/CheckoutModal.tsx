import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShieldCheck, Banknote, CreditCard, Landmark, Globe, Loader2, 
  MapPin, Truck, Drone, Zap, Terminal, Hash, Fingerprint, 
  ChevronRight, AlertTriangle, Compass, ShieldAlert, Cpu
} from "lucide-react";
import { cn } from "../../lib/utils";

interface CheckoutModalProps {
  isRtl: boolean;
  customers: any[];
  selectedCustomer: any;
  setSelectedCustomer: (c: any) => void;
  paymentMethod: string;
  setPaymentMethod: (m: any) => void;
  totalOrder: number;
  currencySymbol: string;
  cartLength: number;
  processing: boolean;
  onClose: () => void;
  onCheckout: (extraData?: any) => void;
  t: (key: string) => string;
}

export const CheckoutModal = ({ 
  isRtl, customers, selectedCustomer, setSelectedCustomer, 
  paymentMethod, setPaymentMethod, totalOrder, currencySymbol, 
  cartLength, processing, onClose, onCheckout, t 
}: CheckoutModalProps) => {
  const [deliveryMethod, setDeliveryMethod] = useState("FLEET");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [priority, setPriority] = useState("STANDARD");

  const handleCommit = () => {
    onCheckout({
      clientName: selectedCustomer ? selectedCustomer.name : clientName,
      clientPhone: selectedCustomer ? selectedCustomer.phone : clientPhone,
      clientAddress,
      deliveryMethod,
      priority
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020205]/98 backdrop-blur-2xl overflow-y-auto custom-scrollbar">
       <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
       
       <motion.div 
         initial={{ scale: 0.95, opacity: 0, y: 20 }} 
         animate={{ scale: 1, opacity: 1, y: 0 }} 
         exit={{ scale: 0.95, opacity: 0, y: 20 }} 
         className="bg-white dark:bg-[#050508] w-full max-w-6xl rounded-[3rem] shadow-[0_0_150px_rgba(79,70,229,0.15)] relative border border-white/10 my-auto overflow-hidden"
       >
          {/* HEADER : COMMAND CENTER STYLE */}
          <div className="bg-slate-950 p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
             <div className="relative z-10 flex items-center gap-8">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] rotate-3 border-2 border-white/20">
                   <ShieldCheck size={40} strokeWidth={2.5} />
                </div>
                <div>
                   <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">COMMIT <span className="text-indigo-500">PROTOCOL.</span></h2>
                   <div className="flex items-center gap-3 mt-3">
                      <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">TRX_ENGINE_v9.4</div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Lattice_Sync_Active</span>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-5 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-3xl transition-all duration-500 border-none shadow-xl group">
                <X size={24} className="group-hover:rotate-90 transition-transform" />
             </button>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
             
             {/* LEFT : CLIENT & LOGISTICS CONFIGURATION */}
             <div className="lg:col-span-7 space-y-10">
                
                {/* SECTION 1: IDENTITY PROVISIONING */}
                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-indigo-500 font-black text-[10px] tracking-[0.5em] uppercase italic">
                      <Fingerprint size={14} /> Identity_Provisioning
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target_Node_Select</label>
                         <select 
                           className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner appearance-none cursor-pointer" 
                           value={selectedCustomer?._id || ""} 
                           onChange={(e) => { const c = customers.find(cu => cu._id === e.target.value); setSelectedCustomer(c || null); }}
                         >
                            <option value="">Universal_Walk-in_Node</option>
                            {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Dynamic_Alias</label>
                         <input 
                           disabled={!!selectedCustomer}
                           placeholder="Enter_New_Node_Name..." 
                           className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner disabled:opacity-30 italic"
                           value={selectedCustomer ? selectedCustomer.name : clientName}
                           onChange={(e) => setClientName(e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Signal_Frequency (Phone)</label>
                      <input 
                        disabled={!!selectedCustomer}
                        placeholder="0x_SIGNAL_HASH..." 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner disabled:opacity-30"
                        value={selectedCustomer ? selectedCustomer.phone : clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                      />
                   </div>
                </div>

                {/* SECTION 2: GEOSPATIAL LOGISTICS */}
                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-emerald-500 font-black text-[10px] tracking-[0.5em] uppercase italic">
                      <Compass size={14} /> Geospatial_Logistics
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target_Coordinates (Address)</label>
                      <div className="relative group">
                         <MapPin className="absolute top-5 left-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                         <textarea 
                           placeholder="Deployment_Zone_ID..." 
                           className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-3xl p-5 pl-14 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner h-24 resize-none"
                           value={clientAddress}
                           onChange={(e) => setClientAddress(e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: "FLEET", label: "Fleet_OS", icon: Truck, color: "indigo" },
                        { id: "DRONE", label: "Drone_Drop", icon: Drone, color: "emerald" },
                        { id: "PICKUP", label: "Self_Sync", icon: Zap, color: "amber" },
                        { id: "EXPRESS", label: "Bolt_Tier", icon: Terminal, color: "rose" }
                      ].map(m => (
                        <button 
                          key={m.id} 
                          onClick={() => setDeliveryMethod(m.id)} 
                          className={cn(
                            "flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all duration-500 active:scale-90 shadow-xl border-none group",
                            deliveryMethod === m.id ? `bg-${m.color}-600 text-white shadow-${m.color}-500/30 scale-105` : "bg-slate-50 dark:bg-white/5 border-white/5 text-slate-500 hover:border-white/20"
                          )}
                        >
                           <m.icon size={20} className={cn("group-hover:rotate-12 transition-transform", deliveryMethod === m.id ? "text-white" : `text-${m.color}-500`)} />
                           <span className="text-[7px] font-black uppercase tracking-widest">{m.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* SECTION 3: PRIORITY OVERRIDE */}
                <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500 rounded-xl text-white shadow-lg"><ShieldAlert size={20} /></div>
                      <div>
                         <p className="text-[10px] font-black text-rose-500 uppercase italic leading-none">Deployment_Priority</p>
                         <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Impacts_Queue_Position</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      {["STANDARD", "HIGH", "CRITICAL"].map(p => (
                        <button 
                          key={p} 
                          onClick={() => setPriority(p)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                            priority === p ? "bg-rose-600 text-white shadow-lg" : "bg-white/5 text-slate-500 hover:text-rose-400"
                          )}
                        >
                           {p}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             {/* RIGHT : FISCAL SUMMARY & COMMIT */}
             <div className="lg:col-span-5">
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[3.5rem] border border-slate-100 dark:border-white/5 p-8 md:p-12 flex flex-col h-full shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none" />
                   
                   <div className="space-y-10 relative z-10 flex-1">
                      <div className="flex justify-between items-center border-b border-white/5 pb-8">
                         <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">FISCAL_VALUATION</h3>
                         <div className="px-4 py-1.5 bg-indigo-600/10 rounded-xl text-indigo-500 text-[8px] font-black uppercase tracking-[0.3em]">SECURE_GATE</div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic"><Hash size={12}/> Asset_Node_Count</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white italic group-hover:text-indigo-500 transition-colors">{cartLength}</span>
                         </div>
                         <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic"><Terminal size={12}/> Deployment_Ref</span>
                            <span className="text-[10px] font-mono font-black text-indigo-400">#TRX-{Date.now().toString().slice(-8)}</span>
                         </div>
                         <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic"><Cpu size={12}/> Protocol_Tax (2%)</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white italic">{(totalOrder * 0.02).toLocaleString()} <span className="text-[8px] opacity-40">MAD</span></span>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1 block">Payment_Protocol</label>
                         <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: "CASH", label: t('sales.cash'), icon: Banknote },
                              { id: "CARD", label: t('sales.card'), icon: CreditCard },
                              { id: "CHEQUE", label: "Endorsement", icon: Landmark },
                              { id: "TRANSFER", label: "Lattice_Wire", icon: Globe }
                            ].map(p => (
                              <button key={p.id} onClick={() => setPaymentMethod(p.id as any)} className={cn("flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all active:scale-95 shadow-lg border-none", paymentMethod === p.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-white/5 text-slate-500 hover:text-indigo-400")}>
                                 <p.icon size={16} />
                                 <span className="text-[8px] font-black uppercase tracking-widest">{p.label}</span>
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="pt-12 border-t border-white/5 mt-12 relative z-10">
                      <div className="flex flex-col items-center mb-10">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-3 italic">Total_Aggregated_Payload</span>
                         <p className="text-6xl md:text-7xl font-black text-indigo-500 italic tracking-tighter leading-none">{totalOrder.toLocaleString()} <span className="text-lg not-italic text-slate-400 opacity-40 ml-2 tracking-widest">{currencySymbol}</span></p>
                      </div>
                      
                      <button 
                        onClick={handleCommit} 
                        disabled={processing || (!selectedCustomer && !clientName)} 
                        className="w-full group relative py-8 bg-slate-950 dark:bg-white text-white dark:text-indigo-600 rounded-[2.5rem] font-black uppercase text-base tracking-[0.5em] shadow-[0_30px_100px_rgba(0,0,0,0.3)] hover:bg-emerald-500 hover:text-white transition-all duration-500 active:scale-95 flex items-center justify-center gap-6 overflow-hidden border-none"
                      >
                         <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                         {processing ? <Loader2 className="animate-spin relative z-10" /> : (
                           <>
                             <Zap size={28} fill="currentColor" className="relative z-10 group-hover:animate-bounce" /> 
                             <span className="relative z-10">EXECUTE_DEPLOYMENT</span>
                           </>
                         )}
                      </button>
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest text-center mt-6 italic opacity-40">By executing, you authorize secure forensic ledger entry v9.0</p>
                   </div>
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
};

