import React from "react";
import { Loader2 } from "lucide-react";

export const ContractLoadingState = () => (
  <div className="py-32 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border border-white/5 relative overflow-hidden">
    <div className="absolute inset-0 grid-pattern opacity-5" />
    <Loader2 size={60} className="animate-spin text-indigo-500 opacity-50 mb-6" />
    <p className="text-[11px] font-black uppercase tracking-[0.8em] text-indigo-500 animate-pulse italic">
      Syncing Ledger...
    </p>
  </div>
);
