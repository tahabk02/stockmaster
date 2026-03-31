import React from "react";
import { cn } from "../../lib/utils";

interface CategoryCardProps {
  id: string;
  name: string;
  icon: any;
  selected: boolean;
  onClick: (id: string) => void;
}

export const CategoryCard = ({ id, name, icon: Icon, selected, onClick }: CategoryCardProps) => (
  <button 
    onClick={() => onClick(id)} 
    className={cn(
      "flex flex-col items-center justify-center min-w-[70px] h-[70px] rounded-2xl border transition-all gap-1.5 shrink-0 border-none bg-transparent",
      selected 
        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
        : "bg-white dark:bg-[#111b21] border-slate-100 dark:border-white/5 text-slate-400 hover:border-indigo-500/40"
    )}
  >
    <Icon size={16} className={cn(selected ? "text-white" : "text-slate-400")} />
    <span className="text-[7px] font-black uppercase truncate w-full px-1 text-center tracking-widest">{name}</span>
  </button>
);
