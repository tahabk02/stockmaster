import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import { cn } from "../../lib/utils";

export const MatrixTerminal = ({ externalSignal }: { externalSignal?: string }) => {
  const [lines, setLogs] = useState<string[]>([]);
  const signals = [
    "NEURAL_LINK_ESTABLISHED",
    "DECODING_SKU_TRAJECTORY...",
    "ML_DEMAND_FORECAST_SYNCED",
    "ANOMALY_DETECTED_IN_CLUSTER_B",
    "OPTIMIZING_SUPPLY_CHAIN_LATENCY",
    "FETCHING_REALTIME_MARKET_SIGNALS",
    "ADJUSTING_STOCK_VELOCITY_PARAMS",
    "FORENSIC_SIGNATURE_VERIFIED"
  ];

  useEffect(() => {
    if (externalSignal) {
      setLogs(prev => [externalSignal, ...prev].slice(0, 10));
    }
  }, [externalSignal]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [signals[Math.floor(Math.random() * signals.length)], ...prev].slice(0, 10));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[1.8rem] p-6 font-mono h-full overflow-hidden relative shadow-2xl min-h-[220px] group">
       <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
       <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/5 shadow-[0_0_15px_#6366f1] animate-scan z-20" />
       
       <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3 relative z-10">
          <div className="flex items-center gap-2">
             <Terminal size={14} className="text-indigo-500" />
             <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Neural Stream</span>
          </div>
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
             <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75" />
          </div>
       </div>

       <div className="space-y-2 relative z-10">
          <AnimatePresence mode="popLayout">
            {lines.map((line, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1 - (i * 0.1), x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={i + line} 
                className="flex items-start gap-2"
              >
                 <span className="text-indigo-500/50 text-[8px] mt-1">{`>>`}</span>
                 <span className={cn(
                   "text-[8px] font-black tracking-widest leading-relaxed",
                   line === externalSignal ? "text-white bg-indigo-600/20 px-1 rounded" :
                   line.includes("ANOMALY") || line.includes("CRITICAL") ? "text-rose-500 animate-pulse" : 
                   line.includes("DETECTED") || line.includes("VERIFIED") ? "text-emerald-500" : "text-indigo-400"
                 )}>{line}</span>
              </motion.div>
            ))}
          </AnimatePresence>
       </div>
       
       <div className="absolute bottom-4 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
          <span className="text-[7px] text-indigo-300 font-bold uppercase tracking-[0.5em]">LATTICE_V5_STABLE</span>
       </div>
    </div>
  );
};
