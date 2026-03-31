import React from "react";
import { motion } from "framer-motion";
import { Server, Globe, Database, HardDrive } from "lucide-react";
import { cn } from "../../lib/utils";

interface InfraMetricProps {
  icon: any;
  label: string;
  val: string | number;
  status: string;
}

const InfraMetric = ({ icon: Icon, label, val, status }: InfraMetricProps) => (
  <div className="bg-white/5 border border-white/10 rounded-[1.8rem] p-6 hover:bg-white/10 transition-all group/node cursor-default relative overflow-hidden">
     <div className="absolute inset-0 grid-pattern opacity-0 group-hover/node:opacity-10 transition-opacity" />
     <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-xl group-hover/node:rotate-12 transition-transform shadow-inner"><Icon size={22} /></div>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[7px] font-black uppercase tracking-widest border border-emerald-500/20">{status}</div>
     </div>
     <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-1.5 relative z-10">{label}</p>
     <p className="text-2xl font-black text-white italic tracking-tighter relative z-10 leading-none">{val}</p>
     <div className="w-full bg-white/5 h-1 rounded-full mt-6 overflow-hidden relative z-10">
        <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ duration: 2, ease: "easeOut" }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
     </div>
  </div>
);

interface InfraTelemetryProps {
  stats: any;
  isRtl: boolean;
}

export const InfraTelemetry = ({ stats, isRtl }: InfraTelemetryProps) => (
  <div className="xl:col-span-2 bg-slate-950 rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-4xl relative overflow-hidden group">
     <div className="absolute inset-0 grid-pattern opacity-10" />
     <div className="scanline opacity-20" />
     <div className={cn("flex justify-between items-center mb-8 relative z-10 flex-wrap gap-4", isRtl && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
           <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600/20 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-700 shrink-0"><Server size={24} /></div>
           <div className={isRtl ? "text-right" : "text-left"}>
              <h2 className="text-xl font-black text-white uppercase tracking-widest italic leading-none">Cluster Resources</h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">INFRASTRUCTURE TELEMETRY FEED</p>
           </div>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">High Availability</div>
     </div>
     
     <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10", isRtl && "rtl")}>
        <InfraMetric icon={Globe} label="API Lattice" val={stats?.systemHealth?.api?.latency || "14ms"} status="optimal" />
        <InfraMetric icon={Database} label="Neural Schema" val={stats?.systemHealth?.db?.load || "8%"} status="optimal" />
        <InfraMetric icon={HardDrive} label="Storage Core" val={stats?.systemHealth?.storage?.usage || "42%"} status="active" />
     </div>
  </div>
);
