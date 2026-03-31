import React from "react";
import { motion } from "framer-motion";
import { X, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface SupplierFormModalProps {
  form: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

export const SupplierFormModal = ({ form, handleFormChange, isSubmitting, onClose, onSubmit, isRtl, t }: SupplierFormModalProps) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
     <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#0b141a] w-full max-w-3xl rounded-[3rem] p-10 md:p-16 shadow-2xl relative my-auto border border-white/5 overflow-hidden">
        <button onClick={onClose} className="absolute top-10 right-10 p-4 text-slate-400 hover:text-rose-500 transition-all border-none bg-transparent active:scale-90"><X size={24}/></button>
        
        <div className="flex items-center gap-6 mb-16">
           <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl rotate-3"><Truck size={36} /></div>
           <div>
              <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Provision <span className="text-indigo-600">Node.</span></h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">New Supplier Protocol Initiation</p>
           </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 block">{t('products.fields.name')}</label>
                 <input required name="name" value={form.name} onChange={handleFormChange} placeholder="Entity Identifier..." className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-6 font-bold text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase" />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 block">Signal Phone</label>
                 <input required name="phone" value={form.phone} onChange={handleFormChange} placeholder="+212..." className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-6 font-bold text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 block">Neural Email</label>
              <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="node@registry.net" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-6 font-bold text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase italic" />
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 block">Geo-Location Descriptor</label>
              <textarea name="address" value={form.address} onChange={handleFormChange} placeholder="Full Node Address..." className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-3xl p-6 font-bold text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner min-h-[120px] resize-none uppercase italic" />
           </div>

           <button type="submit" disabled={isSubmitting} className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] shadow-4xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-5 group border-none">
              {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : <><ShieldCheck size={28} className="group-hover:rotate-12 transition-transform" /> Commit to Lattice</>}
           </button>
        </form>
     </motion.div>
  </div>
);
