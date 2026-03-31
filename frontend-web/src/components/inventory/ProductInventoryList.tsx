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
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-pro mx-2 md:mx-0">
     <div className="overflow-x-auto custom-scrollbar">
        <table className={cn("w-full text-left border-collapse", isRtl && "text-right")}>
           <thead className="bg-slate-50 dark:bg-slate-950 text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] border-b border-slate-100 dark:border-white/5">
              <tr>
                 <th className="p-5">Asset Descriptor</th>
                 <th className="p-5">Valuation</th>
                 <th className="p-5">Density</th>
                 <th className="p-5">Node Cluster</th>
                 <th className="p-5 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {products.map((p, i) => (
                <tr key={p._id || i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-default">
                   <td className="p-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-white/5">{p.image && <img src={p.image} className="w-full h-full object-cover" alt="" />}</div><span className="font-black text-xs text-slate-950 dark:text-white uppercase italic tracking-tighter truncate max-w-[150px]">{p.name}</span></div></td>
                   <td className="p-5 font-black text-indigo-600 dark:text-indigo-400 italic">{p.price?.toLocaleString()} DH</td>
                   <td className="p-5"><span className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", p.quantity < 10 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>{p.quantity} Units</span></td>
                   <td className="p-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[100px]">{(p.category && typeof p.category === 'object') ? (p.category as any).name : 'Unassigned'}</td>
                   <td className="p-5">
                     <div className="flex justify-end gap-2">
                       <button onClick={() => onView(p)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-90 border-none bg-transparent"><Eye size={14}/></button>
                       <button onClick={() => onEdit(p)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-90 border-none bg-transparent"><SquarePen size={14}/></button>
                     </div>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
     </div>
  </div>
);
