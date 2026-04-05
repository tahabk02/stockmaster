import React from "react";
import { motion } from "framer-motion";
import { Palette, Type, Check, RefreshCw } from "lucide-react";
import { useThemeStore } from "../../store/theme.slice";
import { cn } from "../../lib/utils";

const COLORS = [
  { name: "Indigo Protocol", hex: "#4f46e5" },
  { name: "Crimson Sector", hex: "#e11d48" },
  { name: "Emerald Grid", hex: "#10b981" },
  { name: "Amber Alert", hex: "#f59e0b" },
  { name: "Violet Vision", hex: "#7c3aed" },
  { name: "Slate Stealth", hex: "#475569" },
];

const FONTS = [
  { name: "Inter (Standard)", value: "Inter, system-ui, sans-serif" },
  { name: "Orbitron (Futuristic)", value: "Orbitron, sans-serif" },
  { name: "JetBrains (Tech)", value: "JetBrains Mono, monospace" },
  { name: "Montserrat (Clean)", value: "Montserrat, sans-serif" },
];

export const SignalCorporateSettings = ({ t, isRtl }: any) => {
  const { primaryColor, fontFamily, setCorporateStyling } = useThemeStore();

  const resetToDefault = () => {
    setCorporateStyling({
      primaryColor: "#4f46e5",
      fontFamily: "Inter, system-ui, sans-serif"
    });
  };

  return (
    <div className="space-y-12">
      <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6", isRtl && "md:flex-row-reverse")}>
        <div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter mb-2">Signal Corporate</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Global_Aesthetic_Calibration</p>
        </div>
        <button 
          onClick={resetToDefault}
          className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 transition-all border-none"
        >
          <RefreshCw size={14} /> Reset to Factory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Color Palette */}
        <div className="space-y-8">
           <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><Palette size={20} /></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300">Color Spectrum</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setCorporateStyling({ primaryColor: color.hex })}
                  className={cn(
                    "relative p-4 rounded-[1.5rem] border transition-all flex flex-col items-center gap-3 group overflow-hidden",
                    primaryColor === color.hex 
                      ? "bg-white dark:bg-white/5 border-indigo-500/50 shadow-xl" 
                      : "bg-slate-50 dark:bg-black/20 border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  )}
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-inner relative z-10" 
                    style={{ backgroundColor: color.hex }}
                  >
                    {primaryColor === color.hex && (
                      <div className="absolute inset-0 flex items-center justify-center text-white bg-black/20 rounded-full backdrop-blur-[2px]">
                        <Check size={20} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 relative z-10">{color.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
           </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-8">
           <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><Type size={20} /></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300">Typography Matrix</h3>
           </div>

           <div className="space-y-3">
              {FONTS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setCorporateStyling({ fontFamily: font.value })}
                  className={cn(
                    "w-full p-6 rounded-2xl border transition-all flex items-center justify-between group overflow-hidden",
                    fontFamily === font.value 
                      ? "bg-white dark:bg-white/5 border-indigo-500/50 shadow-xl" 
                      : "bg-slate-50 dark:bg-black/20 border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  )}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white" style={{ fontFamily: font.value }}>{font.name}</span>
                  {fontFamily === font.value && <div className="p-1 bg-indigo-500 rounded-full text-white"><Check size={12} strokeWidth={4} /></div>}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10">
         <div className={cn("flex items-center gap-4 mb-6", isRtl && "flex-row-reverse")}>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 italic">Live Preview System</h4>
         </div>
         <div className="bg-white dark:bg-black/40 p-8 rounded-[2rem] shadow-inner border border-white/5 space-y-4">
            <h5 className="text-2xl font-black uppercase italic" style={{ color: primaryColor, fontFamily: fontFamily }}>Corporate Identity Protocol</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed" style={{ fontFamily: fontFamily }}>
               This interface represents the unified visual standard of StockMaster Pro. 
               All modules will inherit these core aesthetic parameters for cross-lattice consistency.
            </p>
            <div className="flex gap-4">
               <button className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border-none" style={{ backgroundColor: primaryColor }}>Primary Action</button>
               <button className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 text-slate-500 bg-transparent">Secondary Node</button>
            </div>
         </div>
      </div>
    </div>
  );
};
