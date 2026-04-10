import React from "react";
import { Eye, SquarePen } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductInventoryListProps {
  products: any[];
  isRtl: boolean;
  onView: (p: any) => void;
  onEdit: (p: any) => void;
}

export const ProductInventoryList = ({ products, isRtl, onView, onEdit }: ProductInventoryListProps) => (
  <div className="w-full space-y-4">
    {/* Desktop Table View */}
    <div className="hidden md:block theme-card rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
       <div className="overflow-x-auto custom-scrollbar">
          <table className={cn("pro-table w-full", isRtl && "text-right")}>
             <thead>
                <tr>
                   <th>Asset Descriptor</th>
                   <th>Valuation</th>
                   <th>Density</th>
                   <th>Node Cluster</th>
                   <th className="text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {products.map((p, i) => (
                  <tr key={p._id || i} className="group cursor-default hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                     <td>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-white/5 shrink-0">
                              {p.image && <img src={p.image} className="w-full h-full object-cover" alt="" width={40} height={40} />}
                           </div>
                           <span className="font-black text-xs text-slate-950 dark:text-white uppercase italic tracking-tighter truncate max-w-[150px]">
                              {p.name}
                           </span>
                        </div>
                     </td>
                     <td className="font-black text-indigo-600 dark:text-indigo-400 italic tabular-nums">
                        {p.price?.toLocaleString()} DH
                     </td>
                     <td>
                        <span className={cn(
                           "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border inline-block", 
                           p.quantity < 10 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}>
                           {p.quantity} Units
                        </span>
                     </td>
                     <td className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[100px]">
                        {(p.category && typeof p.category === 'object') ? (p.category as any).name : 'Unassigned'}
                     </td>
                     <td>
                       <div className="flex justify-end gap-2">
                         <button onClick={() => onView(p)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-90 border-none bg-transparent shadow-sm"><Eye size={14}/></button>
                         <button onClick={() => onEdit(p)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-90 border-none bg-transparent shadow-sm"><SquarePen size={14}/></button>
                       </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>

    {/* Mobile Card View */}
    <div className="grid grid-cols-1 gap-4 md:hidden px-2">
       {products.map((p, i) => (
         <div key={p._id || i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden bg-slate-100 dark:bg-slate-950 border border-white/5 shrink-0 shadow-inner">
                  {p.image && <img src={p.image} className="w-full h-full object-cover" alt="" width={64} height={64} />}
               </div>
               <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm text-slate-950 dark:text-white uppercase italic tracking-tighter truncate mb-1">{p.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {(p.category && typeof p.category === 'object') ? (p.category as any).name : 'Unassigned'}
                  </p>
               </div>
            </div>
            
            <div className="flex justify-between items-end border-t border-slate-50 dark:border-white/5 pt-4">
               <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valuation</p>
                  <p className="font-black text-indigo-600 dark:text-indigo-400 italic">{p.price?.toLocaleString()} DH</p>
               </div>
               <div className="space-y-1 text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Density</p>
                  <span className={cn(
                     "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border inline-block", 
                     p.quantity < 10 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  )}>
                     {p.quantity} Units
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
               <button onClick={() => onView(p)} className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase text-[9px] tracking-widest border-none transition-all active:scale-95"><Eye size={14}/> View</button>
               <button onClick={() => onEdit(p)} className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest border-none transition-all active:scale-95 shadow-lg shadow-indigo-500/20"><SquarePen size={14}/> Edit</button>
            </div>
         </div>
       ))}
    </div>
  </div>
);

