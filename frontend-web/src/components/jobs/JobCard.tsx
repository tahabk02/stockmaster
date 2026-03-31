import React from "react";
import { motion } from "framer-motion";
import { Play, Clock, AlertCircle, CheckCircle2, MoreVertical, Terminal, Zap, Calendar, Activity, BarChart3, ShieldCheck, Fingerprint } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

interface JobCardProps {
  job: any;
  idx: number;
  onRun: (id: string) => void;
  onViewLogs: (job: any) => void;
  isRtl: boolean;
}

const TelemetryNode = ({ label, value, icon: Icon, color }: any) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
      <Icon size={6} /> {label}
    </span>
    <span className={cn("text-[9px] font-black italic", `text-${color}-500`)}>{value}</span>
  </div>
);

const ProgressBuffer = ({ label, value, status }: { label: string, value: number, status: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-end px-1 scale-90">
       <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <span className="text-[8px] font-black text-white italic">{value}%</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
       <motion.div 
         initial={{ width: 0 }} 
         animate={{ width: `${value}%` }} 
         transition={{ duration: 1.5, ease: "circOut" }}
         className={cn(
           "h-full relative z-10",
           status === 'RUNNING' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'
         )} 
       />
    </div>
  </div>
);

export const JobCard = ({ job, idx, onRun, onViewLogs, isRtl }: JobCardProps) => {
  const { t } = useTranslation();
  const statusColors: any = {
    'RUNNING': 'indigo',
    'COMPLETED': 'emerald',
    'FAILED': 'rose',
    'QUEUED': 'amber'
  };
  const color = statusColors[job.status] || 'slate';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: idx * 0.03 }}
      className="bg-[#0b141a]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-5 shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:border-indigo-500/40 transition-all group relative overflow-hidden flex flex-col justify-between"
    >
       <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all z-20"><MoreVertical size={14} className="text-slate-500" /></div>
       <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
       
       <div className="relative z-10">
          <div className={cn("flex items-center gap-4 mb-6", isRtl && "flex-row-reverse")}>
             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl relative", `bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`)}>
                <Zap size={20} fill="currentColor" />
                {job.status === 'RUNNING' && <div className="absolute inset-0 bg-current rounded-2xl animate-ping opacity-20" />}
             </div>
             <div className={isRtl ? "text-right" : "text-left"}>
                <h3 className="text-sm font-black text-white uppercase italic tracking-tighter truncate max-w-[140px] leading-none mb-1.5">{job.name}</h3>
                <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
                   <span className={cn("px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-widest border", `bg-${color}-500/10 text-${color}-500 border-${color}-500/20`)}>SIG_{job.status}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
             <div className={cn("p-3 bg-black/40 rounded-2xl border border-white/5", isRtl && "text-right")}>
                <TelemetryNode label={t('jobs.card.latency')} value="14ms" icon={Activity} color="indigo" />
             </div>
             <div className={cn("p-3 bg-black/40 rounded-2xl border border-white/5", isRtl && "text-right")}>
                <TelemetryNode label={t('jobs.card.id')} value={job._id.slice(-4).toUpperCase()} icon={Fingerprint} color="amber" />
             </div>
          </div>

          <div className="mb-6">
             <ProgressBuffer label={t('jobs.card.buffer')} value={job.status === 'COMPLETED' ? 100 : job.status === 'RUNNING' ? 64 : 0} status={job.status} />
          </div>
       </div>

       <div className={cn("flex gap-2 relative z-10", isRtl && "flex-row-reverse")}>
          <button 
            onClick={() => onRun(job._id)} 
            className="flex-[3] py-3.5 bg-white text-black rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-xl border-none group/btn overflow-hidden relative"
          >
             <span className="relative z-10 flex items-center justify-center gap-2">{t('jobs.actions.dispatch')}</span>
          </button>
          <button 
            onClick={() => onViewLogs(job)}
            className="flex-1 py-3.5 bg-white/5 text-slate-400 rounded-xl border border-white/10 hover:text-indigo-400 transition-all active:scale-95 border-none flex items-center justify-center shadow-lg"
          >
             <Terminal size={14} />
          </button>
       </div>
    </motion.div>
  );
};
