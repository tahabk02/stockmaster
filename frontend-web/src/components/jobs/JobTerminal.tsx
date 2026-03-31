import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Activity, Cpu, Fingerprint, Search, ShieldCheck, Lock } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

interface JobTerminalProps {
  job: any;
  onClose: () => void;
  isRtl: boolean;
}

export const JobTerminal = ({ job, onClose, isRtl }: JobTerminalProps) => {
  const { t } = useTranslation();
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [scanOffset, setScanOffset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsDecrypting(false), 1200);
    const interval = setInterval(() => setScanOffset(prev => (prev + 1) % 100), 50);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 z-[200] w-full max-w-3xl bg-[#020617] text-white shadow-[0_0_100px_rgba(0,0,0,0.8)] border-l border-white/10 flex flex-col overflow-hidden"
    >
       <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
       <div className="scanline opacity-40" />
       <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20 shadow-[0_0_20px_#6366f1] z-50 pointer-events-none" style={{ top: `${scanOffset}%` }} />

       <div className={cn("p-10 border-b border-white/5 flex justify-between items-center relative z-10 bg-slate-900/40 backdrop-blur-3xl", isRtl && "flex-row-reverse")}>
          <div className="flex items-center gap-6">
             <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-[0_0_30px_rgba(79,70,229,0.5)] rotate-3"><Search size={24} className="animate-pulse" /></div>
             <div>
                <h3 className="text-xl font-black uppercase tracking-[0.4em] italic leading-none">{t('jobs.terminal.title')}</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{t('jobs.terminal.interceptionId')}: {job._id.toUpperCase()}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-2xl transition-all border-none bg-transparent active:scale-90 shadow-2xl"><X size={24}/></button>
       </div>

       <div className="flex-1 overflow-y-auto p-12 font-mono text-[12px] space-y-10 custom-scrollbar relative z-10 bg-black/20">
          <AnimatePresence>
             {isDecrypting ? (
               <motion.div exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                     <Lock size={64} className="text-indigo-500 animate-pulse" />
                     <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">{t('jobs.terminal.decrypting')}</p>
               </motion.div>
             ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-center gap-5">
                        <Cpu size={28} className="text-indigo-400 animate-spin-slow" />
                        <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t('jobs.terminal.targetCluster')}</p><p className="font-black text-indigo-400 uppercase italic">ZENITH_v9.4</p></div>
                     </div>
                     <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-center gap-5">
                        <Fingerprint size={28} className="text-emerald-400" />
                        <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t('jobs.terminal.authSignature')}</p><p className="font-black text-emerald-400 uppercase italic">{t('jobs.terminal.verifiedAgent')}</p></div>
                     </div>
                  </div>

                  <div className="space-y-5">
                     <div className="flex items-center gap-3 text-slate-600 border-b border-white/5 pb-4 mb-8">
                        <Terminal size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('jobs.terminal.logicStream')}</span>
                     </div>
                     {job.logs?.length > 0 ? job.logs.map((log: any, i: number) => (
                       <div key={i} className="flex gap-6 group hover:bg-white/5 p-2 rounded-lg transition-colors">
                          <span className="text-slate-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <div className="flex flex-col gap-1">
                             <span className={cn(
                               "font-bold uppercase tracking-tight",
                               log.level === 'ERROR' ? 'text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-slate-300'
                             )}>
                                {log.level === 'ERROR' ? `>> ${t('jobs.terminal.criticalFailure')}: ` : '>> '} {log.message}
                             </span>
                             {log.level === 'INFO' && <div className="h-0.5 w-12 bg-indigo-500/20 rounded-full group-hover:w-full transition-all duration-700" />}
                          </div>
                       </div>
                     )) : (
                       <div className="py-32 flex flex-col items-center justify-center opacity-10">
                          <Activity size={80} className="animate-pulse mb-8" />
                          <p className="font-black uppercase tracking-[0.8em] text-xs">{t('jobs.terminal.awaiting')}</p>
                       </div>
                     )}
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
       </div>

       <footer className="p-10 border-t border-white/5 bg-slate-900/60 backdrop-blur-3xl relative z-10 flex justify-between items-center">
          <div className="flex flex-col gap-1">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('jobs.terminal.forensicProtocol')}</p>
             <p className="text-[10px] font-black text-indigo-400 italic uppercase">{t('jobs.terminal.syncInterval')}: 14ms</p>
          </div>
          <div className="flex items-center gap-4 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" />
             <span className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.3em]">{t('jobs.terminal.integritySeal')}</span>
          </div>
       </footer>
    </motion.div>
  );
};
