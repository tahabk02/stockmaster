import React, { useState, useEffect } from "react";
import api from "../api/client";
import { endpoints } from "../api/endpoints";
import { toast } from "react-hot-toast";
import {
  Plus, Trash2, ShoppingCart, Truck, Package, Save, PlusCircle,
  BadgeDollarSign, Boxes, ChevronRight, Info, Loader2,
  FileText, Search, CreditCard, Layers, ArrowUpRight, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export const Purchases = () => {
  const { t, i18n } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [reference, setReference] = useState(`PROC-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState("");
  const [tempItem, setTempItem] = useState({ productId: "", quantity: 1, purchasePrice: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          api.get("/suppliers"),
          api.get(endpoints.products.list),
        ]);
        setSuppliers(suppliersRes.data.data || suppliersRes.data);
        setProducts(productsRes.data.data || productsRes.data);
      } catch (error) { toast.error(t('errors.networkError')); }
    };
    fetchData();
  }, [t]);

  const totalOrder = cart.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);

  const addToCart = () => {
    if (!tempItem.productId || tempItem.quantity <= 0 || tempItem.purchasePrice <= 0) {
      toast.error(t('errors.invalidData'));
      return;
    }
    const productInfo = products.find((p: any) => p._id === tempItem.productId) as any;
    if (!productInfo) return;

    if (cart.find((item) => item.productId === tempItem.productId)) {
      toast.error(t('products.messages.alreadyExists'));
      return;
    }

    setCart([...cart, { ...tempItem, name: productInfo.name, sku: productInfo.sku }]);
    setTempItem({ productId: "", quantity: 1, purchasePrice: 0 });
    toast.success(t('purchases.messages.assetAdded'));
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSavePurchase = async () => {
    if (!selectedSupplier) {
      toast.error(t('purchases.messages.supplierRequired'));
      return;
    }
    if (cart.length === 0) {
      toast.error(t('purchases.messages.manifestEmpty'));
      return;
    }

    setLoading(true);
    const toastId = toast.loading(t('purchases.messages.processing') || "Broadcasting Procurement Signal...");
    try {
      const response = await api.post("/purchases", { 
        supplierId: selectedSupplier, 
        items: cart, 
        totalAmount: totalOrder,
        reference,
        notes
      });

      if (response.data.success) {
        toast.success(t('purchases.messages.orderCreated'), { id: toastId });
        setCart([]); 
        setSelectedSupplier(""); 
        setNotes("");
        setReference(`PROC-${Date.now().toString().slice(-6)}`);
      }
    } catch (error: any) { 
      const errorMsg = error.response?.data?.message || t('errors.serverError');
      toast.error(errorMsg, { id: toastId }); 
    } finally { 
      setLoading(false); 
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("w-full space-y-8 pb-32 px-3 md:px-6 transition-all duration-500 font-sans", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. PROCUREMENT HUB HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-slate-950 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full -mr-48 -mt-48 blur-3xl" />
         <div className="relative z-10">
            <div className={cn("flex items-center gap-4 mb-4", isRtl && "flex-row-reverse")}>
               <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/40 rotate-3">
                  <Truck size={28} />
               </div>
               <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{t('purchases.title')} <span className="text-indigo-500">{t('purchases.subtitle')}.</span></h1>
            </div>
            <p className="text-indigo-300 font-bold uppercase text-[9px] tracking-[0.4em] ml-1">Advanced Supply Chain Protocol v4.0</p>
         </div>

         <div className="flex flex-wrap gap-4 relative z-10">
            <div className={cn("bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex items-center gap-8 shadow-2xl", isRtl && "flex-row-reverse")}>
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest text-center">{t('dashboard.value')}</p>
                  <p className="text-3xl font-black text-indigo-400 italic leading-none text-center">{totalOrder.toLocaleString()} <span className="text-[10px] not-italic text-indigo-600">MAD</span></p>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest text-center">{t('dashboard.activeSignals')}</p>
                  <p className="text-3xl font-black text-emerald-400 italic leading-none text-center">{cart.length}</p>
               </div>
            </div>
         </div>
      </header>

      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8", isRtl && "rtl")}>
        
        {/* 2. LEFT: SIGNAL INPUT TERMINAL */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Metadata Terminal */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl">
            <div className={cn("flex items-center gap-3 mb-8", isRtl && "flex-row-reverse")}>
              <div className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg"><FileText size={20} /></div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{t('purchases.meta')}</h2>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className={cn("text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1", isRtl && "text-right block mr-1")}>{t('purchases.ref')}</label>
                  <input 
                    className={cn("w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")}
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <label className={cn("text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1", isRtl && "text-right block mr-1")}>{t('purchases.partner')}</label>
                  <select 
                    className={cn("w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all", isRtl && "text-right")} 
                    value={selectedSupplier} 
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                  >
                    <option value="">{t('common.search')}</option>
                    {suppliers.filter(Boolean).map((s: any) => <option key={s._id} value={s._id}>{s.name} ({s.contactPerson})</option>)}
                  </select>
               </div>
            </div>
          </section>

          {/* Asset Provisioning */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Plus size={120} /></div>
            <div className={cn("flex items-center gap-3 mb-8", isRtl && "flex-row-reverse")}>
              <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg -rotate-3"><Layers size={20} /></div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{t('purchases.add')}</h2>
            </div>
            <div className="space-y-5">
              <select 
                className={cn("w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all", isRtl && "text-right")} 
                value={tempItem.productId} 
                onChange={(e) => setTempItem({ ...tempItem, productId: e.target.value })}
              >
                <option value="">{t('common.search')}</option>
                {products.filter(Boolean).map((p: any) => <option key={p._id} value={p._id}>{p.name} [{p.sku}]</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className={cn("text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1", isRtl && "text-right block mr-1")}>{t('purchases.qty')}</label>
                   <input type="number" className={cn("w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner", isRtl && "text-right")} value={tempItem.quantity} onChange={(e) => setTempItem({ ...tempItem, quantity: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                   <label className={cn("text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1", isRtl && "text-right block mr-1")}>{t('purchases.unitPrice')}</label>
                   <input type="number" className={cn("w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner", isRtl && "text-right")} value={tempItem.purchasePrice} onChange={(e) => setTempItem({ ...tempItem, purchasePrice: Number(e.target.value) })} />
                </div>
              </div>
              <button onClick={addToCart} className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                 <Zap size={16} /> {t('purchases.add')}
              </button>
            </div>
          </section>
        </div>

        {/* 3. RIGHT: REAL-TIME SUMMARY TABLE */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col h-full transition-colors relative">
            <div className={cn("p-8 md:p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between", isRtl && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                <div className="p-4 bg-emerald-500 rounded-[1.5rem] text-white shadow-xl"><ShoppingCart size={24} /></div>
                <div className={isRtl ? "text-right" : "text-left"}>
                   <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none">{t('purchases.summary')}</h2>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">{t('sales.registry')}</p>
                </div>
              </div>
              <div className={cn("flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10", isRtl && "flex-row-reverse")}>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{cart.length} NODE(S)</span>
              </div>
            </div>

            <div className="flex-grow p-8 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 opacity-20">
                    <Boxes size={80} strokeWidth={1} className="text-slate-400 dark:text-white mb-6" />
                    <p className="font-black uppercase text-xs tracking-[0.5em]">{t('common.empty')}</p>
                  </div>
                ) : cart.map((item, index) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={index} className={cn("flex justify-between items-center bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all", isRtl && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                      <div className="w-14 h-14 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-lg border border-slate-100 dark:border-white/5 text-lg italic group-hover:scale-110 transition-transform">#{index + 1}</div>
                      <div className={isRtl ? "text-right" : "text-left"}>
                        <p className="font-black text-slate-900 dark:text-white uppercase italic text-base tracking-tight">{item.name}</p>
                        <div className={cn("flex items-center gap-3 mt-1", isRtl && "flex-row-reverse")}>
                           <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SKU: {item.sku}</span>
                           <div className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{item.quantity} {t('nav.infrastructure')}</span>
                        </div>
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                      <div className={isRtl ? "text-left" : "text-right"}>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{t('dashboard.value')}</p>
                        <p className="font-black text-slate-950 dark:text-white text-xl italic tracking-tighter">{(item.quantity * item.purchasePrice).toLocaleString()} <span className="text-[10px] not-italic text-slate-400">MAD</span></p>
                      </div>
                      <button onClick={() => removeFromCart(index)} className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><Trash2 size={20} /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-8 md:p-10 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 mt-auto">
              <div className="mb-8">
                 <label className={cn("text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3", isRtl && "text-right mr-1")}>{t('purchases.notes')}</label>
                 <textarea 
                   placeholder={t('purchases.notes')} 
                   className={cn("w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[1.5rem] p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-24 shadow-inner resize-none transition-all", isRtl && "text-right")}
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                 />
              </div>
              <button 
                onClick={handleSavePurchase} 
                disabled={loading || cart.length === 0} 
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg uppercase italic tracking-tighter shadow-2xl hover:bg-slate-950 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-4 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <ArrowUpRight size={24} className={cn("group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform", isRtl && "rotate-[-90deg]")} />
                    {t('purchases.confirm')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
