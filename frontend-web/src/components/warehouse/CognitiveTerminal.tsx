import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface CognitiveTerminalProps {
  onClose: () => void;
}

export const CognitiveTerminal = ({ onClose }: CognitiveTerminalProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequences = [
      "INITIALIZING_NEURAL_LINK...",
      "SCANNING_FACILITY_LATTICE...",
      "INTERCEPTING_SECTOR_SIGNALS...",
      "ALLOCATING_BUFFER_MEMORY...",
      "SYNCING_ALPHA_NODE...",
      "VERIFYING_DEED_INTEGRITY...",
      "CALIBRATING_Z-AXIS_OFFSET...",
      "LATTICE_SYNCHRONIZATION_COMPLETE."
    ];

    let i = 0;
    const logInterval = setInterval(() => {
      if (i < sequences.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${sequences[i]}`]);
        setProgress(prev => prev + 12.5);
        i++;
      } else {
        clearInterval(logInterval);
        setTimeout(onClose, 1000);
        toast.success("Cognitive Sync Successful");
      }
    }, 600);

    return () => clearInterval(logInterval);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-4">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }} 
         className="bg-[#0b0c10] w-full max-w-2xl rounded-[2rem] border border-indigo-500/30 overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)]"
       >
          <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <TerminalIcon size={16} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Cognitive_Sync_Terminal</span>
             </div>
             <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
             </div>
          </div>
          <div className="p-8 space-y-6">
             <div className="h-48 overflow-y-auto custom-scrollbar space-y-2 font-mono">
                {logs.map((log, i) => (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="text-emerald-500/80 text-[10px] uppercase tracking-wider">
                    {log}
                  </motion.p>
                ))}
                <div className="w-2 h-4 bg-indigo-500 animate-pulse inline-block align-middle ml-2" />
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 italic">
                   <span>Recalibrating Lattice Nodes</span>
                   <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
};
