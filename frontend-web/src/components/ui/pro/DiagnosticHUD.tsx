import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Hash, Globe, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';

const HUDMetric = ({ label, value, color = "indigo" }: any) => {
  const [percent, setPercent] = useState(50);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(Math.floor(Math.random() * 40) + 40);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center w-32">
        <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={cn("text-[7px] font-black italic", `text-${color}-500`)}>{value}</span>
      </div>
      <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", `bg-${color}-500`)} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const DiagnosticHUD = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const protocols = ["LATTICE_SYNC", "NEURAL_LINK", "NODE_ACTIVE", "ENCRYPT_0xAF", "FLOW_ZENITH", "AUDIT_OK"];
    const interval = setInterval(() => {
      const log = `${protocols[Math.floor(Math.random() * protocols.length)]} :: ${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
      setLogs(prev => [log, ...prev].slice(0, 4)); // Reduced count
      setTime(new Date());
    }, 5000); // Increased interval to 5s to reduce re-renders
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[180] overflow-hidden select-none">
      <div className="absolute top-24 left-8 space-y-6 hidden xl:block">
        <div className="p-5 bg-white/5 dark:bg-slate-950/40 backdrop-blur-2xl border-l-2 border-indigo-500 rounded-r-xl space-y-5 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-2">
             <ShieldAlert size={12} className="text-indigo-500" />
             <span className="text-[8px] font-black text-white/60 tracking-widest uppercase italic">Diagnostic_Lattice</span>
          </div>
          <HUDMetric label="SYSTEM_LOAD" value="44.2%" />
          <HUDMetric label="NEURAL_FLUX" value="0.002ms" color="emerald" />
          <HUDMetric label="PACKET_ZENITH" value="99.9%" color="cyan" />
        </div>
        
        <div className="space-y-2 pl-2">
          {logs.map((log, i) => (
            <div key={log + i} className="text-[7px] font-black text-indigo-400/50 uppercase italic flex items-center gap-3">
              <TerminalIcon size={8} className="opacity-50" /> {log}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-24 right-8 hidden xl:block text-right">
         <div className="p-5 bg-white/5 dark:bg-slate-950/40 backdrop-blur-2xl border-r-2 border-rose-500 rounded-l-xl space-y-5 shadow-2xl">
            <div className="space-y-2">
               <p className="text-[6px] font-black text-slate-500 uppercase tracking-[0.4em]">Node_Identity</p>
               <p className="text-[10px] font-black text-slate-950 dark:text-white italic tracking-tighter">AXIS_ZENITH_0x82A</p>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="space-y-2">
               <p className="text-[6px] font-black text-slate-500 uppercase tracking-[0.4em]">Internal_Clock</p>
               <div className="flex items-center justify-end gap-3 text-rose-500">
                  <Clock size={10} />
                  <span className="text-[10px] font-black italic">{time.toLocaleTimeString()}</span>
               </div>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="space-y-2">
               <p className="text-[6px] font-black text-slate-500 uppercase tracking-[0.4em]">Encryption</p>
               <div className="flex items-center justify-end gap-2">
                  <span className="text-[8px] font-black text-emerald-500 uppercase italic">Active_Lattice</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
               </div>
            </div>
         </div>
      </div>

      <div className="absolute bottom-10 left-10 hidden xl:flex flex-col gap-1 opacity-20">
         <div className="flex items-center gap-2">
            <Hash size={10} className="text-white" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest italic">LOC_COORD: 48.8566 // 2.3522</span>
         </div>
         <span className="text-[6px] font-black text-slate-500 pl-4">AXIS_STABILITY_ZENITH_v16</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
         <div className="w-[80vw] h-[80vh] border border-white/20 rounded-[4rem] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-4 py-1 border border-white/20 text-[8px] font-black uppercase italic tracking-[1em]">Axis_Viewport</div>
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-indigo-500" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-indigo-500" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-indigo-500" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-indigo-500" />
         </div>
      </div>

      <div className="absolute inset-0 scanline pointer-events-none opacity-[0.03] dark:opacity-[0.08]" />
    </div>
  );
};
