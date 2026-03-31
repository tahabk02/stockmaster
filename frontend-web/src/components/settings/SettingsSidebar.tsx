import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface SettingsSidebarProps {
  menuItems: any[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  isRtl: boolean;
}

export const SettingsSidebar = ({ menuItems, activeTab, setActiveTab, isRtl }: SettingsSidebarProps) => (
  <aside className="lg:col-span-4 space-y-4">
    {menuItems.map((item) => (
      <button 
        key={item.id} 
        onClick={() => setActiveTab(item.id)} 
        className={cn(
          "w-full flex items-center justify-between p-6 rounded-[2rem] transition-all duration-500 group border-none bg-transparent", 
          activeTab === item.id 
            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl scale-105" 
            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5"
        )}
      >
        <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
          <div className={cn("p-3 rounded-2xl transition-all", activeTab === item.id ? 'bg-indigo-600 shadow-lg' : 'bg-slate-50 dark:bg-slate-950')}>
             <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-slate-400'} />
          </div>
          <p className="font-black text-sm uppercase italic tracking-tight">{item.label}</p>
        </div>
        <ChevronRight size={18} className={cn("transition-transform", isRtl ? "rotate-180" : "", activeTab === item.id && "translate-x-1")} />
      </button>
    ))}
  </aside>
);
