import React from "react";
import { cn } from "../../../lib/utils";

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
  isRtl?: boolean;
}

export const NeonInput = ({ 
  icon, 
  label, 
  className, 
  isRtl,
  ...props 
}: NeonInputProps) => {
  return (
    <div className={cn("group space-y-2", className)}>
      {label && (
        <label className={cn(
          "text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-focus-within:text-indigo-500 transition-colors block ml-1",
          isRtl && "text-right mr-1 ml-0"
        )}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          {...props}
          className={cn(
            "w-full bg-slate-50 dark:bg-black/40 border border-transparent rounded-2xl py-4 text-xs font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner",
            "focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10",
            icon && (isRtl ? "pr-12 pl-4" : "pl-12 pr-4"),
            isRtl && "text-right",
            className
          )}
        />
        
        {icon && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all duration-300",
            isRtl ? "right-4" : "left-4",
            "group-focus-within:scale-110"
          )}>
            {icon}
          </div>
        )}

        {/* Active Line Indicator */}
        <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-indigo-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center rounded-full opacity-50" />
      </div>
    </div>
  );
};
