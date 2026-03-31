import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Plus, Binary } from "lucide-react";
import { PulseNode } from "../team/TeamUI";

interface ContractHeaderProps {
  totalContracts: number;
  totalValue: number;
  onAdd: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

export const ContractHeader = ({ totalContracts, totalValue, onAdd, isRtl, t }: ContractHeaderProps) => (
  <header className="relative group">
     <div className="absolute inset-0 bg-indigo-600/20 rounded-[2.5rem] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
     <div className="bg-slate-950 dark:bg-black/40 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-3xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
        <div className="scanline" />
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Binary size={200} strokeWidth={0.5} /></div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
           <motion.div whileHover={{ rotate: 90, scale: 1.1 }} className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-2xl flex items-center justify-center text-white shrink-0"><ShieldCheck size={40} strokeWidth={1.5} /></motion.div>
           <div className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2"><PulseNode color="indigo" /><span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Global Legal Ledger</span></div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">{t('contracts.title')} <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8 decoration-4">Registry.</span></h1>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.6em] mt-4 opacity-60 max-w-md leading-relaxed">Automated compliance synchronization engine.</p>
           </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 shrink-0 relative z-10">
           <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-10 shadow-2xl group/stats hover:bg-white/10 transition-colors">
              <div className="text-center">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stats:text-indigo-400 transition-colors">Active</p>
                 <p className="text-3xl font-black text-white italic leading-none flex items-baseline gap-1">{totalContracts} <span className="text-[10px] not-italic opacity-30 uppercase">SIG</span></p>
              </div>
              <div className="w-px h-12 bg-white/10 group-hover/stats:h-16 transition-all" />
              <div className="text-center">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stats:text-emerald-400 transition-colors">Value</p>
                 <p className="text-3xl font-black text-emerald-400 italic leading-none flex items-baseline gap-1">{totalValue.toLocaleString()} <span className="text-[10px] not-italic opacity-40 uppercase text-white">DH</span></p>
              </div>
           </div>
           <button onClick={onAdd} className="bg-white text-black px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl group border-none active:scale-95"><div className="bg-black text-white p-1 rounded-lg group-hover:bg-white group-hover:text-indigo-600 transition-colors"><Plus size={16} strokeWidth={3} /></div>{t('contracts.add')}</button>
        </div>
     </div>
  </header>
);
