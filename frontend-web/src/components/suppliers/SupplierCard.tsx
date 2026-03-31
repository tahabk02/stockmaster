import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, ExternalLink, Activity, MoreVertical } from "lucide-react";
import { cn } from "../../lib/utils";

interface SupplierCardProps {
  s: any;
  idx: number;
  onClick: (id: string) => void;
  isRtl: boolean;
}

export const SupplierCard = ({ s, idx, onClick, isRtl }: SupplierCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
    onClick={() => onClick(s._id)}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/20 hover:border-indigo-500/40 transition-all cursor-pointer group relative overflow-hidden"
  >
     <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all"><MoreVertical size={18} className="text-slate-400" /></div>
     <div className="space-y-8 relative z-10">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-950 flex items-center justify-center border border-indigo-100 dark:border-slate-800 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <span className="text-2xl font-black text-indigo-600">{s.name.charAt(0)}</span>
           </div>
           <div className="min-w-0">
              <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter truncate leading-none mb-2 group-hover:text-indigo-600 transition-colors">{s.name}</h3>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Connected Node</span></div>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
              <MapPin size={16} className="text-indigo-500" />
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase truncate">{s.address || "Global Cluster"}</p>
           </div>
           <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
              <Phone size={16} className="text-indigo-500" />
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase truncate">{s.phone || "Encrypted"}</p>
           </div>
        </div>

        <div className="flex items-center justify-between pt-2">
           <div className="flex items-center gap-3">
              <Activity size={14} className="text-indigo-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Link</span>
           </div>
           <button className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-xl active:scale-90 transition-all border-none bg-transparent group/btn"><ExternalLink size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" /></button>
        </div>
     </div>
  </motion.div>
);
