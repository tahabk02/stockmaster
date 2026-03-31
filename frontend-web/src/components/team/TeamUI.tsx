import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { Binary, Shield, Zap, Cpu, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PulseNode = ({ color = "indigo" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", 
      color === "indigo" ? "bg-indigo-400" : color === "emerald" ? "bg-emerald-400" : "bg-rose-400")}></span>
    <span className={cn("relative inline-flex rounded-full h-2 w-2", 
      color === "indigo" ? "bg-indigo-500" : color === "emerald" ? "bg-emerald-500" : "bg-rose-500")}></span>
  </span>
);

export const ForensicLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
    <Binary size={8} className="text-indigo-500" />
    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
  </div>
);

export const RefreshCcwIcon = ({ className, size, strokeWidth }: { className?: string; size?: number; strokeWidth?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || "2"} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
);

export const AgentClassBadge = ({ role, t }: { role: string; t: any }) => {
  const getTier = () => {
    switch (role) {
      case 'ADMIN': case 'SUPER_ADMIN': return { label: t('team.tiers.overlord'), color: 'rose', icon: <Shield size={10} /> };
      case 'MANAGER': case 'VENDOR': return { label: t('team.tiers.orchestrator'), color: 'indigo', icon: <Cpu size={10} /> };
      default: return { label: t('team.tiers.operative'), color: 'emerald', icon: <Zap size={10} /> };
    }
  };
  const tier = getTier();
  return (
    <div className={cn(
      "px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm",
      `bg-${tier.color}-500/10 text-${tier.color}-500 border-${tier.color}-500/20`
    )}>
      {tier.icon} {tier.label}
    </div>
  );
};

export const LatticeIntegrityHUD = ({ agentCount, t }: { agentCount: number; t: any }) => {
  const integrity = 94 + (agentCount % 6);
  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-8 shadow-inner group">
       <div className="relative">
          <svg className="w-16 h-16 transform -rotate-90">
             <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
             <motion.circle 
               initial={{ strokeDashoffset: 176 }}
               animate={{ strokeDashoffset: 176 - (176 * integrity) / 100 }}
               transition={{ duration: 2, ease: "easeOut" }}
               cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="176" className="text-indigo-500" 
             />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-black italic text-xs text-white">{integrity}%</div>
       </div>
       <div className="space-y-1">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('team.hud.stability')}</p>
          <p className="text-lg font-black text-indigo-400 italic leading-none">SIGNAL_PRIME</p>
          <div className="flex gap-1">
             {[1,2,3,4].map(i => <div key={i} className="w-3 h-1 bg-emerald-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i*200}ms` }} />)}
          </div>
       </div>
    </div>
  );
};

export const SignalTicker = () => {
  const [signals, setSignals] = useState<string[]>(["INIT_SEQ", "SYNC_OK", "NODE_LOCKED"]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const ops = ["BUFF_SYNC", "AUTH_VER", "LATTICE_OK", "ENCR_ACTIVE", "NODE_SCAN"];
      setSignals(prev => [ops[Math.floor(Math.random() * ops.length)], ...prev.slice(0, 2)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 overflow-hidden h-4 select-none">
      <AnimatePresence mode="popLayout">
        {signals.map((s, i) => (
          <motion.div
            key={`${s}-${i}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="flex items-center gap-2 shrink-0"
          >
            <Activity size={8} className="text-indigo-500" />
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic">{s}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
