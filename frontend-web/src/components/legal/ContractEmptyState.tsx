import React from "react";
import { motion } from "framer-motion";
import { Database } from "lucide-react";

export const ContractEmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="py-32 bg-slate-950/10 dark:bg-slate-900/20 backdrop-blur-sm rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center relative overflow-hidden group"
  >
    <div className="absolute inset-0 grid-pattern opacity-[0.03]" />
    <div className="relative z-10 flex flex-col items-center text-center px-6">
      <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-10 relative">
        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin opacity-20" />
        <Database size={48} className="text-slate-400 group-hover:text-indigo-500 transition-all duration-700" />
      </div>
      <h3 className="text-lg font-black uppercase italic tracking-[0.4em] text-slate-400 mb-2">
        Registry Offline
      </h3>
      <p className="text-[8px] font-bold uppercase tracking-[0.6em] text-slate-500 opacity-60 max-w-[300px]">
        No legal deeds detected in the current lattice buffer.
      </p>
    </div>
  </motion.div>
);
