import React from "react";
import { Share2 } from "lucide-react";
import { ForensicLabel } from "../team/TeamUI";

export const WarehouseFooter = () => {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-center py-6 opacity-30 border-t border-white/5 relative overflow-hidden gap-4">
       <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
       <div className="flex flex-wrap justify-center gap-6 md:gap-10 relative z-10">
          <ForensicLabel label="SPATIAL_COGNITION_v5.0" />
          <ForensicLabel label="ISO_ENGINE_MAX" />
          <ForensicLabel label="NEURAL_PATHWAY" />
       </div>
       <div className="flex items-center gap-3 relative z-10">
          <Share2 size={12} className="text-indigo-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em]">Broadcasting Secure Stream</span>
       </div>
    </footer>
  );
};
