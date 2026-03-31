import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/client";
import { Loader2, Mail, UserPlus, Search, Trash2, Edit, X, ShieldCheck, Network, Scan, Filter, HardHat } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { DiagnosticModal } from "../components/team/DiagnosticModal";
import { PulseNode, ForensicLabel, RefreshCcwIcon, AgentClassBadge, LatticeIntegrityHUD, SignalTicker } from "../components/team/TeamUI";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  jobTitle?: string;
}

export const Team = () => {
  const { t, i18n } = useTranslation();
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: "STAFF" });

  const isAdmin = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : { role: "USER" };
    return ["ADMIN", "SUPER_ADMIN", "VENDOR"].includes(user.role);
  }, []);

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users/team");
      if (data.success) setTeam(data.data);
    } catch (err) { console.error(err); toast.error(t('errors.networkError')); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleRemove = async (id: string) => {
    if (!window.confirm(t('common.confirm'))) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success(t('common.success'));
      fetchTeam();
    } catch (err) { console.error(err); toast.error(t('errors.unauthorized')); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadId = toast.loading(t('team.toast.onboarding'));
    try {
      const { data } = await api.post("/users", newMember);
      if (data.success) {
        toast.success(t('team.toast.syncOk'), { id: loadId });
        setShowAddModal(false);
        setNewMember({ name: "", email: "", password: "", role: "STAFF" });
        fetchTeam();
      }
    } catch (err: any) { toast.error(err.response?.data?.message || t('errors.serverError'), { id: loadId }); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const loadId = toast.loading(t('team.toast.reconfiguring'));
    try {
      await api.put(`/users/${editingUser._id}`, editingUser);
      toast.success(t('team.toast.reconfigOk'), { id: loadId });
      setEditingUser(null);
      fetchTeam();
    } catch (err: any) { toast.error(t('team.toast.denied'), { id: loadId }); }
  };

  const filtered = team.filter(m => [m.name, m.email, m.role].some(f => f.toLowerCase().includes(searchTerm.toLowerCase())));
  const isRtl = i18n.language === 'ar';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <div className="relative"><Loader2 className="animate-spin text-indigo-500 opacity-50" size={100} /><div className="absolute inset-0 flex items-center justify-center"><Network size={40} className="text-white animate-pulse" /></div></div>
      <p className="mt-12 font-black text-[12px] uppercase tracking-[1em] text-indigo-500 animate-pulse">{t('team.loading')}</p>
    </div>
  );

  return (
    <div className={cn("w-full space-y-8 pb-20 px-3 md:px-6 animate-reveal", isRtl ? 'font-ar text-right' : 'font-sans text-left')}>
      
      {/* 1. NEURAL COMMAND HUD */}
      <header className="relative group">
         <div className="absolute inset-0 bg-indigo-600/20 rounded-[2.5rem] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         <div className="bg-slate-950 dark:bg-black/40 backdrop-blur-3xl border border-white/10 p-7 md:p-10 rounded-[2.5rem] shadow-4xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-center gap-8">
            <div className="absolute inset-0 grid-pattern opacity-[0.05]" />
            <div className="scanline" />
            <div className="flex flex-col md:flex-row items-center gap-7 relative z-10">
               <motion.div whileHover={{ rotate: 90, scale: 1.1 }} className="w-18 h-18 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.6rem] shadow-2xl flex items-center justify-center text-white shrink-0"><Network size={36} /></motion.div>
               <div className="text-center md:text-left space-y-3">
                  <div className={cn("flex items-center justify-center md:justify-start gap-3", isRtl && "flex-row-reverse")}><PulseNode color="indigo" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">{t('team.subtitle')}</span></div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">{t('team.title').split(' ')[0]} <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-4 decoration-4">{t('team.title').split(' ')[1]}.</span></h1>
                  <SignalTicker />
               </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
               <LatticeIntegrityHUD agentCount={team.length} t={t} />
               {isAdmin && <button onClick={() => setShowAddModal(true)} className="bg-white text-black px-8 py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95 group border-none"><UserPlus size={18} className="group-hover:scale-110 transition-transform" /> {t('team.add')}</button>}
            </div>
         </div>
      </header>

      {/* 2. REGISTRY INTELLIGENCE */}
      <div className={cn("flex flex-col md:flex-row gap-4 bg-white/5 backdrop-blur-3xl p-3 rounded-[2.2rem] border border-white/10 shadow-pro transition-all", isRtl && "md:flex-row-reverse")}>
        <div className="relative flex-1 group/input">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-all", isRtl ? "right-6" : "left-6")} size={18} />
          <input type="text" placeholder={t('team.search')} className={cn("w-full bg-slate-100/50 dark:bg-black/40 border-none rounded-[1.8rem] py-4 text-[11px] font-black uppercase tracking-[0.3em] outline-none focus:ring-2 focus:ring-indigo-500 transition-all", isRtl ? "pr-16 pl-6" : "pl-16 pr-6")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-white/5 p-4 rounded-[1.8rem] border border-white/10 hover:border-indigo-500/50 transition-all shadow-sm active:scale-90 border-none"><Filter size={20}/></button>
          <button onClick={fetchTeam} className="bg-white dark:bg-white/5 p-4 rounded-[1.8rem] border border-white/10 hover:border-indigo-500/50 transition-all shadow-sm active:scale-90 border-none"><RefreshCcwIcon size={20} /></button>
        </div>
      </div>

      {/* 3. AGENT LATTICE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((m, i) => (
            <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }} key={m._id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur-xl transition duration-700" />
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col hover:shadow-indigo-500/10 transition-all relative overflow-hidden h-full">
                 <div className="absolute inset-0 grid-pattern opacity-[0.02]" />
                 <div className="absolute top-5 right-8 opacity-5 group-hover:opacity-10 transition-opacity"><span className="text-6xl font-black italic select-none">{m._id.slice(-3)}</span></div>
                 
                 <div className={cn("flex items-start justify-between mb-8 relative z-10", isRtl && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-6 overflow-hidden", isRtl && "flex-row-reverse")}>
                       <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-2xl font-black shrink-0 relative">
                          {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" alt="" /> : m.name.charAt(0)}
                          <div className={cn("absolute -bottom-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xl z-20", m.isActive ? 'bg-emerald-500' : 'bg-rose-500', isRtl ? 'left-0' : 'right-0')} />
                       </div>
                       <div className={cn("min-w-0 space-y-1.5", isRtl ? "text-right" : "text-left")}>
                          <AgentClassBadge role={m.role} t={t} />
                          <h4 className="font-black text-xl truncate group-hover:text-indigo-500 transition-colors uppercase italic tracking-tighter">{m.name}</h4>
                          <div className={cn("flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity", isRtl && "flex-row-reverse")}><Mail size={10} className="text-indigo-500" /><p className="text-[9px] font-black uppercase truncate">{m.email}</p></div>
                       </div>
                    </div>
                    {isAdmin && m._id !== JSON.parse(localStorage.getItem("user") || "{}")._id && <button onClick={() => handleRemove(m._id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all active:scale-90 border-none bg-transparent"><Trash2 size={18}/></button>}
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                    <div className="p-4.5 bg-slate-50 dark:bg-black/40 rounded-[1.8rem] border border-white/5 group/data">
                       <div className={cn("flex items-center gap-2 mb-1.5 opacity-40 group-hover/data:opacity-100", isRtl && "flex-row-reverse")}>
                          <ShieldCheck size={10} className="text-indigo-500" />
                          <p className="text-[7px] font-black uppercase">{t('team.stats.authTier')}</p>
                       </div>
                       <span className={cn("text-[10px] font-black uppercase italic truncate block text-indigo-500", isRtl ? "text-right" : "text-left")}>{t('team.stats.authLevel')}_{m.role.slice(0,2)}</span>
                    </div>
                    <div className="p-4.5 bg-slate-50 dark:bg-black/40 rounded-[1.8rem] border border-white/5 group/data">
                       <div className={cn("flex items-center gap-2 mb-1.5 opacity-40 group-hover/data:opacity-100", isRtl && "flex-row-reverse")}>
                          <HardHat size={10} className="text-emerald-500" />
                          <p className="text-[7px] font-black uppercase">{t('team.stats.deployment')}</p>
                       </div>
                       <span className={cn("text-[10px] font-black uppercase italic truncate block text-emerald-500", isRtl ? "text-right" : "text-left")}>{m.jobTitle || `${t('team.stats.sector')}_0`}</span>
                    </div>
                 </div>

                 <div className={cn("flex gap-3 relative z-10 mt-auto pt-5 border-t border-white/5", isRtl && "flex-row-reverse")}>
                    <button onClick={() => setSelectedUser(m)} className="flex-1 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2.5 active:scale-95 group/btn border-none">
                       <Scan size={16} className="group-hover/btn:rotate-90 transition-transform" /> 
                       {t('team.actions.scan')}
                    </button>
                    <button onClick={() => setEditingUser(m)} className="relative p-4 bg-white/5 dark:bg-indigo-500/5 text-slate-400 hover:text-indigo-400 rounded-xl transition-all active:scale-95 border border-white/10 hover:border-indigo-500/50 group/edit overflow-hidden backdrop-blur-xl shadow-2xl">
                       <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-indigo-500/0 group-hover/edit:border-indigo-500/100 transition-all duration-500" />
                       <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-indigo-500/0 group-hover/edit:border-indigo-500/100 transition-all duration-500" />
                       <div className={cn("relative z-10 flex items-center gap-2.5", isRtl && "flex-row-reverse")}>
                          <Edit size={18} className="group-hover/edit:rotate-[360deg] transition-transform duration-1000 ease-in-out" />
                          <span className="max-w-0 overflow-hidden group-hover/edit:max-w-[80px] transition-all duration-700 text-[7px] font-black uppercase tracking-[0.2em] italic whitespace-nowrap">{t('team.actions.reconfig')}</span>
                       </div>
                    </button>
                 </div>
                 
                 <div className={cn("absolute bottom-2 flex gap-4 opacity-0 group-hover:opacity-10 transition-opacity", isRtl ? "right-8" : "left-8")}>
                    <ForensicLabel label={`SIG_ID_${m._id.slice(0, 6)}`} />
                    <ForensicLabel label={`DATA_LOCKED`} />
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* POPUP: ONBOARD AGENT */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#0b0c10] w-full max-w-2xl rounded-[4rem] p-10 md:p-14 shadow-4xl relative border border-white/10 my-auto overflow-hidden">
                <button onClick={() => setShowAddModal(false)} className={cn("absolute top-8 p-4 text-slate-400 hover:text-rose-500 transition-all z-20 active:scale-90 bg-transparent border-none", isRtl ? "left-8" : "right-8")}><X size={24} /></button>
                <div className={cn("flex items-center gap-6 mb-12 relative z-10", isRtl && "flex-row-reverse")}>
                   <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl rotate-6"><UserPlus size={32} /></div>
                   <div className={isRtl ? "text-right" : "text-left"}><h3 className="text-3xl md:text-4xl font-black uppercase italic leading-none text-slate-950 dark:text-white">{t('team.modal.onboard').split(' ')[0]} <span className="text-indigo-600 underline decoration-indigo-500/20 underline-offset-4">{t('team.modal.onboard').split(' ').slice(1).join(' ')}.</span></h3><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">{t('team.modal.onboardSub')}</p></div>
                </div>
                <form onSubmit={handleAdd} className="space-y-8 relative z-10">
                   <div className="space-y-2"><label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right")}>{t('team.fields.name')}</label><input required placeholder="GHOST_OPERATIVE_01" className={cn("w-full bg-slate-50 dark:bg-black/40 border border-white/5 rounded-2xl p-6 font-black text-sm uppercase italic outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl && "text-right")} value={newMember.name} onChange={(e)=>setNewMember({...newMember, name: e.target.value})} /></div>
                   <div className="space-y-2"><label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right")}>{t('team.fields.email')}</label><input required type="email" placeholder="AGENT@NEURAL.OS" className={cn("w-full bg-slate-100/50 dark:bg-black/40 border border-white/5 rounded-2xl p-6 font-black text-sm uppercase italic outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl && "text-right")} value={newMember.email} onChange={(e)=>setNewMember({...newMember, email: e.target.value})} /></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2"><label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right")}>{t('team.fields.auth')}</label><select className={cn("w-full bg-slate-100/50 dark:bg-black/40 border border-white/5 rounded-2xl p-6 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase text-slate-900 dark:text-white", isRtl && "text-right")} value={newMember.role} onChange={(e)=>setNewMember({...newMember, role: e.target.value})}><option value="STAFF">{t('team.fields.roles.STAFF')}</option><option value="MANAGER">{t('team.fields.roles.MANAGER')}</option><option value="ADMIN">{t('team.fields.roles.ADMIN')}</option></select></div>
                      <div className="space-y-2"><label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right")}>{t('team.fields.cipher')}</label><input required type="password" placeholder="••••••••" className={cn("w-full bg-slate-100/50 dark:bg-black/40 border border-white/5 rounded-2xl p-6 font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl && "text-right")} value={newMember.password} onChange={(e)=>setNewMember({...newMember, password: e.target.value})} /></div>
                   </div>
                   <button type="submit" className="w-full bg-slate-950 dark:bg-indigo-600 text-white py-7 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-95 mt-6 flex items-center justify-center gap-4 group hover:bg-indigo-700 transition-all border-none"><ShieldCheck size={24} /> {t('team.actions.commit')}</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP: RECONFIGURE AGENT */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#0b0c10] w-full max-w-2xl rounded-[4rem] p-10 md:p-14 shadow-4xl relative border border-white/10 my-auto overflow-hidden">
                <button onClick={() => setEditingUser(null)} className={cn("absolute top-8 p-4 text-slate-400 hover:text-indigo-500 transition-all z-20 active:scale-90 bg-transparent border-none", isRtl ? "left-8" : "right-8")}><X size={24} /></button>
                <div className={cn("flex items-center gap-6 mb-12 relative z-10", isRtl && "flex-row-reverse")}>
                   <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl rotate-6"><Edit size={32} /></div>
                   <div className={isRtl ? "text-right" : "text-left"}><h3 className="text-3xl md:text-4xl font-black uppercase italic leading-none text-slate-950 dark:text-white">{t('team.modal.reconfig').split(' ')[0]} <span className="text-indigo-600 underline decoration-indigo-500/20 underline-offset-4">{t('team.modal.reconfig').split(' ')[1]}.</span></h3><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">{t('team.modal.reconfigSub')}</p></div>
                </div>
                <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
                   <div className="space-y-2"><label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right")}>{t('team.fields.name')}</label><input required className={cn("w-full bg-slate-50 dark:bg-black/40 border border-white/5 rounded-2xl p-6 font-black text-sm uppercase italic outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl && "text-right")} value={editingUser.name} onChange={(e)=>setEditingUser({...editingUser, name: e.target.value})} /></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2"><label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right")}>{t('team.fields.auth')}</label><select className={cn("w-full bg-slate-100/50 dark:bg-black/40 border border-white/5 rounded-2xl p-6 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase text-slate-900 dark:text-white", isRtl && "text-right")} value={editingUser.role} onChange={(e)=>setEditingUser({...editingUser, role: e.target.value})}><option value="STAFF">{t('team.fields.roles.STAFF')}</option><option value="MANAGER">{t('team.fields.roles.MANAGER')}</option><option value="ADMIN">{t('team.fields.roles.ADMIN')}</option></select></div>
                      <div className="space-y-2"><label className={cn("text-[10px] font-black text-indigo-500 uppercase tracking-widest block ml-1", isRtl && "text-right")}>{t('team.fields.tag')}</label><input className={cn("w-full bg-slate-100/50 dark:bg-black/40 border border-white/5 rounded-2xl p-6 font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl && "text-right")} value={editingUser.jobTitle || ""} onChange={(e)=>setEditingUser({...editingUser, jobTitle: e.target.value})} /></div>
                   </div>
                   <button type="submit" className="w-full bg-white dark:bg-white text-black py-7 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-95 mt-6 flex items-center justify-center gap-4 group hover:bg-indigo-600 hover:text-white transition-all border-none"><ShieldCheck size={24} /> {t('team.actions.sync')}</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{selectedUser && <DiagnosticModal userId={selectedUser._id} userName={selectedUser.name} onClose={() => setSelectedUser(null)} isRtl={isRtl} t={t} />}</AnimatePresence>
    </div>
  );
};

export default Team;
