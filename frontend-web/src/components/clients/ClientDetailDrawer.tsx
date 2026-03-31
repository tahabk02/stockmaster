import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ShoppingCart, Zap, Mail, Phone, MapPin, CreditCard, FileText, Download, SquarePen, Database } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import api from "../../api/client";

interface ClientDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient: any;
  clientDetail: any;
  loadingDetail: boolean;
  isRtl: boolean;
  t: (key: string) => string;
  onEdit: (c: any) => void;
  onExport: () => void;
  canViewInvoices: boolean;
}

export const ClientDetailDrawer = ({ 
  isOpen, onClose, selectedClient, clientDetail, loadingDetail, 
  isRtl, t, onEdit, onExport, canViewInvoices 
}: ClientDetailDrawerProps) => (
  <AnimatePresence>
    {isOpen && selectedClient && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#020205]/90 backdrop-blur-xl z-[100]" onClick={onClose} />
        <motion.aside
          initial={{ x: isRtl ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRtl ? "-100%" : "100%" }}
          transition={{ type: "spring", damping: 35, stiffness: 300 }}
          className={cn("fixed top-0 h-full w-full max-w-2xl bg-white dark:bg-[#050508] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[101] flex flex-col", isRtl ? "left-0 border-r" : "right-0 border-l")}
        >
          {/* DRAWER_HEADER */}
          <div className="p-12 bg-slate-950 text-white flex justify-between items-center shrink-0 relative overflow-hidden border-b border-white/5">
             <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
             <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] -mr-48 -mt-48 pointer-events-none animate-pulse" />
             
             <div className="relative z-10 flex items-center gap-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-4xl font-black shadow-[0_0_40px_rgba(79,70,229,0.4)] rotate-3 border-2 border-white/20">
                   {selectedClient.name.charAt(0)}
                </div>
                <div>
                   <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-3">{selectedClient.name}</h2>
                   <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">IDENTITY_LOCKED</div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">NODE_ID: {selectedClient._id.slice(-12).toUpperCase()}</span>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="relative z-10 p-5 bg-white/5 text-slate-400 hover:bg-rose-600 hover:text-white rounded-[1.8rem] transition-all duration-500 border-none shadow-xl group">
                <X size={28} className="group-hover:rotate-90 transition-transform" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-16 relative">
             <div className="absolute inset-0 scanline opacity-[0.01] pointer-events-none" />
             
             {loadingDetail ? (
               <div className="flex flex-col items-center justify-center py-40 space-y-8">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(79,70,229,0.2)]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-500 animate-pulse italic">Accessing_Registry_Stream...</p>
               </div>
             ) : (
               <>
                 {/* KPI_GRID */}
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-inner group hover:border-indigo-500/30 transition-all">
                       <div className="flex items-center gap-3 mb-4 text-slate-500 group-hover:text-indigo-500 transition-colors">
                          <TrendingUp size={18} />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Total_Fiscal_Flow</span>
                       </div>
                       <p className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">
                          {(clientDetail?.stats?.totalSpent || 0).toLocaleString()} <span className="text-base not-italic text-slate-400 opacity-40 ml-2 tracking-widest uppercase">MAD</span>
                       </p>
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-inner group hover:border-emerald-500/30 transition-all">
                       <div className="flex items-center gap-3 mb-4 text-slate-500 group-hover:text-emerald-500 transition-colors">
                          <ShoppingCart size={18} />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Order_Commits</span>
                       </div>
                       <p className="text-4xl font-black italic tracking-tighter text-emerald-500 leading-none">
                          {clientDetail?.stats?.orderCount || 0} <span className="text-[10px] not-italic text-slate-400 opacity-40 ml-2 uppercase tracking-widest">Signals</span>
                       </p>
                    </div>
                 </div>

                 {/* SIGNAL_IDENTITY_PROTOCOL */}
                 <div className="space-y-8">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-4 italic">
                       <div className="w-10 h-[1px] bg-indigo-500" /> Identity_Provisioning
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                       {[
                         { icon: Mail, label: "COMM_CHANNEL", val: selectedClient.email || "NO_ENCRYPTED_MAIL" },
                         { icon: Phone, label: "SIGNAL_FREQ", val: selectedClient.phone || "NODE_UNREACHABLE" },
                         { icon: MapPin, label: "DEPLOY_ZONE", val: selectedClient.address || "GEO_LATTICE_UNKNOWN" }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 group hover:border-indigo-500/20 transition-all shadow-sm hover:shadow-xl">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-pro group-hover:rotate-6 transition-transform">
                               <item.icon size={22} className="text-indigo-500" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{item.label}</p>
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate italic">{item.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* RISK_TELEMETRY */}
                 <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[3rem] p-10 space-y-10 relative overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />
                    <div className="flex justify-between items-center relative z-10">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500 flex items-center gap-3 italic">
                          <CreditCard size={18}/> Credit_Threshold
                       </h4>
                       <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.3em] shadow-lg animate-pulse">LATTICE_VERIFIED</div>
                    </div>
                    <div className="space-y-6 relative z-10">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">Utilized_Credit</p>
                             <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">{(selectedClient.totalDebt || 0).toLocaleString()} <span className="text-[10px] not-italic">MAD</span></p>
                          </div>
                          <div className="text-right space-y-1">
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">Sovereign_Limit</p>
                             <p className="text-xl font-black text-indigo-500 italic tracking-tighter opacity-60">{(selectedClient.creditLimit || 0).toLocaleString()} <span className="text-[10px] not-italic">MAD</span></p>
                          </div>
                       </div>
                       <div className="h-3 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: `${Math.min((selectedClient.totalDebt / (selectedClient.creditLimit || 1)) * 100, 100)}%` }} 
                            transition={{ duration: 2, ease: "circOut" }}
                            className={cn(
                              "h-full relative",
                              (selectedClient.totalDebt / (selectedClient.creditLimit || 1)) > 0.8 ? "bg-rose-600 shadow-[0_0_20px_#f43f5e]" : "bg-indigo-600 shadow-[0_0_20px_#6366f1]"
                            )} 
                          >
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shine" />
                          </motion.div>
                       </div>
                    </div>
                 </div>

                 {/* TRANSACTION_REGISTRY */}
                 {canViewInvoices && (
                   <div className="space-y-8 pb-10">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-4 italic">
                         <div className="w-10 h-[1px] bg-rose-500" /> Signal_History_Logs
                      </h4>
                      <div className="space-y-4">
                         {clientDetail?.stats?.recentOrders?.length > 0 ? clientDetail.stats.recentOrders.map((inv: any, i: number) => (
                           <motion.div 
                             initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                             key={inv._id} 
                             className="p-6 bg-slate-50 dark:bg-white/[0.03] rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between group transition-all hover:border-indigo-500/30 shadow-sm hover:shadow-xl"
                           >
                              <div className="flex items-center gap-6">
                                 <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-pro group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <FileText size={20} className="text-indigo-500" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{inv.receiptNumber || "#RAW_HEX"}</p>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{new Date(inv.createdAt).toLocaleDateString()} // LOG_SYNCED</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-10">
                                 <div className="text-right">
                                    <p className="text-xl font-black text-indigo-600 italic tracking-tighter leading-none mb-1">{inv.totalPrice.toLocaleString()} <span className="text-[10px] not-italic opacity-40">MAD</span></p>
                                    <div className="flex items-center justify-end gap-2">
                                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                       <span className="text-[7px] font-black text-emerald-500 uppercase italic">ACTIVE_PAYLOAD</span>
                                    </div>
                                 </div>
                                 <button 
                                   onClick={async (e) => { e.stopPropagation(); const tid = toast.loading("Accessing_Vault_Data..."); try { const res = await api.get(`/orders/${inv._id}/invoice`, { responseType: 'blob' }); const url = window.URL.createObjectURL(new Blob([res.data])); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `Invoice-${inv.receiptNumber}.pdf`); document.body.appendChild(link); link.click(); toast.success("Signal_Exported", { id: tid }); } catch (err) { toast.error("Registry_Lock_Failure", { id: tid }); } }} 
                                   className="p-4 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white border-none active:scale-90"
                                 >
                                    <Download size={18} />
                                 </button>
                              </div>
                           </motion.div>
                         )) : <div className="py-20 text-center opacity-20 flex flex-col items-center gap-6"><Database size={48} className="text-slate-500" /> <p className="text-[10px] font-black uppercase tracking-[0.8em] italic">No_Historical_Signals_Found</p></div>}
                      </div>
                   </div>
                 )}
               </>
             )}
          </div>
          
          {/* DRAWER_FOOTER */}
          <div className="p-12 border-t border-white/10 bg-slate-950/50 flex gap-6 relative z-10">
             <button 
               onClick={() => onEdit(selectedClient)} 
               className="group relative flex-1 py-6 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-4xl hover:bg-indigo-600 hover:text-white transition-all duration-500 active:scale-95 border-none italic overflow-hidden"
             >
                <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center justify-center gap-4">Initialize_Modification <SquarePen size={18} /></span>
             </button>
             <button 
               onClick={onExport} 
               className="px-12 bg-white/5 border border-white/10 text-slate-500 py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95 italic flex items-center gap-4"
             >
                <Download size={18} /> Export_CSV
             </button>
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);
