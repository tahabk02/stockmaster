import React from "react";
import { cn } from "../../../lib/utils";

interface SectionHeaderProps {
  label: string;
  collapsed: boolean;
  isRtl: boolean;
}

export const SectionHeader = ({ label, collapsed, isRtl }: SectionHeaderProps) => {
  if (collapsed) return <div className="h-px bg-slate-200 dark:bg-white/5 my-6 mx-3" />;
  return (
    <div className={cn("relative flex items-center gap-3 mb-3 mt-6 px-1 group", isRtl && "flex-row-reverse")}>
       <div className="flex flex-col gap-0.5">
          <div className="w-3 h-0.5 bg-indigo-600 rounded-full" />
          <div className="w-1.5 h-0.5 bg-slate-300 dark:bg-white/20 rounded-full transition-all group-hover:w-4" />
       </div>
       <p className={cn("text-[7px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] italic opacity-40 group-hover:opacity-100 transition-opacity", isRtl && "text-right")}>
          {label}
       </p>
       <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
    </div>
  );
};
