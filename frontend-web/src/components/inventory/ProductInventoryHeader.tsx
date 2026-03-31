import React from "react";
import { motion } from "framer-motion";
import { Tag, PlusCircle, LayoutGrid, List as ListIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductInventoryHeaderProps {
  isAdmin: boolean;
  editingId: string | null;
  viewMode: "GRID" | "LIST";
  setViewMode: (mode: "GRID" | "LIST") => void;
  onOpenCategory: () => void;
  onOpenAdd: () => void;
  t: (key: string) => string;
}

export const ProductInventoryHeader = ({ 
  isAdmin, editingId, viewMode, setViewMode, onOpenCategory, onOpenAdd, t 
}: ProductInventoryHeaderProps) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 md:px-0">
    <div>
      <h1 className="text-xl md:text-3xl text-indigo-950 dark:text-white transition-colors font-black uppercase italic tracking-tighter">
        {t('products.title')} <span className="text-indigo-600">{t('products.subtitle')}.</span>
      </h1>
      <p className="text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mt-1 italic">{t('products.protocol')}</p>
    </div>
    {isAdmin && (
      <div className="flex gap-2 w-full sm:w-auto">
        <div className="bg-white dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/60 dark:border-white/5 flex gap-1 shadow-sm">
           <button onClick={() => setViewMode("GRID")} className={cn("p-2 rounded-lg transition-all border-none bg-transparent", viewMode === "GRID" ? "bg-black text-white shadow-md dark:bg-white dark:text-black" : "text-slate-400")}><LayoutGrid size={14}/></button>
           <button onClick={() => setViewMode("LIST")} className={cn("p-2 rounded-lg transition-all border-none bg-transparent", viewMode === "LIST" ? "bg-black text-white shadow-md dark:bg-white dark:text-black" : "text-slate-400")}><ListIcon size={14}/></button>
        </div>
        <button onClick={onOpenCategory} className="btn-outline border-none bg-white dark:bg-white/5"><Tag size={12} /> {t('products.categories')}</button>
        <button onClick={onOpenAdd} className="btn-pro border-none"><PlusCircle size={12} /> {editingId ? t('common.update') : t('products.add')}</button>
      </div>
    )}
  </motion.div>
);
