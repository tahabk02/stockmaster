import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/client";
import { 
  ShieldAlert, Search, 
  RefreshCcw, Clock, 
  Database, Fingerprint, Shield, Download, Binary,
  Scan, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

const PulseNode = ({ color = "indigo" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color === "indigo" ? "bg-indigo-400" : color === "emerald" ? "bg-emerald-400" : "bg-rose-400")}></span>
    <span className={cn("relative inline-flex rounded-full h-2 w-2", color === "indigo" ? "bg-indigo-500" : color === "emerald" ? "bg-emerald-500" : "bg-rose-500")}></span>
  </span>
);

const ForensicLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
    <Binary size={8} className="text-indigo-500" />
    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
  </div>
);

interface AuditLog {
  _id: string;
  createdAt: string;
  userId: { name: string; role: string };
  action: string;
  details: string;
  method: string;
}

export const AuditLogs = () => {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/audit");
      setLogs(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error(t('audit.toast.interrupted'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePurge = async () => {
    if (!window.confirm(t('audit.purge.confirm'))) return;
    const loadId = toast.loading(t('audit.purge.loading'));
    try {
      await api.delete("/audit/purge");
      toast.success(t('audit.purge.success'), { id: loadId });
      fetchLogs();
    } catch (err) {
      console.error(err);
      toast.error(t('audit.purge.error'), { id: loadId });
    }
  };

  const handleExport = () => {
    const loadId = toast.loading(t('audit.export.loading'));
    try {
      const csv = `${t('audit.export.csvHeaders')}\n` + 
        filtered.map(l => `${new Date(l.createdAt).toLocaleDateString()},${new Date(l.createdAt).toLocaleTimeString()},${l.userId?.name || t('audit.table.system')},${l.action},${l.details}`).join("\n");
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit-${Date.now()}.csv`;
      a.click();
      toast.success(t('audit.export.success'), { id: loadId });
    } catch (err) {
      console.error(err);
      toast.error(t('audit.export.error'), { id: loadId });
    }
  };

  const filtered = useMemo(() => {
    return logs.filter(l => 
      l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("w-full space-y-6 pb-16 px-4 md:px-6 animate-reveal text-[var(--text)]", isRtl ? 'text-right font-ar' : 'text-left font-sans')}>
      
      {/* 1. FORENSIC COMMAND HUD */}
      <header className="relative group">
         <div className="absolute inset-0 bg-indigo-600/10 rounded-[2.5rem] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         <div className="bg-slate-900 dark:bg-black/40 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-4xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="scanline" />

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
               <motion.div 
                 whileHover={{ rotate: 90, scale: 1.1 }}
                 className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.5rem] shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center text-white shrink-0"
               >
                  <Shield size={32} strokeWidth={1.5} />
               </motion.div>
               <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                     <PulseNode color="indigo" />
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500 italic">{t('audit.subtitle')}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white dark:text-white flex flex-wrap gap-x-4 justify-center md:justify-start">
                     {t('audit.title').split(' ')[0]} <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-4 decoration-4">{t('audit.title').split(' ')[1]}</span>
                  </h1>
                  <p className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em] mt-4 opacity-60 max-w-lg leading-relaxed">
                     {t('audit.desc')}
                  </p>
               </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 shrink-0 relative z-10 w-full lg:w-auto">
               <div className="bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] flex items-center gap-10 shadow-3xl group/stats hover:bg-white/10 transition-colors w-full md:w-auto justify-center">
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stats:text-emerald-400 transition-colors">{t('audit.stats.integrity')}</p>
                     <div className="flex items-center gap-2 justify-center">
                        <PulseNode color="emerald" />
                        <p className="text-2xl font-black text-emerald-400 italic leading-none uppercase tracking-tighter">99.9%</p>
                     </div>
                  </div>
                  <div className="w-px h-10 bg-white/10 group-hover/stats:h-12 transition-all" />
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stats:text-indigo-400 transition-colors">{t('audit.stats.signals')}</p>
                     <p className="text-2xl font-black text-white italic leading-none flex items-baseline gap-2 justify-center">
                        {logs.length} <span className="text-[10px] not-italic opacity-30 tracking-widest uppercase">{t('audit.stats.events')}</span>
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* 2. REGISTRY INTELLIGENCE FILTERS */}
      <div className={cn("flex flex-col md:flex-row gap-4 bg-[var(--card)] backdrop-blur-3xl p-3 rounded-[2.2rem] border border-[var(--border)] shadow-pro group transition-all", isRtl && "md:flex-row-reverse")}>
        <div className="relative flex-1 group/input">
          <div className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-all z-10", isRtl ? "right-6" : "left-6")}>
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder={t('audit.filter.placeholder')}
            className={cn("w-full bg-[var(--bg-soft)] border-none rounded-[1.8rem] py-4 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text)] outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl ? "pr-16 pl-6" : "pl-16 pr-6")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={cn("flex flex-wrap md:flex-nowrap gap-3", isRtl && "flex-row-reverse")}>
           <button onClick={handleExport} className="flex-1 md:flex-none bg-[var(--card)] px-6 py-4 rounded-[1.8rem] border border-[var(--border)] hover:border-indigo-500/50 transition-all shadow-sm active:scale-90 flex items-center justify-center gap-3 group/btn">
              <Download size={18} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t('common.export')}</span>
           </button>
           <button onClick={handlePurge} className="flex-1 md:flex-none bg-rose-500 text-white px-6 py-4 rounded-[1.8rem] shadow-2xl hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn">
              <ShieldAlert size={18} strokeWidth={2.5} className="group-hover/btn:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{t('audit.purge.button')}</span>
           </button>
           <button onClick={fetchLogs} className="bg-[var(--card)] p-4 rounded-[1.8rem] border border-[var(--border)] hover:border-indigo-500/50 transition-all group/refresh shadow-sm active:scale-90">
              <RefreshCcw className={cn("text-slate-400 group-hover/refresh:text-indigo-500 group-hover/refresh:rotate-180 transition-all duration-700", loading && "animate-spin")} size={20} strokeWidth={2.5} />
           </button>
        </div>
      </div>

      {/* 3. FORENSIC SIGNAL STREAM */}
      <div className="theme-card overflow-hidden relative">
         <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
         
         <div className="overflow-x-auto custom-scrollbar">
            <table className={cn("pro-table", isRtl ? 'text-right' : 'text-left')}>
               <thead>
                  <tr className="italic">
                     <th className="w-40">{t('audit.table.timing')}</th>
                     <th>{t('audit.table.agent')}</th>
                     <th>{t('audit.table.protocol')}</th>
                     <th>{t('audit.table.payload')}</th>
                     <th className="text-right">{t('audit.table.node')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <AnimatePresence mode="popLayout">
                     {loading ? (
                        <tr>
                           <td colSpan={5} className="p-20 text-center">
                              <div className="relative mb-6 flex justify-center">
                                 <Loader2 size={60} className="animate-spin text-indigo-500 opacity-50"/>
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <Scan size={24} className="dark:text-white animate-pulse" />
                                 </div>
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-[0.8em] text-indigo-500 animate-pulse">{t('audit.table.scanning')}</p>
                           </td>
                        </tr>
                     ) : filtered.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="p-20 text-center">
                              <div className="relative mb-6 flex justify-center">
                                 <Database size={60} strokeWidth={0.5} className="text-slate-500 opacity-20"/>
                              </div>
                              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 italic">{t('audit.table.noSignals')}</p>
                           </td>
                        </tr>
                     ) : filtered.map((log, i) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.02 }}
                          key={log._id || i} 
                          className="hover:bg-indigo-600/5 dark:hover:bg-white/[0.02] transition-all group cursor-default"
                        >
                           <td className="p-6">
                              <div className="flex flex-col relative z-10">
                                 <span className="text-[12px] font-black text-[var(--text)] mb-1 leading-none group-hover:text-indigo-500 transition-colors">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                 <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Clock size={8} />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.createdAt).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-4 relative z-10">
                                 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-[11px] border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-pro">
                                    {log.userId?.name?.charAt(0) || t('audit.table.system').charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="font-black text-[12px] text-[var(--text)] uppercase italic tracking-tighter truncate max-w-[150px] group-hover:text-indigo-500 transition-colors leading-none mb-1">{log.userId?.name || t('audit.table.system')}</span>
                                    <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                       <Fingerprint size={8} />
                                       <span className="text-[6px] font-black uppercase tracking-widest">{log.userId?.role || 'L0'}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="relative z-10">
                                 <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all duration-500", 
                                    log.action.includes('PURGE') || log.action.includes('DELETE') ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] group-hover:bg-rose-500 group-hover:text-white" : 
                                    log.action.includes('UPDATE') ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:bg-amber-500 group-hover:text-white" :
                                    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:bg-indigo-600 group-hover:text-white")}>
                                    {log.action}
                                 </span>
                              </div>
                           </td>
                           <td className="p-6 max-w-md">
                              <div className="relative z-10 group/payload">
                                 <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed group-hover:text-[var(--text)] transition-colors line-clamp-2">
                                    <span className="text-indigo-500/40 mr-1">»</span>
                                    {log.details}
                                 </p>
                              </div>
                           </td>
                           <td className="p-6 text-right">
                              <div className="relative z-10">
                                 <span className="text-[8px] font-black text-slate-400 uppercase bg-[var(--bg-soft)] px-3 py-1.5 rounded-lg border border-[var(--border)] tracking-[0.1em] group-hover:text-white group-hover:bg-slate-900 dark:group-hover:bg-indigo-600 transition-all duration-500">
                                    {log.method}
                                 </span>
                              </div>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
      </div>


    </div>
  );
};

export default AuditLogs;
