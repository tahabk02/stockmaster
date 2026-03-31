import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/client";
import {
  Loader2, Package, Search, ShoppingCart, Info, Trash2, Activity, Layers, ShoppingBag,
  Zap, MapPin, Cpu, Filter as FilterIcon, X, Download, Eye, Clock, Database, Tag as TagIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "../store/tenant.slice";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { CategoryCard } from "../components/sales/CategoryCard";
import { ProductCard } from "../components/sales/ProductCard";
import { CartItem } from "../components/sales/CartItem";
import { ProductDetailModal } from "../components/sales/ProductDetailModal";
import { CheckoutModal } from "../components/sales/CheckoutModal";
import { OrderDetailModal } from "../components/sales/OrderDetailModal";

// --- Types ---
interface Category { _id: string; name: string; slug: string; icon?: string; }
interface Product { _id: string; name: string; sku: string; category: Category | string; price: number; quantity: number; image?: string; gallery?: string[]; cartQty: number; location?: string; description?: string; }
interface Customer { _id: string; name: string; email?: string; phone?: string; }

export const Sales = () => {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const isBlackFriday = tenant?.blackFriday?.active;
  const bfDiscount = tenant?.blackFriday?.discountPercentage || 0;
  const currencySymbol = tenant?.currency?.symbol || "DH";

  const [activeTab, setActiveTab] = useState<"TERMINAL" | "REGISTRY">("TERMINAL");
  const [isCartOpen, setIsCartOpen] = useState(window.innerWidth > 1440);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isCatExpanded, setIsCatExpanded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "CHEQUE" | "TRANSFER">("CASH");
  const [processing, setProcessing] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => item.price * item.cartQty + sum, 0), [cart]);
  const discountAmount = isBlackFriday ? (subtotal * bfDiscount / 100) : 0;
  const taxAmount = (subtotal - discountAmount) * 0.02;
  const totalOrder = subtotal - discountAmount + taxAmount;

  const loadTerminalData = useCallback(async () => {
    try { 
      setLoading(true); 
      const [pRes, cRes] = await Promise.all([api.get("/products"), api.get("/categories")]);
      setProducts(pRes.data.data || []); setCategories(cRes.data || []);
    } catch (e) { toast.error(t('errors.networkError')); } finally { setLoading(false); }
  }, [t]);

  const loadRegistryData = useCallback(async () => {
    try { setLoading(true); const { data } = await api.get("/orders"); setOrders(data.data || []); } 
    catch (e) { toast.error(t('errors.serverError')); } finally { setLoading(false); }
  }, [t]);

  const fetchCustomers = useCallback(async () => {
    try { const { data } = await api.get("/clients"); setCustomers(data.clients || []); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { activeTab === "TERMINAL" ? loadTerminalData() : loadRegistryData(); }, [activeTab, loadTerminalData, loadRegistryData]);
  useEffect(() => { if (showCheckout) fetchCustomers(); }, [showCheckout, fetchCustomers]);

  const addToCart = (p: Product) => {
    const ex = cart.find(i => i._id === p._id);
    if (ex && ex.cartQty >= p.quantity) return toast.error(t('products.messages.outOfStock'));
    setCart(ex ? cart.map(i => i._id === p._id ? { ...i, cartQty: i.cartQty + 1 } : i) : [...cart, { ...p, cartQty: 1 }]);
  };

  const handleCheckout = async (extraData?: any) => {
    if (cart.length === 0) return;
    setProcessing(true);
    const toastId = toast.loading("Broadcasting Commitment Protocol...");
    try {
      await api.post("/orders", { 
        items: cart.map(i => ({ productId: i._id, quantity: i.cartQty, price: i.price })), 
        paymentMethod, 
        totalPrice: totalOrder, 
        clientId: selectedCustomer?._id, 
        status: "CONFIRMED",
        metadata: {
          ...extraData,
          source: "POS_HARD_SYSTEM",
          lattice_version: "9.4"
        }
      });
      toast.success("Deployment Signal Confirmed.", { id: toastId });
      setCart([]); setSelectedCustomer(null); setShowCheckout(false); loadTerminalData();
    } catch (e: any) { 
      toast.error(e.response?.data?.message || t('errors.serverError'), { id: toastId }); 
    } finally { 
      setProcessing(false); 
    }
  };

  const isRtl = i18n.language === 'ar';
  
  const filteredCategories = useMemo(() => {
    return categories.filter(c => c && c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const mSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
    const mLoc = (p.location || "").toLowerCase().includes(locationSearch.toLowerCase());
    const pCatId = (p.category && typeof p.category === 'object') ? (p.category as any)?._id : p.category;
    return mSearch && mLoc && (selectedCategory === "all" || pCatId === selectedCategory);
  });

  const filteredOrders = orders.filter(o => {
    if (!o) return false;
    const searchLower = searchTerm.toLowerCase();
    const idMatch = (o._id || "").toLowerCase().includes(searchLower);
    const clientMatch = (o.clientId?.name || "Anonymous").toLowerCase().includes(searchLower);
    return idMatch || clientMatch;
  });

  return (
    <div className={cn("flex flex-col h-[calc(100vh-100px)] bg-[#f8fafc] dark:bg-[#020205] overflow-hidden transition-all rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl relative", isRtl ? 'text-right' : 'text-left')}>
      <div className="absolute inset-0 grid-pattern opacity-[0.03] dark:opacity-[0.08] pointer-events-none" />
      
      <header className="h-20 bg-white/80 dark:bg-[#020205]/80 backdrop-blur-3xl border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-8 shrink-0 z-30 transition-all">
        <div className={cn("flex items-center gap-10", isRtl && "flex-row-reverse")}>
           <div className={cn("flex flex-col min-w-0", isRtl && "text-right")}>
              <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter leading-none truncate">
                 Signal <span className="text-indigo-600">Hub.</span>
              </h2>
              <div className={cn("flex items-center gap-2 mt-2", isRtl && "flex-row-reverse")}>
                 <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                 <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.5em] truncate italic">{tenant?.name || "STOCKMASTER"}_NODE_v9.4</span>
              </div>
           </div>

           <div className={cn("flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-transparent dark:border-white/5 shadow-inner", isRtl && "flex-row-reverse")}>
             <button 
                onClick={() => setActiveTab("TERMINAL")} 
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-none relative overflow-hidden group",
                  activeTab === "TERMINAL" ? "bg-slate-950 dark:bg-white text-white dark:text-black shadow-2xl scale-105" : "text-slate-500 hover:text-indigo-500 bg-transparent"
                )}
             >
                <span className="relative z-10">{t('sales.terminal')}</span>
                {activeTab === "TERMINAL" && <div className="absolute inset-0 bg-indigo-600 opacity-20 animate-pulse pointer-events-none" />}
             </button>
             <button 
                onClick={() => setActiveTab("REGISTRY")} 
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-none relative overflow-hidden",
                  activeTab === "REGISTRY" ? "bg-slate-950 dark:bg-white text-white dark:text-black shadow-2xl scale-105" : "text-slate-500 hover:text-indigo-500 bg-transparent"
                )}
             >
                <span className="relative z-10">{t('sales.registry')}</span>
                {activeTab === "REGISTRY" && <div className="absolute inset-0 bg-indigo-600 opacity-20 animate-pulse pointer-events-none" />}
             </button>
           </div>
        </div>
        
        <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
           <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
              <div className="relative">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full relative" />
              </div>
              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-[0.4em] italic leading-none">Lattice_Sync_Ok</span>
           </div>
           
           <button 
             onClick={() => setIsCartOpen(!isCartOpen)} 
             className={cn(
               "relative p-4 rounded-2xl transition-all border border-transparent active:scale-95 shadow-pro group",
               isCartOpen ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:border-indigo-500/30'
             )}
           >
              <ShoppingCart size={22} className="group-hover:rotate-12 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black w-7 h-7 flex items-center justify-center rounded-xl border-2 border-white dark:border-[#020205] shadow-2xl animate-reveal">
                   {cart.reduce((a,b) => a+b.cartQty, 0)}
                </span>
              )}
           </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 transition-all">
          <div className="p-8 space-y-6 shrink-0 bg-white/30 dark:bg-white/[0.02] backdrop-blur-3xl border-b border-slate-100 dark:border-white/5 relative">
             <div className={cn("flex flex-col xl:flex-row gap-4", isRtl && "xl:flex-row-reverse")}>
                <div className="relative flex-[3] group">
                   <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors", isRtl ? "right-6" : "left-6")} size={20} />
                   <input 
                      placeholder={activeTab === 'TERMINAL' ? "SCAN_PRODUCT_LATTICE_NODE..." : "SCAN_TRANSACTION_ID_TRACE..."} 
                      className={cn("w-full bg-white dark:bg-black/40 rounded-[1.8rem] border border-slate-100 dark:border-white/10 py-5 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner transition-all italic", isRtl ? "pr-16 text-right" : "pl-16 pr-6")} 
                      value={searchTerm} 
                      onChange={(e)=>setSearchTerm(e.target.value)} 
                   />
                </div>
                {activeTab === 'TERMINAL' && (
                   <div className="relative flex-1 group">
                      <MapPin className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors", isRtl ? "right-6" : "left-6")} size={20} />
                      <input 
                         placeholder="ZONE_ID..." 
                         className={cn("w-full bg-white dark:bg-black/40 rounded-[1.8rem] border border-slate-100 dark:border-white/10 py-5 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner transition-all italic", isRtl ? "pr-16 text-right" : "pl-16 pr-6")} 
                         value={locationSearch} 
                         onChange={(e)=>setLocationSearch(e.target.value)} 
                      />
                   </div>
                )}
             </div>
             {activeTab === 'TERMINAL' && (
               <div className={cn("flex flex-col gap-4", isRtl && "items-end")}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-xs group">
                        <TagIcon className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-4" : "left-4")} size={14} />
                        <input 
                          placeholder="FILTER_TIER..." 
                          className={cn("w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner", isRtl ? "pr-10 text-right" : "pl-10")}
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                        />
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{filteredCategories.length} Tiers Intercepted</span>
                    </div>
                    <button 
                      onClick={() => setIsCatExpanded(!isCatExpanded)}
                      className="px-4 py-2 bg-indigo-600/10 text-indigo-600 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border-none"
                    >
                      {isCatExpanded ? "Compact View" : "Expand All"}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isCatExpanded ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className={cn("flex gap-4 overflow-x-auto no-scrollbar pb-2 w-full", isRtl && "flex-row-reverse")}
                      >
                          <CategoryCard id="all" name="Universal_Access" icon={Layers} selected={selectedCategory === "all"} onClick={setSelectedCategory} />
                          {filteredCategories.map(c => <CategoryCard key={c._id} id={c._id} name={c.name} icon={Layers} selected={selectedCategory === c._id} onClick={setSelectedCategory} />)}
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="bg-white/50 dark:bg-black/20 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                           <CategoryCard id="all" name="Universal_Access" icon={Layers} selected={selectedCategory === "all"} onClick={setSelectedCategory} />
                           {filteredCategories.map(c => <CategoryCard key={c._id} id={c._id} name={c.name} icon={Layers} selected={selectedCategory === c._id} onClick={setSelectedCategory} />)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
             <div className="absolute inset-0 scanline opacity-[0.01] pointer-events-none" />
             
             {loading ? (
               <div className="h-full flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                     <div className="w-24 h-24 border-2 border-dashed border-indigo-500/20 rounded-full animate-spin-slow" />
                     <Cpu size={48} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
                  </div>
                  <p className="font-black text-[10px] uppercase tracking-[1em] text-slate-500 italic animate-pulse">Syncing_Lattice_Telemetry...</p>
               </div>
             ) : activeTab === "TERMINAL" ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 pb-32">
                  {filteredProducts.filter(Boolean).map(p => <ProductCard key={p._id} p={p} isRtl={isRtl} currencySymbol={currencySymbol} onAddToCart={addToCart} onShowInfo={setSelectedProduct} />)}
               </div>
             ) : (
               <div className="space-y-6 pb-32 max-w-6xl mx-auto">
                  {filteredOrders.filter(Boolean).map((o: any, i: number) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.05, duration: 0.6 }} 
                      key={o._id} 
                      className={cn("bg-white dark:bg-white/[0.03] p-8 md:p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group hover:border-indigo-500/30 transition-all shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden", isRtl && "lg:flex-row-reverse")}
                    >
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                          <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0 border border-transparent dark:border-white/5">
                             <Package size={36} strokeWidth={1.5} />
                          </div>
                          <div className={isRtl ? "text-right" : "text-left"}>
                             <div className={cn("flex items-center gap-4 mb-3", isRtl && "flex-row-reverse")}>
                                <span className="text-[11px] font-mono font-black text-slate-400 dark:text-slate-500">#TRX-{(o._id || "").slice(-10).toUpperCase()}</span>
                                <span className={cn(
                                   "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border", 
                                   o.status === "CONFIRMED" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                                )}>
                                   {o.status || "UNKNOWN"}
                                </span>
                             </div>
                             <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter truncate max-w-[300px] leading-none mb-4">{o.clientId?.name || "Anonymous_Node"}</h3>
                             <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                                <Clock size={14} className="text-slate-400" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "N/A"}</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className={cn("flex flex-col md:flex-row items-start lg:items-center gap-8 lg:gap-16 w-full lg:w-auto", isRtl && "md:flex-row-reverse")}>
                          <div className={cn("flex flex-col", isRtl ? "items-end" : "items-start")}>
                             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-3 italic">
                                <Database size={12}/> Ledger_Valuation
                             </span>
                             <span className="text-4xl font-black text-indigo-600 italic tracking-tighter leading-none">
                                {(o.totalPrice || 0).toLocaleString()} <span className="text-base not-italic opacity-40 uppercase tracking-widest">{currencySymbol}</span>
                             </span>
                          </div>
                          <button 
                             onClick={() => setSelectedOrder(o)} 
                             className="w-full md:w-auto px-12 py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 border-none shadow-3xl group/btn italic"
                          >
                             <Eye size={20} className="group-hover/btn:scale-110 transition-transform" /> {t('common.view')}
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
             )}
          </div>
        </div>

        <AnimatePresence>
          {isCartOpen && activeTab === 'TERMINAL' && (
            <motion.aside initial={{ x: isRtl ? -400 : 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: isRtl ? -400 : 400, opacity: 0 }} className={cn("fixed md:relative inset-y-0 right-0 z-40 w-full md:w-[350px] xl:w-[420px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 shadow-4xl transition-all border-l border-slate-100 dark:border-white/5", isRtl && "left-0 right-auto border-r border-l-0")}>
               <div className={cn("p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-[#202c33]/50", isRtl && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}><div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-2xl shrink-0 rotate-3"><ShoppingBag size={22} /></div><div className={cn("flex flex-col min-w-0", isRtl && "text-right")}><h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-950 dark:text-white truncate">Order Buffer</h2><span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em] truncate mt-1">Registry_Active</span></div></div>
                  <button onClick={() => setIsCartOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-all border-none bg-transparent active:scale-90"><X size={24}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-black/20">
                  {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-10"><ShoppingCart size={100} strokeWidth={1} className="text-indigo-600 animate-pulse" /><p className="font-black uppercase text-xs tracking-[0.6em] mt-8 text-center italic">Awaiting Signal...</p></div> : cart.map((item, idx) => <CartItem key={item._id} item={item} idx={idx} isRtl={isRtl} currencySymbol={currencySymbol} onUpdateQty={(id, qty) => setCart(cart.map(i => i._id === id ? { ...i, cartQty: qty } : i))} onRemove={(id) => setCart(cart.filter(i => i._id !== id))} onAddToCart={addToCart} />)}
               </div>
               <div className="p-8 bg-white dark:bg-[#202c33] border-t border-slate-100 dark:border-white/5 space-y-8 shadow-4xl relative overflow-hidden">
                  <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                     <div className={cn("flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]", isRtl && "flex-row-reverse")}><span>Lattice Valuation</span><span>{subtotal.toLocaleString()} {currencySymbol}</span></div>
                     <div className={cn("flex justify-between items-end pt-6 border-t border-slate-200 dark:border-white/10", isRtl && "flex-row-reverse")}><div className={cn("flex flex-col", isRtl && "items-end")}><span className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.5em] mb-2 italic">Total Signal</span><span className="text-4xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none drop-shadow-sm">{totalOrder.toLocaleString()}</span></div><span className="text-sm font-black text-slate-400 mb-1 ml-3 uppercase">{currencySymbol}</span></div>
                  </div>
                  <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0} className="w-full bg-indigo-600 text-white py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-slate-950 transition-all active:scale-95 disabled:opacity-30 border-none group relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     <span className="relative z-10 flex items-center justify-center gap-3">COMMIT SIGNAL <Zap size={16} fill="currentColor" className="group-hover:rotate-12 transition-transform" /></span>
                  </button>
               </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>{selectedProduct && <ProductDetailModal product={selectedProduct} isRtl={isRtl} currencySymbol={currencySymbol} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} t={t} />}</AnimatePresence>
      <AnimatePresence>{showCheckout && <CheckoutModal isRtl={isRtl} customers={customers} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} totalOrder={totalOrder} currencySymbol={currencySymbol} cartLength={cart.length} processing={processing} onClose={() => setShowCheckout(false)} onCheckout={handleCheckout} t={t} />}</AnimatePresence>
      <AnimatePresence>{selectedOrder && <OrderDetailModal order={selectedOrder} isRtl={isRtl} currencySymbol={currencySymbol} onClose={() => setSelectedOrder(null)} t={t} />}</AnimatePresence>
    </div>
  );
};

export default Sales;
