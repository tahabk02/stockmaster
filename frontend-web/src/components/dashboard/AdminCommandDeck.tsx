import React from "react";
import { Terminal, Users, Building2, AlertTriangle, ChevronRight, Fingerprint } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

const AdminCommand = ({ icon, label, desc, path, critical, isRtl }: any) => (
  <div 
    onClick={() => window.location.href = path}
    className={cn("flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-[1.8rem] border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer group/cmd relative overflow-hidden", isRtl && "flex-row-reverse")}
  >
     <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-indigo-500/0 group-hover/cmd:border-indigo-500/100 transition-all duration-500" />
     <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-indigo-500/0 group-hover/cmd:border-indigo-500/100 transition-all duration-500" />
     <div className={cn(
       "w-11 h-11 rounded-xl flex items-center justify-center shadow-2xl group-hover/cmd:scale-110 transition-transform duration-500 relative z-10",
       critical ? "bg-rose-500/10 text-rose-500" : "bg-white dark:bg-slate-900 text-indigo-500"
     )}>
        {icon}
     </div>
     <div className={cn("flex-1 min-w-0 relative z-10", isRtl ? "text-right" : "text-left")}>
        <h4 className="text-[12px] font-black text-slate-950 dark:text-white uppercase tracking-widest italic truncate leading-none mb-1.5">{label}</h4>
        <p className="text-[7.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1">{desc}</p>
     </div>
     <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 group-hover/cmd:bg-indigo-600 group-hover/cmd:text-white transition-all duration-500 shadow-sm relative z-10">
        <ChevronRight size={16} strokeWidth={3} className={cn("transition-transform", isRtl ? "rotate-180 group-hover/cmd:-translate-x-1" : "group-hover/cmd:translate-x-1")} />
     </div>
  </div>
);

export const AdminCommandDeck = ({ isRtl }: { isRtl: boolean }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-4xl flex flex-col justify-between group relative overflow-hidden h-full">
       <div className="absolute inset-0 grid-pattern opacity-[0.03]" />
       <div className="space-y-8 relative z-10">
          <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
             <h3 className={cn("text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter italic flex items-center gap-3", isRtl && "flex-row-reverse")}><Terminal size={20} className="text-indigo-600" /> {t('admin.deck.title')}</h3>
             <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-75" /><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-150" /></div>
          </div>
          <div className="space-y-3">
             <AdminCommand icon={<Users size={18}/>} label={t('admin.deck.manageAgents')} desc={t('admin.deck.globalNodeAccess')} path="/team" isRtl={isRtl} />
             <AdminCommand icon={<Building2 size={18}/>} label={t('admin.deck.nodeTopology')} desc={t('admin.deck.clusterControl')} path="/admin/tenants" isRtl={isRtl} />
             <AdminCommand icon={<AlertTriangle size={18}/>} label={t('admin.deck.signalAlerts')} desc={t('admin.deck.stateMonitor')} path="/admin/console" critical isRtl={isRtl} />
          </div>
       </div>
       <button className="w-full mt-10 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-4xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 relative z-10 overflow-hidden group/btn border-none">
          <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
          <span className="relative z-10 flex items-center justify-center gap-3"><Fingerprint size={18} /> {t('admin.deck.executeReport')}</span>
       </button>
    </div>
  );
};
