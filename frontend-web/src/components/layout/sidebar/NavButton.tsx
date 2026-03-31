import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";

interface NavButtonProps {
  icon: React.ReactElement;
  label: string;
  active: boolean;
  collapsed: boolean;
  isRtl: boolean;
  onClick: () => void;
  badge?: string;
}

export const NavButton = ({ icon, label, active, collapsed, isRtl, onClick, badge }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-500 group relative mb-1 border-none overflow-visible bg-transparent",
      active 
        ? "text-white scale-[1.02] z-20" 
        : "text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-white",
      isRtl && "flex-row-reverse"
    )}
  >
    {/* KINETIC BACKGROUND */}
    <AnimatePresence>
      {active && (
        <motion.div 
          layoutId="kinetic-bg"
          className="absolute inset-0 bg-slate-950 dark:bg-white rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.3)] dark:shadow-[0_5px_15px_rgba(255,255,255,0.1)] -skew-x-1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        />
      )}
    </AnimatePresence>

    {/* LASER BORDER EFFECT */}
    <div className={cn(
      "absolute inset-0 rounded-lg border border-dashed border-slate-300 dark:border-white/10 transition-all duration-500 group-hover:border-indigo-500/50 group-hover:skew-x-1",
      active && "border-none"
    )} />

    <div className={cn(
      "relative z-10 shrink-0 transition-all duration-700",
      active ? "text-indigo-400 dark:text-indigo-600 scale-105" : "group-hover:rotate-6 group-hover:scale-105"
    )}>
      {React.cloneElement(icon as any, { size: 16, strokeWidth: 2.5 })}
    </div>

    {!collapsed && (
      <span className={cn(
        "relative z-10 text-[9px] font-black uppercase tracking-[0.15em] italic transition-all duration-500",
        active ? "opacity-100" : "opacity-70 group-hover:opacity-100 group-hover:tracking-[0.2em]",
        isRtl ? "text-right" : "text-left"
      )}>
        {label}
      </span>
    )}

    {badge && !collapsed && (
      <span className="relative z-10 ml-auto bg-indigo-600 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white/20">
        {badge}
      </span>
    )}
  </button>
);
