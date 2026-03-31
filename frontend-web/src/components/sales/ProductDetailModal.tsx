import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Package, ShoppingCart, Info, MapPin, 
  Tag, Box, Layers, History, Activity, 
  ShieldCheck, Zap, BarChart3, Star, 
  ChevronRight, Compass, Cpu, Database, PlusCircle
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductDetailModalProps {
  product: any;
  isRtl: boolean;
  currencySymbol: string;
  onClose: () => void;
  onAddToCart: (p: any) => void;
  t: (key: string) => string;
}

export const ProductDetailModal = ({ 
  product, isRtl, currencySymbol, onClose, onAddToCart, t 
}: ProductDetailModalProps) => {
  const [activeImg, setActiveImg] = useState(product.image || "");
  const gallery = product.gallery?.length > 0 ? [product.image, ...product.gallery].filter(Boolean) : [product.image].filter(Boolean);

  const stats = [
    { label: "Asset_Health", value: "98.4%", icon: Activity, color: "text-emerald-500" },
    { label: "Sync_Status", value: "Verified", icon: ShieldCheck, color: "text-indigo-500" },
    { label: "Velocity", value: "High", icon: Zap, color: "text-amber-500" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020205]/95 backdrop-blur-3xl overflow-y-auto custom-scrollbar">
       <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
       
       <motion.div 
         initial={{ scale: 0.95, opacity: 0, y: 30 }} 
         animate={{ scale: 1, opacity: 1, y: 0 }} 
         exit={{ scale: 0.95, opacity: 0, y: 30 }} 
         className="bg-white dark:bg-[#050508] w-full max-w-6xl rounded-[3.5rem] shadow-[0_0_150px_rgba(79,70,229,0.1)] relative border border-white/10 my-auto overflow-hidden"
       >
          <button onClick={onClose} className={cn("absolute top-8 p-4 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl transition-all duration-500 border-none shadow-xl z-50", isRtl ? "left-8" : "right-8")}>
             <X size={24} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
             
             {/* LEFT: HOLOGRAPHIC VISUALIZER */}
             <div className="lg:col-span-5 bg-slate-950 p-10 md:p-16 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.1),transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                
                <motion.div 
                  key={activeImg}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="relative group aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-4xl bg-[#020205]"
                >
                   {activeImg ? (
                     <img src={activeImg} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-white/5">
                        <Package size={120} strokeWidth={0.5} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] mt-8">No_Visual_Data</span>
                     </div>
                   )}
                   <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>

                {gallery.length > 1 && (
                  <div className="flex gap-4 mt-8 overflow-x-auto no-scrollbar pb-2">
                     {gallery.map((img: string, i: number) => (
                       <button key={i} onClick={() => setActiveImg(img)} className={cn("w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0", activeImg === img ? "border-indigo-500 scale-105 shadow-pro" : "border-transparent opacity-40 hover:opacity-100")}>
                          <img src={img} className="w-full h-full object-cover" alt="thumb" />
                       </button>
                     ))}
                  </div>
                )}

                <div className="mt-12 grid grid-cols-3 gap-4">
                   {stats.map((s, i) => (
                     <div key={i} className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-2">
                        <s.icon size={18} className={s.color} />
                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">{s.label}</span>
                        <span className="text-xs font-black text-white italic">{s.value}</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* RIGHT: TECHNICAL REGISTRY */}
             <div className="lg:col-span-7 p-10 md:p-20 flex flex-col justify-between bg-white dark:bg-[#050508]">
                <div className="space-y-10">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-indigo-500 font-black text-[10px] tracking-[0.6em] uppercase italic">
                         <Database size={16} /> Asset_Metadata_v9.4
                      </div>
                      <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-[0.85]">
                         {product.name}
                      </h2>
                      <div className="flex flex-wrap gap-3 pt-2">
                         <div className="px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-[9px] font-black text-indigo-500 uppercase tracking-widest italic flex items-center gap-2">
                            <Tag size={12} /> {typeof product.category === 'object' ? product.category?.name : (product.category || "Général")}
                         </div>
                         <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                            SKU: {product.sku}
                         </div>
                      </div>
                   </div>

                   <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-bold italic uppercase tracking-tight leading-relaxed opacity-80 border-l-4 border-indigo-600/30 pl-8">
                      {product.description || "No strategic description provisioned for this asset node. System defaulting to generic operational parameters."}
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-inner"><MapPin size={20} /></div>
                            <div>
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Zone_ID</p>
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{product.location || "Sector_Delta_01"}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-inner"><Box size={20} /></div>
                            <div>
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Lattice_Density</p>
                               <p className={cn("text-sm font-black uppercase italic", product.quantity > 0 ? "text-emerald-500" : "text-rose-500")}>
                                  {product.quantity} Units_Available
                               </p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors shadow-inner"><Cpu size={20} /></div>
                            <div>
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Processor_Node</p>
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{product.brand || "Industrial_Standard"}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shadow-inner"><History size={20} /></div>
                            <div>
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Last_Registry_Sync</p>
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">0x_LATEST_SYNC</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-16 pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
                   <div className="text-center md:text-left">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-3 italic">Valuation_Per_Unit</p>
                      <p className="text-6xl font-black text-indigo-500 italic tracking-tighter leading-none">
                         {product.price?.toLocaleString()} <span className="text-xl not-italic text-slate-400 opacity-40 ml-2 uppercase tracking-widest">{currencySymbol}</span>
                      </p>
                   </div>
                   
                   <button 
                     onClick={() => { onAddToCart(product); onClose(); }}
                     disabled={product.quantity <= 0}
                     className="w-full md:w-auto group relative px-16 py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-sm tracking-[0.4em] shadow-[0_30px_100px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden border-none"
                   >
                      <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="relative z-10 flex items-center justify-center gap-4">
                         <ShoppingCart size={24} fill="currentColor" /> Provision_Asset
                      </span>
                   </button>
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
};
