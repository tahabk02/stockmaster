import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Binary, Cpu, Database, AlertCircle, Box } from "lucide-react";
import { cn } from "../../lib/utils";
import { PulseNode } from "../team/TeamUI";

export type ZoneNode = {
  id: string;
  name: string;
  load: number;
  capacity: number;
  status: "OPTIMAL" | "CRITICAL" | "SYNCING";
  type: "COLD" | "DRY" | "HAZMAT";
  coords: { x: number; y: number; z: number };
};

export const LaserScannerArray = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
    <motion.div 
      animate={{ top: ["-10%", "110%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      className="absolute left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_20px_#6366f1] opacity-40"
    />
    <motion.div 
      animate={{ top: ["-10%", "110%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
      className="absolute left-0 right-0 h-[1px] bg-rose-500 shadow-[0_0_15px_#f43f5e] opacity-20"
    />
    <motion.div 
      animate={{ top: ["-10%", "110%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 4 }}
      className="absolute left-0 right-0 h-[1px] bg-emerald-500 shadow-[0_0_15px_#10b981] opacity-20"
    />
  </div>
);

export const XYZTracker = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      setCoords({ x, y, z: Math.floor(Math.random() * 100) });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef]);

  return (
    <div className="absolute top-6 right-6 z-30 bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-xl pointer-events-none font-mono flex gap-4 shadow-2xl">
       <div className="flex flex-col"><span className="text-[6px] text-indigo-500 font-black uppercase">Lat_X</span><span className="text-[10px] text-white font-black italic">{coords.x}</span></div>
       <div className="flex flex-col"><span className="text-[6px] text-rose-500 font-black uppercase">Lat_Y</span><span className="text-[10px] text-white font-black italic">{coords.y}</span></div>
       <div className="flex flex-col"><span className="text-[6px] text-emerald-500 font-black uppercase">Alt_Z</span><span className="text-[10px] text-white font-black italic">{coords.z}</span></div>
    </div>
  );
};

export const SectorNodeComponent = ({ zone, isSelected, isSyncing, onClick }: { zone: ZoneNode, isSelected: boolean, isSyncing: boolean, onClick: () => void }) => {
  const glowColor = zone.load > 90 ? "rgba(244, 63, 94, 0.4)" : zone.load > 70 ? "rgba(245, 158, 11, 0.3)" : "rgba(99, 102, 241, 0.2)";
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateZ: 50 }}
      animate={isSyncing ? { opacity: [1, 0.5, 1], scale: [1, 1.05, 1] } : {}}
      transition={isSyncing ? { duration: 0.5, repeat: Infinity } : {}}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-700",
        "w-full aspect-[4/3] rounded-[1.8rem] border-2 overflow-hidden group",
        zone.status === 'CRITICAL' ? "border-rose-500/50 bg-rose-500/5" : 
        isSelected ? "border-white bg-indigo-600/20 shadow-[0_0_40px_rgba(99,102,241,0.4)]" : "border-white/5 bg-white/5 hover:border-indigo-500/40"
      )}
      style={{ boxShadow: isSelected ? `0 0 40px ${glowColor}` : "" }}
    >
      <div className="absolute inset-0 grid-pattern opacity-[0.05]" />
      
      <div className="absolute inset-0 p-4 grid grid-cols-4 gap-1.5 opacity-10 group-hover:opacity-30 transition-opacity">
         {Array.from({ length: 16 }).map((_, i) => (
           <div key={i} className={cn("w-full h-full rounded-sm", i < (zone.load / 6) ? "bg-indigo-500" : "bg-white/10")} />
         ))}
      </div>

      <div className="p-6 h-full flex flex-col justify-between relative z-10">
         <div className="flex justify-between items-start">
            <div>
               <div className="flex items-center gap-1.5 mb-0.5">
                  <PulseNode color={zone.status === 'CRITICAL' ? 'rose' : 'indigo'} />
                  <span className="text-[8px] font-black text-white italic opacity-40">{zone.id}</span>
               </div>
               <p className="text-[9px] font-black text-white uppercase tracking-[0.15em]">{zone.name}</p>
            </div>
            <div className={cn("p-2 rounded-xl bg-black/40 border border-white/5 transition-transform group-hover:rotate-12", zone.status === 'CRITICAL' && "text-rose-500")}>
               {zone.status === 'CRITICAL' ? <AlertCircle size={18} /> : <Database size={18} />}
            </div>
         </div>

         <div className="space-y-3">
            <div className="flex justify-between items-end">
               <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-1.5"><Cpu size={8}/> Buffer_Load</span>
               <span className={cn("text-lg font-black italic", zone.load > 90 ? "text-rose-500" : "text-white")}>{zone.load}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${zone.load}%` }} 
                 className={cn("h-full rounded-full", zone.load > 90 ? "bg-rose-500" : "bg-indigo-500 shadow-[0_0_10px_#6366f1]")} 
               />
            </div>
         </div>
      </div>
      
      <div className="absolute bottom-0 left-1/2 w-px h-0 bg-indigo-500/50 group-hover:h-24 transition-all duration-1000" />
    </motion.div>
  );
};
