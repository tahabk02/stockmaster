import React, { useState, useEffect, useCallback } from "react";
import { 
  Clock, Fingerprint, Activity, ShieldCheck, 
  MapPin, LogIn, LogOut, Loader2, Calendar,
  MoreHorizontal, ChevronRight, User as UserIcon,
  Zap, TrendingUp, Search, Filter, RefreshCcw, 
  AlertCircle, CheckCircle2, Radar, Shield,
  Users, BarChart3, MessageSquare, ClipboardList,
  Flame, Briefcase, Network, HardHat, ArrowUpRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { GlassCard } from "../components/ui/pro/GlassCard";

export const HRPulse = () => {
  const { t, i18n } = useTranslation();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [notes, setNotes] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  const isRtl = i18n.language === 'ar';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [myRes, teamRes] = await Promise.all([
        api.get("/hr/my-attendance"),
        api.get("/hr/team-attendance")
      ]);
      setAttendance(myRes.data.data || []);
      setTeamStats(teamRes.data.data || []);
    } catch (e) {
      toast.error(t('hr.toast.lost'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClockAction = async (type: 'IN' | 'OUT') => {
    setClocking(true);
    const loadId = toast.loading(t('hr.toast.syncing'));
    try {
      if (type === 'IN') {
        await api.post("/hr/clock-in", { location: { lat: 0, lng: 0 } });
      } else {
        await api.post("/hr/clock-out", { notes });
      }
      toast.success(t('hr.toast.success'), { id: loadId });
      setNotes("");
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || t('hr.toast.error'), { id: loadId });
    } finally {
      setClocking(false);
    }
  };

  const hasClockedInToday = attendance.some(a => new Date(a.date).toDateString() === new Date().toDateString());
  const todayRecord = attendance.find(a => new Date(a.date).toDateString() === new Date().toDateString());
  const isCurrentlyWorking = hasClockedInToday && !todayRecord?.clockOut;

  const activeMembers = teamStats.filter(a => new Date(a.date).toDateString() === new Date().toDateString() && !a.clockOut);

  return (
    <div className={cn("w-full space-y-6 pb-32 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. HR CONTROL HUB HEADER */}
      <header>
         <GlassCard variant="dark" className="p-8 md:p-10 border-none overflow-hidden group" animate>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
               <div className="space-y-4">
                  <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                     <div className="p-5 bg-emerald-600 rounded-[2.2rem] shadow-3xl shadow-emerald-500/40 rotate-3 transition-transform hover:rotate-0 duration-700 relative group shrink-0">
                        <Fingerprint size={36} className="group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-white/20 rounded-[2.2rem] animate-ping opacity-20" />
                     </div>
                     <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-white">{t('hr.title').split(' ')[0]} <span className="text-emerald-500">{t('hr.title').split(' ').slice(1).join(' ')}.</span></h1>
                        <p className="text-emerald-300 font-black uppercase text-[9px] tracking-[0.4em] mt-4 opacity-80">{t('hr.subtitle')}</p>
                     </div>
                  </div>
               </div>

               <div className="flex flex-wrap gap-6 shrink-0 w-full lg:w-auto">
                  <GlassCard className="p-6 flex items-center gap-10 shadow-2xl border-white/10 bg-white/5 flex-1 lg:flex-none justify-center">
                     <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hr.stats.present')}</p>
                        <p className="text-3xl font-black text-emerald-400 italic leading-none">{activeMembers.length}</p>
                     </div>
                     <div className="w-px h-10 bg-white/10" />
                     <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hr.stats.attendance')}</p>
                        <p className="text-3xl font-black text-indigo-400 italic leading-none">96%</p>
                     </div>
                  </GlassCard>
               </div>
            </div>
         </GlassCard>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         
         {/* AGENT BIOMETRIC TERMINAL */}
         <div className="xl:col-span-4 space-y-8">
            <GlassCard className="p-10 border-none relative overflow-hidden group" animate>
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className={cn("flex justify-between items-center mb-12", isRtl && "flex-row-reverse")}>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{t('hr.terminal')}</h3>
                  <Radar size={20} className="text-emerald-500 animate-spin-slow opacity-40" />
               </div>
               
               <div className="space-y-12">
                  <div className="flex justify-center">
                     <div className="w-48 h-48 rounded-[3rem] border-4 border-dashed border-emerald-500/20 flex items-center justify-center relative shadow-inner">
                        <motion.div 
                          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="absolute inset-4 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10" 
                        />
                        <div className="relative z-10 w-32 h-32 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl">
                           <Clock size={48} className="text-emerald-500 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-[3rem] border-2 border-emerald-500 border-t-transparent animate-spin" style={{ animationDuration: '4s' }} />
                     </div>
                  </div>

                  <div className="space-y-6">
                     {isCurrentlyWorking && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-1 block">{t('hr.notes')}</label>
                          <textarea 
                            value={notes}
                            onChange={(e)=>setNotes(e.target.value)}
                            placeholder={t('hr.notesPlaceholder')}
                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none h-24"
                          />
                       </motion.div>
                     )}

                     {!todayRecord || !todayRecord.clockOut ? (
                       <button 
                         disabled={clocking}
                         onClick={() => handleClockAction(hasClockedInToday ? 'OUT' : 'IN')}
                         className={cn(
                           "w-full py-7 rounded-[2rem] font-black uppercase text-sm tracking-[0.4em] shadow-3xl transition-all active:scale-95 flex items-center justify-center gap-4 border-none group overflow-hidden relative",
                           hasClockedInToday ? "bg-rose-600 text-white shadow-rose-500/30" : "bg-emerald-600 text-white shadow-emerald-500/30"
                         )}
                       >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                          {clocking ? <Loader2 className="animate-spin" size={24} /> : hasClockedInToday ? <><LogOut size={24}/> {t('hr.clockOut')}</> : <><LogIn size={24}/> {t('hr.clockIn')}</>}
                       </button>
                     ) : (
                       <GlassCard className="p-8 border-emerald-500/20 bg-emerald-500/5 text-center">
                          <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
                          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] italic">{t('hr.opsComplete')}</p>
                       </GlassCard>
                     )}
                  </div>

                  {todayRecord && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">{t('hr.signalIn')}</p>
                          <p className="text-sm font-black text-slate-950 dark:text-white italic text-center leading-none">{new Date(todayRecord.clockIn).toLocaleTimeString()}</p>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">{t('hr.signalOut')}</p>
                          <p className="text-sm font-black text-slate-950 dark:text-white italic text-center leading-none">{todayRecord.clockOut ? new Date(todayRecord.clockOut).toLocaleTimeString() : t('hr.pending')}</p>
                       </div>
                    </div>
                  )}
               </div>
            </GlassCard>

            <GlassCard onClick={() => setShowRequestModal(true)} className="p-8 border-none bg-indigo-600 text-white overflow-hidden relative group" animate>
               <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Briefcase size={120} /></div>
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 italic opacity-60">{t('hr.request')}</h4>
                  <p className="text-lg font-black italic tracking-tighter leading-tight uppercase">{t('hr.requestSub')}</p>
                  <div className="mt-8 flex gap-2">
                     <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
               </div>
            </GlassCard>
         </div>

         {/* ACTIVITY LEDGER & TEAM RADAR */}
         <div className="xl:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <GlassCard className="p-8 border-none" animate>
                  <div className={cn("flex justify-between items-center mb-8", isRtl && "flex-row-reverse")}>
                     <div>
                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-950 dark:text-white">{t('hr.presence')}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('hr.presenceSub')}</p>
                     </div>
                     <Network size={16} className="text-indigo-500 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     {activeMembers.slice(0, 8).map((m, i) => (
                       <div key={i} className="flex flex-col items-center gap-2 group cursor-help relative">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 p-0.5 border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId?._id || i}`} className="w-full h-full object-cover rounded-lg" alt="" />
                             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xl" />
                          </div>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[6px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">AGENT_{i+1} ACTIVE</div>
                       </div>
                     ))}
                     <div className="w-12 h-12 rounded-xl border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 text-[10px] font-black italic">+12</div>
                  </div>
               </GlassCard>

               <GlassCard className="p-8 border-none overflow-hidden relative" animate>
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={80}/></div>
                  <div className={cn("flex justify-between items-center mb-8", isRtl && "flex-row-reverse")}>
                     <div>
                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-950 dark:text-white">{t('hr.efficiency')}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('hr.efficiencySub')}</p>
                     </div>
                     <Zap size={16} className="text-amber-500" />
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black italic text-indigo-600 tracking-tighter">98.4</span>
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Signal_Index</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 2 }} className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                     </div>
                     <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                           {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />)}
                        </div>
                        <span className="text-[6px] font-black uppercase text-emerald-500 tracking-[0.3em]">Operational_Peak</span>
                     </div>
                  </div>
               </GlassCard>
            </div>

            <GlassCard className="p-8 md:p-10 border-none min-h-[400px] flex flex-col" animate>
               <div className={cn("flex justify-between items-center mb-12", isRtl && "flex-row-reverse")}>
                  <div>
                     <h3 className="text-2xl font-black text-indigo-950 dark:text-white uppercase italic tracking-tighter leading-none">{t('hr.ledger')}</h3>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] mt-3 italic">Historical Operational Registry</p>
                  </div>
                  <div className="flex gap-3">
                     <button className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border-none active:scale-95"><Filter size={20}/></button>
                     <button onClick={fetchData} className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border-none active:scale-95 group"><RefreshCcw size={20} className={cn(loading && "animate-spin", "group-hover:rotate-180 transition-transform duration-700")}/></button>
                  </div>
               </div>

               <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20"><Loader2 size={64} className="animate-spin text-indigo-600 mb-6" /><p className="text-[10px] font-black uppercase tracking-[0.8em]">Synchronizing Stream...</p></div>
                  ) : attendance.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale py-20">
                       <Calendar size={100} strokeWidth={1} className="text-indigo-600 mb-8 animate-pulse" />
                       <p className="font-black uppercase text-sm tracking-[0.4em] italic">{t('hr.noRecords')}</p>
                    </div>
                  ) : attendance.map((rec, i) => (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className={cn("p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between group hover:border-emerald-500/30 hover:shadow-xl transition-all duration-500 relative overflow-hidden", isRtl && "md:flex-row-reverse")}>
                       <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-xl border border-slate-100 dark:border-white/5 transition-all group-hover:rotate-6">
                             <Calendar size={24} />
                          </div>
                          <div className={isRtl ? "text-right" : "text-left"}>
                             <h4 className="text-lg font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none mb-2">{new Date(rec.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                             <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                                <span className={cn("px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border", rec.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20')}>
                                   {t(`hr.statuses.${rec.status}`, { defaultValue: rec.status })}
                                </span>
                                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Protocol_Auth_Verified</span>
                             </div>
                          </div>
                       </div>

                       <div className={cn("flex items-center gap-12 mt-6 md:mt-0", isRtl && "flex-row-reverse")}>
                          <div className={isRtl ? "text-right" : "text-left"}>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('hr.effective')}</p>
                             <p className="text-3xl font-black text-slate-950 dark:text-white italic leading-none group-hover:text-emerald-500 transition-colors">8.4 <span className="text-[10px] not-italic opacity-40 uppercase tracking-widest">{t('hr.hours')}</span></p>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-300 group-hover:text-emerald-500 transition-all">
                             <ChevronRight size={20} className={isRtl ? "rotate-180" : ""} />
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </GlassCard>
         </div>

      </main>

      {/* DEPLOYMENT REQUEST MODAL */}
      <AnimatePresence>
         {showRequestModal && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0b0c10] w-full max-w-xl rounded-[3.5rem] p-10 md:p-14 shadow-4xl relative border border-white/10 overflow-hidden">
                 <button onClick={() => setShowRequestModal(false)} className={cn("absolute top-8 p-4 text-slate-400 hover:text-rose-500 transition-all z-20", isRtl ? "left-8" : "right-8")}><X size={24} /></button>
                 
                 <div className={cn("flex items-center gap-6 mb-12 relative z-10", isRtl && "flex-row-reverse")}>
                    <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl rotate-6"><HardHat size={32} /></div>
                    <div className={isRtl ? "text-right" : "text-left"}>
                       <h3 className="text-3xl md:text-4xl font-black uppercase italic leading-none text-slate-950 dark:text-white">{t('hr.request')}</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Personnel Operational Shift</p>
                    </div>
                 </div>

                 <div className="space-y-8 relative z-10">
                    <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-indigo-500/20 text-center opacity-40">
                       <ClipboardList size={48} className="mx-auto mb-4 text-indigo-500" />
                       <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">Request_Interface_Standby <br/> Awaiting Authorization Module Integration</p>
                    </div>
                    <button onClick={() => setShowRequestModal(false)} className="w-full bg-slate-950 dark:bg-white text-white dark:text-black py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-95 transition-all border-none">Acknowledge_Signal</button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default HRPulse;
