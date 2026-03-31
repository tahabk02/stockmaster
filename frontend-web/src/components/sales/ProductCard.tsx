import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Info, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

export const ProductImageSlideshow = ({ images }: { images: string[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1 h-1 rounded-full transition-all duration-500",
                i === index ? "bg-white w-3" : "bg-white/40"
              )} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface Product {
  _id: string; 
  name: string; 
  sku: string; 
  category: any; 
  price: number;
  quantity: number; 
  image?: string; 
  gallery?: string[];
  cartQty: number;
}

interface ProductCardProps {
  p: Product;
  isRtl: boolean;
  currencySymbol: string;
  onAddToCart: (p: Product) => void;
  onShowInfo: (p: Product) => void;
}

export const ProductCard = ({ p, isRtl, currencySymbol, onAddToCart, onShowInfo }: ProductCardProps) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className={cn("bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 p-4 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all cursor-pointer group flex flex-col relative overflow-hidden", isRtl && "text-right")}
  >
     <div onClick={() => p.quantity > 0 && onAddToCart(p)} className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden mb-4 relative shrink-0 border border-slate-100 dark:border-white/5 group-hover:border-indigo-500/30 transition-all">
        {p.image || (p.gallery && p.gallery.length > 0) ? (
          <ProductImageSlideshow images={[p.image, ...(p.gallery || [])].filter(Boolean) as string[]} />
        ) : (
          <Package size={32} className="m-auto absolute inset-0 text-slate-200 dark:text-slate-800" />
        )}
        
        <div className={cn("absolute top-3", isRtl ? "right-3" : "left-3")}><span className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[6px] font-black uppercase text-indigo-600 border border-white/50 shadow-sm">{(p.category && typeof p.category === 'object') ? (p.category as any).name : 'Asset'}</span></div>
        {p.quantity === 0 && <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center"><span className="text-[8px] font-black uppercase text-white bg-rose-600 px-3 py-1 rounded-xl shadow-lg">Depleted</span></div>}
        
        <button 
          onClick={(e) => { e.stopPropagation(); onShowInfo(p); }}
          className={cn("absolute top-3 p-2 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-lg text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20 border-none", isRtl ? "left-3" : "right-3")}
        >
           <Info size={14} />
        </button>
     </div>
     <div onClick={() => p.quantity > 0 && onAddToCart(p)} className="flex-1 flex flex-col space-y-3">
        <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase italic tracking-tighter truncate leading-none">{p.name}</h3>
        <div className={cn("flex justify-between items-end", isRtl && "flex-row-reverse")}>
           <div className={isRtl ? "text-right" : "text-left"}>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Value Node</p>
              <p className="text-base font-black text-indigo-600 italic leading-none">{p.price.toLocaleString()} <span className="text-[8px] not-italic opacity-50">{currencySymbol}</span></p>
           </div>
           <div className={cn(
             "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border",
             p.quantity < 10 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent"
           )}>{p.quantity} Units</div>
        </div>
     </div>
     <div className={cn("absolute -bottom-1 p-2 bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0", isRtl ? "-left-1 rounded-tr-2xl" : "-right-1 rounded-tl-2xl")}><Plus size={16} /></div>
  </motion.div>
);
