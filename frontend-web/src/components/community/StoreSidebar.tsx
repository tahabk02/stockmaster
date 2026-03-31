import React from "react";
import { MapPin, Phone, Globe, Users } from "lucide-react";
import { cn } from "../../lib/utils";

interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isRtl: boolean;
}

const SpecItem = ({ icon, label, value, isRtl }: SpecItemProps) => (
  <div className={cn("flex items-center gap-5 group", isRtl && "flex-row-reverse")}>
     <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner border border-white/5 shrink-0 transition-transform group-hover:scale-110">{icon}</div>
     <div className={isRtl ? "text-right" : "text-left"}>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[150px]">{value || "---"}</p>
     </div>
  </div>
);

interface StoreSidebarProps {
  store: any;
  vendor: any;
  isRtl: boolean;
}

export const StoreSidebar = ({ store, vendor, isRtl }: StoreSidebarProps) => (
  <aside className="lg:col-span-3 space-y-8 h-fit">
     <div className="glass-card p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000"><Globe size={100} /></div>
        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-8 italic relative z-10">Merchant Identity</h3>
        
        <div className="space-y-8 relative z-10">
           <SpecItem icon={<MapPin size={20}/>} label="Node Territory" value={store?.address?.city || "Global Cluster"} isRtl={isRtl} />
           <SpecItem icon={<Phone size={20}/>} label="Secure Signal" value={store?.phone || "Encrypted"} isRtl={isRtl} />
           <SpecItem icon={<Globe size={20}/>} label="Neural Relay" value={store?.website || "Internal System"} isRtl={isRtl} />
           <SpecItem icon={<Users size={20}/>} label="Network Flux" value={`${vendor?.followers?.length || 0} Coupled Nodes`} isRtl={isRtl} />
        </div>

        <div className="pt-10 border-t border-slate-200 dark:border-white/5 relative z-10">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-5">Operational Status</p>
           <div className={cn("flex items-center gap-4 px-5 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 w-fit", isRtl && "flex-row-reverse")}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Frequency</span>
           </div>
        </div>
     </div>
  </aside>
);
