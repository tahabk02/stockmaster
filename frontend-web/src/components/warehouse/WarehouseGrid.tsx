import React, { useRef } from "react";
import { Scan, Maximize2, RefreshCcw } from "lucide-react";
import { LaserScannerArray, XYZTracker, SectorNodeComponent } from "./WarehouseUI";
import type { ZoneNode } from "./WarehouseUI";

interface WarehouseGridProps {
  zones: ZoneNode[];
  selectedZone: ZoneNode | null;
  setSelectedZone: (zone: ZoneNode | null) => void;
  isSyncing: boolean;
}

export const WarehouseGrid = ({ zones, selectedZone, setSelectedZone, isSyncing }: WarehouseGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="xl:col-span-8 bg-slate-950 p-8 rounded-[3rem] border border-white/10 shadow-4xl relative overflow-hidden perspective-[2500px]">
      <div className="absolute inset-0 grid-pattern opacity-10" /><LaserScannerArray /><XYZTracker containerRef={containerRef} />
      <div className="relative z-10 flex justify-between items-center mb-10">
         <div className="space-y-2"><h3 className="text-xl md:text-2xl font-black uppercase italic text-white flex items-center gap-4"><Scan className="text-indigo-500" size={24} /> Visualizer_Live</h3></div>
         <div className="flex gap-4">
            <button className="p-3.5 bg-white/5 text-slate-400 rounded-2xl border border-white/10 hover:text-white transition-all shadow-xl active:scale-90"><Maximize2 size={18} /></button>
            <button className="p-3.5 bg-white/5 text-slate-400 rounded-2xl border border-white/10 hover:text-white transition-all shadow-xl active:scale-90"><RefreshCcw size={18} /></button>
         </div>
      </div>
      <div className="relative z-10 transform-gpu rotate-x-[40deg] rotate-z-[-15deg] scale-90 grid grid-cols-2 md:grid-cols-3 gap-8 pb-20 origin-center">
         {zones.map((zone) => (
           <SectorNodeComponent key={zone.id} zone={zone} isSelected={selectedZone?.id === zone.id} isSyncing={isSyncing} onClick={() => setSelectedZone(zone)} />
         ))}
      </div>
    </div>
  );
};
