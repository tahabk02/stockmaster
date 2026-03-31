import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, Search, Filter, RefreshCcw, 
  MoreVertical, Clock, User as UserIcon, CheckCircle2,
  AlertCircle, ShieldCheck, Zap, ArrowRight,
  Loader2, X, Save, Trash2, Calendar, Layout,
  Trello, Fingerprint, Target, Activity, ChevronRight,
  UserCheck, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

const COLUMNS = [
  { id: "TODO", color: "bg-slate-500", glow: "shadow-slate-500/20" },
  { id: "IN_PROGRESS", color: "bg-indigo-600", glow: "shadow-indigo-500/20" },
  { id: "REVIEW", color: "bg-amber-500", glow: "shadow-amber-500/20" },
  { id: "DONE", color: "bg-emerald-500", glow: "shadow-emerald-500/20" }
];

export const OperationalFlow = () => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    assignedTo: "",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const isRtl = i18n.language === 'ar';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, agentsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/users/team")
      ]);
      setTasks(tasksRes.data.data || []);
      setAgents(agentsRes.data.data || []);
    } catch (e) {
      toast.error(t("tasks.toast.syncLost"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const moveTask = async (taskId: string, newStatus: string) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success(t("tasks.toast.shifted", { status: t(`tasks.columns.${newStatus}`) }));
    } catch (e) {
      toast.error(t("tasks.toast.syncFail"));
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      assignedTo: "",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const filtered = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error(t("tasks.toast.idMissing"));
    
    setIsSubmitting(true);
    const loadId = toast.loading(t("tasks.modal.synthesizing"));
    try {
      await api.post("/tasks", formData);
      toast.success(t("tasks.toast.syncOk"), { id: loadId });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t("tasks.toast.syncFail"), { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full space-y-6 pb-20 px-2 md:px-4 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. COMPACT COMMAND HUD */}
      <header className="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
               <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                  <div className="p-3 bg-indigo-600 rounded-xl shadow-xl shadow-indigo-500/40 rotate-2 transition-transform hover:rotate-0 duration-700 relative">
                     <Trello size={24} />
                  </div>
                  <div>
                     <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">{t('tasks.title').split(' ')[0]} <span className="text-indigo-500">{t('tasks.title').split(' ').slice(1).join(' ')}.</span></h1>
                     <p className="text-indigo-300 font-bold uppercase text-[8px] tracking-[0.4em] mt-1.5 opacity-80">{t('tasks.subtitle')}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-4 shrink-0">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-8 shadow-2xl">
                  <div className="text-center">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('tasks.stats.active')}</p>
                     <p className="text-2xl font-black text-indigo-400 italic leading-none">{tasks.filter(t => t.status !== 'DONE').length}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('tasks.stats.velocity')}</p>
                     <p className="text-2xl font-black text-emerald-400 italic leading-none">94%</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center gap-3 group">
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" /> {t('tasks.add')}
               </button>
            </div>
         </div>
      </header>

      {/* 2. COMPACT FILTERS */}
      <div className={cn("flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-white/5 shadow-xl backdrop-blur-md", isRtl && "md:flex-row-reverse")}>
        <div className="relative flex-1 group">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-4" : "left-4")} size={18} />
          <input placeholder={t("tasks.search")} className={cn("w-full bg-slate-50 dark:bg-black/20 border-none rounded-xl py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500/20 transition-all", isRtl ? "pr-12 pl-4" : "pl-12 pr-4")} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        </div>
        <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
           <button className="p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-xl shadow-lg transition-all active:scale-95"><Filter size={18} /></button>
           <button onClick={fetchData} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-xl shadow-lg transition-all active:scale-95 group">
              <RefreshCcw className={cn("group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} size={18} />
           </button>
        </div>
      </div>

      {/* 3. KANBAN MATRIX - RESPONSIVE */}
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center opacity-20">
           <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
           <p className="text-[10px] font-black uppercase tracking-[0.6em]">{t("tasks.syncing")}</p>
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6", isRtl && "rtl")}>
           {COLUMNS.map((col) => (
             <div key={col.id} className="space-y-4">
                <div className={cn("flex items-center justify-between px-4 pb-2 border-b border-slate-200 dark:border-white/10", isRtl && "flex-row-reverse")}>
                   <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
                      <div className={cn("w-2 h-2 rounded-full shadow-lg", col.color)} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white italic">{(t(`tasks.columns.${col.id}`) as string)}</h3>
                   </div>
                   <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[9px] font-black text-slate-400">{tasks.filter(t => t.status === col.id).length}</span>
                </div>

                <div className="space-y-3 min-h-[400px] p-1">
                   {tasks.filter(t => t.status === col.id).filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map((task, idx) => (
                     <motion.div 
                       layoutId={task._id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       whileHover={{ y: -3, scale: 1.01 }}
                       key={task._id} 
                       onClick={() => setSelectedTask(task)}
                       className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-md group hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                     >
                        <div className={cn("flex justify-between items-start mb-3", isRtl && "flex-row-reverse")}>
                           <span className={cn("px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border", 
                             task.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                             task.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                             'bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent'
                           )}>{task.priority}</span>
                           <button className="text-slate-300 hover:text-indigo-600 transition-colors p-0.5"><MoreVertical size={14}/></button>
                        </div>
                        
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2 leading-tight line-clamp-2">{task.title}</h4>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mb-4 line-clamp-2 leading-relaxed opacity-80">"{task.description}"</p>
                        
                        <div className={cn("flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5", isRtl && "flex-row-reverse")}>
                           <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 border border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-black text-white shadow-lg">
                                 {task.assignedTo?.name?.charAt(0) || "U"}
                              </div>
                              <p className="text-[8px] font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[60px]">{task.assignedTo?.name || "None"}</p>
                           </div>
                           <div className={cn("flex flex-col items-end", isRtl && "items-start")}>
                              <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">
                                 <Clock size={8} />
                                 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "---"}
                              </div>
                           </div>
                        </div>

                        {/* Quick Shift - Compact */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none flex items-center justify-center gap-2 bg-slate-950/10 backdrop-blur-[1px] transition-all duration-300">
                           {COLUMNS.filter(c => c.id !== task.status).map(c => (
                             <button 
                               key={c.id} 
                               onClick={(e) => { e.stopPropagation(); moveTask(task._id, c.id); }} 
                               className={cn("pointer-events-auto p-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl text-slate-400 hover:text-white hover:scale-110 active:scale-95 transition-all border border-white/10", 
                                 c.id === 'DONE' ? 'hover:bg-emerald-500' : 'hover:bg-indigo-600'
                               )}
                             >
                                <ArrowRight size={14} className={cn(isRtl && "rotate-180")} />
                             </button>
                           ))}
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* COMPACT MODALS */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 shadow-3xl relative border border-white/5 my-auto">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-xl shadow-lg transition-all"><X size={20} /></button>
                <form onSubmit={handleCreate} className="space-y-6">
                   <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">{t('tasks.add')}</h3>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={cn("text-[9px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right mr-1")}>{t("tasks.modal.identifier")}</label>
                        <input required placeholder="..." className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl p-4 font-black text-xs text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className={cn("text-[9px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right mr-1")}>{t("tasks.modal.priority")}</label>
                           <select className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl p-4 font-black text-[10px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase", isRtl && "text-right")} value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})}>
                              <option value="LOW">LOW</option><option value="MEDIUM">STABLE</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className={cn("text-[9px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right mr-1")}>{t("tasks.modal.agent")}</label>
                           <select className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl p-4 font-black text-[10px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase", isRtl && "text-right")} value={formData.assignedTo} onChange={(e)=>setFormData({...formData, assignedTo: e.target.value})}>
                              <option value="">SELECT</option>
                              {agents.filter(Boolean).map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                           </select>
                        </div>
                      </div>
                   </div>
                   <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-950 transition-all active:scale-95 flex items-center justify-center gap-3">
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {t("tasks.modal.submit")}</>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {selectedTask && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#0b141a] w-full max-w-2xl rounded-[3rem] shadow-3xl relative my-auto border border-white/5 overflow-hidden p-8 md:p-12">
                 <button onClick={() => setSelectedTask(null)} className={cn("absolute top-8 p-3 bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl transition-all z-20 active:scale-90", isRtl ? "left-8" : "right-8")}><X size={20} /></button>
                 <div className="space-y-8">
                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                       <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shrink-0"><Fingerprint size={32} /></div>
                       <div className={isRtl ? 'text-right' : 'text-left'}>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{selectedTask.title}</h2>
                          <span className={cn("inline-block mt-3 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", getStatusColorClass(selectedTask.status))}>{(t(`tasks.columns.${selectedTask.status}`) as string)}</span>
                       </div>
                    </div>
                    <div className={cn("p-8 bg-slate-50 dark:bg-black/40 rounded-[2rem] border border-slate-100 dark:border-white/5 text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed", isRtl && "text-right")}>
                       "{selectedTask.description || t("tasks.modal.nominal")}"
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-white/5">
                       <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
                          <button onClick={() => moveTask(selectedTask._id, 'DONE')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">{t("tasks.modal.close")}</button>
                          <button onClick={async () => { if(window.confirm(t("tasks.modal.purge"))) { await api.delete(`/tasks/${selectedTask._id}`); setSelectedTask(null); fetchData(); } }} className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-95"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
};

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "DONE": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "IN_PROGRESS": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    case "REVIEW": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

export default OperationalFlow;
