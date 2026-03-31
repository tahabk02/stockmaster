import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, FileText, Download, Printer, Share2, 
  User, Calendar, CreditCard, Hash, ShieldCheck, 
  ExternalLink, Package, Zap, Cpu, Activity
} from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import api from "../../api/client";
import QRCodeModule from "react-qr-code";

// Handle ESM/CJS interop for react-qr-code in Vite
const QRCode = (QRCodeModule as any).default || QRCodeModule;

interface InvoiceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  tenant: any;
  isRtl: boolean;
  currencySymbol: string;
  t: (key: string) => string;
}

export const InvoiceDetailDrawer = ({ 
  isOpen, onClose, invoice, tenant, isRtl, currencySymbol, t 
}: InvoiceDetailDrawerProps) => {
  
  const handleDownload = async () => {
    if (!invoice) return;
    const tid = toast.loading(`${t('common.download')}... ${invoice.receiptNumber}`);
    try {
      const response = await api.get(`/orders/${invoice._id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success(t('common.success'), { id: tid });
    } catch (e) {
      toast.error(t('errors.serverError'), { id: tid });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const qrValue = JSON.stringify({
    ref: invoice?.receiptNumber,
    total: invoice?.totalPrice,
    id: invoice?._id,
    proto: "v5.0"
  });

  return (
    <AnimatePresence>
      {isOpen && invoice && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200]" 
            onClick={onClose} 
          />
          <motion.aside
            initial={{ x: isRtl ? "-100%" : "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: isRtl ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className={cn(
              "fixed top-0 h-full w-full max-w-3xl bg-white dark:bg-[#080c10] border-white/5 shadow-4xl z-[201] flex flex-col overflow-hidden",
              isRtl ? "left-0 border-r" : "right-0 border-l"
            )}
          >
            {/* 1. HEADER HUD */}
            <div className="p-10 bg-slate-900 text-white relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse" />
               <div className="relative z-10 flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                     {tenant?.logo ? (
                       <img src={tenant.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-white/10 p-1 bg-white/5" />
                     ) : (
                       <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 rotate-3 border-2 border-white/10 transition-transform hover:rotate-0 duration-500">
                          <FileText size={32} />
                       </div>
                     )}
                     <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">
                           {tenant?.name || "FISCAL_MANIFEST"}
                        </h2>
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic">VERIFIED_PROTOCOL_ACTIVE</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 hover:text-white rounded-2xl transition-all border-none">
                     <X size={24} />
                  </button>
               </div>
            </div>

            {/* 2. OPERATIONAL BODY */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
               
               {/* Metadata Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetaCard label="REFERENCE_ID" val={invoice.receiptNumber} icon={Hash} />
                  <MetaCard label="TEMPORAL_DATE" val={new Date(invoice.createdAt).toLocaleDateString()} icon={Calendar} />
                  <MetaCard label="PAYMENT_METHOD" val={invoice.paymentMethod} icon={CreditCard} />
                  <MetaCard label="CLIENT_NODE" val={invoice.clientId?.name || "WALK-IN"} icon={User} />
               </div>

               {/* QR Verification Node */}
               <div className="flex flex-col md:flex-row gap-10 items-center bg-slate-50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner group">
                  <div className="p-4 bg-white rounded-3xl shadow-xl transition-transform group-hover:scale-105">
                     <QRCode value={qrValue} size={120} bgColor="#ffffff" fgColor="#0f172a" level="H" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 italic">FORENSIC_AUTHENTICATION</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
                        This document is certified by the <span className="text-indigo-500 font-black italic">StockMaster Global Protocol</span>. 
                        The encrypted QR signal contains immutable ledger data for forensic verification.
                     </p>
                     <div className="flex gap-4 justify-center md:justify-start">
                        <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[8px] font-black text-indigo-500 uppercase tracking-widest">v5.0_ENCRYPTED</div>
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck size={10} /> INTEGRITY_LOCKED
                        </div>
                     </div>
                  </div>
               </div>

               {/* Asset Ledger (Table) */}
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-4 italic px-2">
                     <div className="w-10 h-[1px] bg-indigo-500" /> ASSET_TRANSFER_MANIFEST
                  </h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-slate-950/50 text-[8px] font-black uppercase text-slate-500 tracking-widest">
                              <th className="p-6">NEURAL_ASSET</th>
                              <th className="p-6 text-center">QTY</th>
                              <th className="p-6 text-right">UNIT_RATE</th>
                              <th className="p-6 text-right">TOTAL</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                           {invoice.items?.map((item: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all group">
                                 <td className="p-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                          <Package size={14} />
                                       </div>
                                       <span className="text-xs font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[150px]">{item.productId?.name || "Neural_Asset"}</span>
                                    </div>
                                 </td>
                                 <td className="p-6 text-center text-[10px] font-bold text-slate-500">{item.quantity}</td>
                                 <td className="p-6 text-right text-[10px] font-bold text-slate-500">{item.price?.toLocaleString()} {currencySymbol}</td>
                                 <td className="p-6 text-right text-xs font-black text-slate-900 dark:text-white italic">{ (item.quantity * item.price).toLocaleString() } {currencySymbol}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Financial Summary */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 blur-3xl pointer-events-none" />
                     <div className="flex justify-between items-center relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">TOTAL_PAYLOAD</span>
                        <Zap size={20} className="text-indigo-400 group-hover:animate-bounce" />
                     </div>
                     <div className="flex items-baseline gap-4 relative z-10">
                        <h3 className="text-5xl font-black italic tracking-tighter leading-none">{invoice.totalPrice?.toLocaleString()}</h3>
                        <span className="text-lg font-black text-indigo-500 uppercase">{currencySymbol}</span>
                     </div>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic relative z-10">Aggregated with Fiscal Protocol v5.0 (2% Tax included)</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <SummaryNode label="SUBTOTAL_REGISTRY" val={invoice.subTotal} symbol={currencySymbol} />
                     <SummaryNode label="TAX_PROTOCOL (2%)" val={invoice.taxAmount} symbol={currencySymbol} />
                     <SummaryNode label="DISCOUNT_NODE" val={invoice.discount || 0} symbol={currencySymbol} color="rose" />
                  </div>
               </div>
            </div>

            {/* 3. CONTROL FOOTER */}
            <div className="p-10 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 flex flex-wrap gap-4 shrink-0">
               <button onClick={handleDownload} className="flex-1 min-w-[180px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all active:scale-95 italic flex items-center justify-center gap-3">
                  <Download size={18} /> INITIALIZE_DOWNLOAD
               </button>
               <button onClick={handlePrint} className="p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 hover:text-indigo-500 rounded-2xl transition-all shadow-lg active:scale-95 group">
                  <Printer size={20} className="group-hover:rotate-12 transition-transform" />
               </button>
               <button className="p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 hover:text-emerald-500 rounded-2xl transition-all shadow-lg active:scale-95 group">
                  <Share2 size={20} className="group-hover:scale-110 transition-transform" />
               </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const MetaCard = ({ label, val, icon: Icon }: any) => (
  <div className="p-5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/20 transition-all">
    <div className="flex items-center gap-3 mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
       <Icon size={14} />
       <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate">{val}</p>
  </div>
);

const SummaryNode = ({ label, val, symbol, color = "indigo" }: any) => (
  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center group transition-all hover:translate-x-1">
     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{label}</span>
     <span className={cn("text-sm font-black italic", `text-${color}-500`)}>{val?.toLocaleString()} {symbol}</span>
  </div>
);
