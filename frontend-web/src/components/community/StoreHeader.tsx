import React from "react";
import { Store, ShieldCheck, ShoppingCart } from "lucide-react";
import { cn } from "../../lib/utils";

interface StoreHeaderProps {
  store: any;
  isFollowing: boolean;
  handleFollow: () => void;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

export const StoreHeader = ({ store, isFollowing, handleFollow, cartCount, setIsCartOpen, isRtl }: StoreHeaderProps) => (
  <header className="relative h-[250px] md:h-[400px] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-3xl border border-white/5 bg-slate-950 shrink-0">
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-overlay" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
    
    <div className={cn("absolute bottom-8 md:bottom-16 left-6 right-6 md:left-12 md:right-12 z-10 flex flex-col lg:flex-row items-end justify-between gap-6 md:gap-10", isRtl && "flex-row-reverse")}>
       <div className={cn("flex items-center gap-6 md:gap-10 w-full lg:w-auto", isRtl && "flex-row-reverse")}>
          <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2.5rem] bg-indigo-600 border-[4px] md:border-[6px] border-white/5 shadow-3xl overflow-hidden flex items-center justify-center shrink-0 relative group">
             {store?.logo ? <img src={store.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" /> : <Store size={60} className="text-white opacity-20" />}
          </div>
          <div className="min-w-0 space-y-2 md:space-y-4">
             <div className={cn("flex items-center gap-3 md:gap-5 flex-wrap", isRtl && "flex-row-reverse")}>
                <h1 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl truncate">{store?.name}</h1>
                <div className="px-3 md:px-5 py-1 md:py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 shadow-lg">
                   <ShieldCheck size={16} className="text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified</span>
                </div>
             </div>
             <p className="text-slate-400 text-sm md:text-xl font-medium italic max-w-2xl line-clamp-1 md:line-clamp-2 leading-relaxed opacity-80">"{store?.description || "Institutional-grade supply chain node."}"</p>
          </div>
       </div>

       <div className={cn("flex gap-3 md:gap-5", isRtl && "flex-row-reverse")}>
          <button 
            onClick={handleFollow}
            className={cn(
              "px-6 md:px-10 py-3 md:py-5 rounded-2xl md:rounded-[1.8rem] font-black uppercase text-[10px] md:text-xs tracking-widest transition-all shadow-2xl active:scale-95 border-none",
              isFollowing ? "bg-white/5 text-white border border-white/10" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30"
            )}
          >
             {isFollowing ? "Coupled" : "Couple Node"}
          </button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-3 md:p-5 bg-white text-indigo-600 rounded-2xl md:rounded-[1.8rem] shadow-2xl hover:scale-105 transition-all border-none active:scale-95 group">
             <ShoppingCart size={24} className="md:size-32 group-hover:rotate-6 transition-transform" />
             {cartCount > 0 && (
               <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full border-4 border-slate-950 shadow-xl animate-pulse">
                  {cartCount}
               </span>
             )}
          </button>
       </div>
    </div>
  </header>
);
