import React from "react";
import { motion } from "framer-motion";
import { X, PlusCircle, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

interface SupplierTransactionModalProps {
  form: any;
  setForm: (f: any) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const FormInput = ({ label, isRtl, ...props }: any) => (
  <div className="space-y-2">
     <label className={cn("text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 italic", isRtl && "text-right block mr-1")}>{label}</label>
     <input {...props} className={cn("w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm", isRtl && "text-right")} />
  </div>
);

export const SupplierTransactionModal = ({ form, setForm, isSubmitting, onClose, onSubmit, isRtl, t }: SupplierTransactionModalProps) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
    <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative my-auto border border-slate-100 dark:border-slate-800 transition-colors">
       <button onClick={onClose} className="absolute top-10 right-10 p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-90 border-none bg-transparent"><X size={24} /></button>
       <div className={cn("flex items-center gap-6 mb-12", isRtl && "flex-row-reverse")}>
          <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl rotate-3 shrink-0"><PlusCircle size={32} /></div>
          <h2 className={cn("text-4xl font-black italic uppercase tracking-tighter text-slate-950 dark:text-white", isRtl && "text-right")}>{t('common.create')} <span className="text-indigo-600">Event.</span></h2>
       </div>
       <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <FormInput label="Amount (MAD)" type="number" value={form.amount} onChange={(e:any)=>setForm({...form, amount: e.target.value})} required isRtl={isRtl} />
             <FormInput label="Reference ID" value={form.reference} onChange={(e:any)=>setForm({...form, reference: e.target.value})} required isRtl={isRtl} />
          </div>
          <div className="space-y-3">
             <label className={cn("text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic", isRtl && "text-right block mr-1")}>Event Nature</label>
             <div className={cn("grid grid-cols-2 gap-4", isRtl && "rtl")}>
                {['INVOICE', 'PAYMENT'].map(type => (
                  <button key={type} type="button" onClick={() => setForm({...form, type: type as any})} className={`py-5 rounded-2xl font-black text-xs tracking-widest transition-all border-none ${form.type === type ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:border-indigo-500/30'}`}>{type}</button>
                ))}
             </div>
          </div>
          <div className="pt-10">
            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] shadow-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-5 border-none">
               {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />} 
               Authorize Registry Entry
            </button>
          </div>
       </form>
    </motion.div>
  </div>
);
