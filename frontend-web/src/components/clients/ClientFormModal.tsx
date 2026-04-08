import React from "react";
import { motion } from "framer-motion";
import { X, UserPlus, ShieldCheck, Loader2, Fingerprint, Terminal, Hash, MapPin, Phone, Mail, Cpu, Radio, Compass, BarChart3 } from "lucide-react";
import { cn } from "../../lib/utils";

interface ClientFormModalProps {
  editingId: string | null;
  form: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
  isRtl: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export const ClientFormModal = ({ 
  editingId, form, handleFormChange, isSubmitting, isRtl, onClose, onSubmit, t 
}: ClientFormModalProps) => (
  <div 
    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020205]/98 backdrop-blur-2xl overflow-y-auto custom-scrollbar"
    role="dialog"
    aria-modal="true"
    aria-labelledby="client-modal-title"
  >
    <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
    
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 30 }} 
      animate={{ scale: 1, opacity: 1, y: 0 }} 
      exit={{ scale: 0.95, opacity: 0, y: 30 }} 
      className="bg-white dark:bg-[#050508] w-full max-w-5xl rounded-[3.5rem] shadow-[0_0_150px_rgba(79,70,229,0.1)] relative my-auto border border-white/10 overflow-hidden"
    >
      {/* Accessibility Title (Visually Hidden) */}
      <h2 id="client-modal-title" className="sr-only">
        {editingId ? "Update Client Node" : "Provision New Client Node"}
      </h2>
      {/* HEADER : PROVISIONING CENTER */}
      <div className="bg-slate-950 p-10 md:p-14 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
         <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] rotate-3 border-2 border-white/20">
               <UserPlus size={40} strokeWidth={2.5} />
            </div>
            <div>
               <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {editingId ? "UPDATE" : "PROVISION"} <span className="text-indigo-500">NODE.</span>
               </h2>
               <div className="flex items-center gap-3 mt-3">
                  <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">REGISTRY_INIT_v9.4</div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Lattice_Ready</span>
               </div>
            </div>
         </div>
         <button onClick={onClose} className="p-5 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-[1.8rem] transition-all duration-500 border-none shadow-xl group">
            <X size={28} className="group-hover:rotate-90 transition-transform" />
         </button>
      </div>

      <form onSubmit={onSubmit} className="p-10 md:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* SECTION 1: CORE_IDENTITY */}
          <div className="space-y-8 md:col-span-2">
             <div className="flex items-center gap-4 text-indigo-500 font-black text-[11px] tracking-[0.5em] uppercase italic">
                <Fingerprint size={16} /> Identity_Lattice_Config
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                      <Terminal size={10} /> Node_Alias_Name
                   </label>
                   <input required name="name" value={form.name} onChange={handleFormChange} placeholder="Enter_Unique_Identifier..." className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner italic" />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                     <Cpu size={10} /> Entity_Architecture
                  </label>
                  <select name="type" value={form.type} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner uppercase text-xs appearance-none cursor-pointer italic">
                    <option value="INDIVIDUAL">ORGANIC_INDIVIDUAL</option>
                    <option value="COMPANY">INSTITUTIONAL_HUB</option>
                  </select>
                </div>
             </div>
          </div>

          {/* SECTION 2: SIGNAL_CHANNELS */}
          <div className="space-y-8">
             <div className="flex items-center gap-4 text-indigo-500 font-black text-[11px] tracking-[0.5em] uppercase italic">
                <Radio size={16} /> Signal_Registry
             </div>
             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                      <Phone size={10} /> Comms_Frequency
                   </label>
                   <input required name="phone" value={form.phone} onChange={handleFormChange} placeholder="+212_SIGNAL..." className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner font-mono" />
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                      <Mail size={10} /> Encrypted_Mail_Node
                   </label>
                   <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="node@registry.com" className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner italic" />
                </div>
             </div>
          </div>

          {/* SECTION 3: GEOSPATIAL_DATA */}
          <div className="space-y-8">
             <div className="flex items-center gap-4 text-emerald-500 font-black text-[11px] tracking-[0.5em] uppercase italic">
                <Compass size={16} /> Geospatial_Lattice
             </div>
             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                      <MapPin size={10} /> Target_Coordinates
                   </label>
                   <textarea name="address" value={form.address} onChange={handleFormChange} placeholder="Sector_ID, Cluster_Name..." className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-[2rem] p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner h-[148px] resize-none italic" />
                </div>
             </div>
          </div>

          {/* SECTION 4: FISCAL_POLICIES */}
          <div className="md:col-span-2 space-y-8 pt-4">
             <div className="flex items-center gap-4 text-amber-500 font-black text-[11px] tracking-[0.5em] uppercase italic">
                <BarChart3 size={16} /> Fiscal_Architecture
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                      <Hash size={10} /> Forensic_Tax_ID (ICE)
                   </label>
                   <input name="taxId" value={form.taxId} onChange={handleFormChange} placeholder="0x_ICE_REFERENCE..." className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10 transition-all shadow-inner font-mono" />
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                      <Hash size={10} /> Sovereign_Credit_Limit
                   </label>
                   <div className="relative">
                      <input type="number" name="creditLimit" value={form.creditLimit} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl p-5 pr-16 text-xl font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner italic" />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">MAD</span>
                   </div>
                </div>
             </div>
          </div>

          {/* COMMIT_ACTION */}
          <div className="md:col-span-2 pt-12 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full group relative py-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2.5rem] font-black uppercase text-base tracking-[0.6em] shadow-[0_30px_100px_rgba(0,0,0,0.3)] hover:bg-emerald-500 hover:text-white transition-all duration-500 active:scale-95 border-none italic overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10 flex items-center justify-center gap-6">
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  <>
                    <ShieldCheck size={36} className="group-hover:rotate-12 transition-transform duration-500" /> 
                    <span>COMMIT_REGISTRY_SIGNAL</span>
                  </>
                )}
              </div>
            </button>
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest text-center mt-8 italic opacity-40">By committing, you authorize secure forensic node provisioning v9.0</p>
          </div>
        </div>
      </form>
    </motion.div>
  </div>
);