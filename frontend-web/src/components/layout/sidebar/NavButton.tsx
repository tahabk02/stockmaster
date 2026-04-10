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
  accent?: "emerald" | "sky" | "amber" | "rose" | "primary";
}

export const NavButton = ({
  icon,
  label,
  active,
  collapsed,
  isRtl,
  onClick,
  badge,
  accent = "primary",
}: NavButtonProps) => {
  const accentClass = {
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    amber: "text-amber-500",
    rose: "text-rose-500",
    primary: "text-indigo-600",
  }[accent];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 group relative mb-1 border border-transparent overflow-visible bg-transparent",
        active
          ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white border-slate-200/60 dark:border-white/10 shadow-sm z-20"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5",
        isRtl && "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "relative z-10 shrink-0 transition-all duration-300",
          active
            ? "text-indigo-600 dark:text-white scale-110"
            : `${accentClass} group-hover:scale-110`,
        )}
      >
        {React.cloneElement(icon as any, { size: 18, strokeWidth: 2.5 })}
      </div>

      {!collapsed && (
        <span
          className={cn(
            "relative z-10 text-[10px] font-black uppercase tracking-wider italic transition-all duration-300",
            active
              ? "opacity-100 text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white",
            isRtl ? "text-right" : "text-left",
          )}
        >
          {label}
        </span>
      )}

      {badge && !collapsed && (
        <span className="relative z-10 ml-auto bg-indigo-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );

};
