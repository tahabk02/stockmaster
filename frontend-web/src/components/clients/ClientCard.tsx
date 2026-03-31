import React from "react";
import { motion } from "framer-motion";
import { Building2, Contact, Activity, SquarePen, Trash2, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

const HealthBadge = ({ debt, limit }: { debt: number; limit: number }) => {
  const ratio = limit > 0 ? debt / limit : 0;
  let status = { label: "Elite_Node", color: "emerald" };
  if (ratio > 0.8) status = { label: "Critical_Risk", color: "rose" };
  else if (ratio > 0.5) status = { label: "High_Exposure", color: "orange" };
  else if (ratio > 0.2) status = { label: "Stable_Signal", color: "indigo" };

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-md transition-all duration-500", `bg-${status.color}-500/10 border-${status.color}-500/20`)}>
       <div className={cn("w-1 h-1 rounded-full animate-pulse", `bg-${status.color}-500 shadow-[0_0_8px_currentColor]`)} />
       <span className={cn("text-[7px] font-black uppercase tracking-widest", `text-${status.color}-500`)}>{status.label}</span>
    </div>
  );
};

interface ClientCardProps {
  c: any;
  idx: number;
  isAdmin: boolean;
  onOpenDrawer: (c: any) => void;
  onEdit: (c: any) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}

export const ClientCard = ({ c, idx, isAdmin, onOpenDrawer, onEdit, onDelete, t }: ClientCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true }}
    transition={{ delay: idx * 0.05, duration: 0.6 }}
    className="bg-white dark:bg-slate-950/40 border border-white/10 rounded-[2.5rem] p-8 shadow-4xl group hover:border-indigo-500/40 transition-all duration-700 relative overflow-hidden backdrop-blur-3xl"
  >
     {/* KINETIC BACKGROUND */}
     <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600/10 group-hover:bg-indigo-600 transition-colors duration-700" />
     <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
     
     <div className="absolute top-8 right-8 z-20"><HealthBadge debt={c.totalDebt} limit={c.creditLimit} /></div>
     
     <div className="space-y-8 relative z-10">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center border-2 border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.3)] group-hover:rotate-6 group-hover:scale-110 transition-all duration-700 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              {c.type === "COMPANY" ? <Building2 className="text-indigo-500 relative z-10" size={28} /> : <Contact className="text-indigo-500 relative z-10" size={28} />}
           </div>
           <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate leading-none mb-2">{c.name}</h3>
              <div className="flex items-center gap-3">
                 <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{c.phone || "Signal_Idle"}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-inner group-hover:border-indigo-500/20 transition-all">
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                 <Activity size={10} className="text-rose-500" /> Exposure_Level
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">{(c.totalDebt || 0).toLocaleString()} <span className="text-[9px] not-italic text-slate-400">MAD</span></p>
           </div>
           <div className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-inner group-hover:border-emerald-500/20 transition-all">
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                 <Zap size={10} className="text-emerald-500" /> Loyalty_Nodes
              </p>
              <p className="text-xl font-black text-emerald-600 italic tracking-tighter">{c.loyaltyPoints || 0} <span className="text-[9px] not-italic text-slate-400">PTS</span></p>
           </div>
        </div>

        <div className="flex gap-3">
           <button 
             onClick={() => onOpenDrawer(c)} 
             className="flex-1 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-3xl flex items-center justify-center gap-3 group/btn border-none italic overflow-hidden relative"
           >
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
              <Activity size={14} className="relative z-10 group-hover/btn:rotate-180 transition-transform duration-700" /> 
              <span className="relative z-10">{t('common.view')}</span>
           </button>
           {isAdmin && (
             <div className="flex gap-2">
               <button onClick={() => onEdit(c)} className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl border-none text-slate-500 hover:text-indigo-500 transition-all active:scale-90 flex items-center justify-center"><SquarePen size={20} /></button>
               <button onClick={() => onDelete(c._id)} className="w-14 h-14 bg-rose-500/5 hover:bg-rose-600 rounded-2xl border-none text-rose-500 hover:text-white transition-all active:scale-90 flex items-center justify-center"><Trash2 size={20} /></button>
             </div>
           )}
        </div>
     </div>
  </motion.div>
);
