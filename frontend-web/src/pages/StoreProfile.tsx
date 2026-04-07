import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import api from "../api/client";
import { useAuth } from "../store/auth.slice";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

// --- Modular Components ---
import { StoreHeader } from "../components/community/StoreHeader";
import { StoreSidebar } from "../components/community/StoreSidebar";
import { StoreInventory } from "../components/community/StoreInventory";
import { StoreCart } from "../components/community/StoreCart";
import { MarketplaceCheckoutModal } from "../components/community/MarketplaceCheckoutModal";
import { ProductDetailModal } from "../components/sales/ProductDetailModal";

export const StoreProfile = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("INVENTORY");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ fullName: currentUser?.name || "", phone: currentUser?.phone || "", email: currentUser?.email || "", city: "", address: "", notes: "" });

  const isRtl = i18n.language === 'ar';

  const fetchStoreData = useCallback(async () => {
    try {
      setLoading(true);
      const [storeRes, productsRes, vendorRes] = await Promise.all([api.get(`/community/store/${tenantId}`), api.get(`/products?tenantId=${tenantId}`), api.get(`/users?tenantId=${tenantId}&global=true`)]);
      setStore(storeRes.data); setProducts(productsRes.data.data || []);
      const vendors = vendorRes.data.data || vendorRes.data;
      setVendor(vendors.find((u: any) => u.role === 'VENDOR') || vendors[0]);
    } catch (e) { toast.error("Store Link Corrupted"); navigate("/community"); } finally { setLoading(false); }
  }, [tenantId, navigate]);

  useEffect(() => { fetchStoreData(); }, [fetchStoreData]);

  const addToCart = (product: any) => {
    const ex = cart.find(i => i._id === product._id);
    setCart(ex ? cart.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { ...product, qty: 1 }]);
    toast.success(`${product.name} indexed`); setIsCartOpen(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) return toast.error("Data Incomplete");
    setProcessing(true);
    const loadId = toast.loading("Broadcasting Order...");
    try {
      await api.post("/orders", { tenantId: store.slug, items: cart.map(i => ({ productId: i._id, quantity: i.qty, price: i.price })), totalPrice: cart.reduce((a, b) => a + (b.price * b.qty), 0), paymentMethod: "CASH", status: "PENDING", metadata: { ...customerInfo, source: "MARKETPLACE" } });
      toast.success("Order Synchronized", { id: loadId }); setCart([]); setShowCheckout(false); setIsCartOpen(false);
    } catch (e) { toast.error("Checkout Refused", { id: loadId }); } finally { setProcessing(false); }
  };

  const isFollowing = !!currentUser?.following?.includes(vendor?._id || '');
  const handleFollow = async () => {
    if (!vendor || !currentUser) return;
    try {
      const res = await api.post(`/community/user/${vendor._id}/follow`);
      const coupled = res.data.coupled;
      const updatedFollowing = coupled 
        ? [...(currentUser.following || []), vendor._id] 
        : (currentUser.following || []).filter((id: string) => id !== vendor._id);
      
      setCurrentUser({ 
        ...currentUser, 
        following: updatedFollowing 
      } as any);
      toast.success(coupled ? "Lattice Coupled" : "Lattice Decoupled");
    } catch (e) { toast.error("Signal Lost"); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center opacity-20">
       <Zap size={64} className="text-indigo-600 animate-pulse mb-8" />
       <p className="text-[10px] font-black uppercase tracking-[0.8em]">Syncing Store Node...</p>
    </div>
  );

  return (
    <div className={cn("w-full space-y-10 pb-32 animate-reveal", isRtl ? "text-right" : "text-left px-2 md:px-4")}>
       <header className="relative"><button onClick={() => navigate(-1)} className="absolute top-10 left-10 p-5 bg-white/5 backdrop-blur-xl text-white rounded-2xl hover:bg-indigo-600 transition-all z-20 border border-white/10 active:scale-90 border-none bg-transparent shadow-2xl"><ArrowLeft size={28} /></button><StoreHeader store={store} isFollowing={isFollowing} handleFollow={handleFollow} cartCount={cart.reduce((a, b) => a + b.qty, 0)} setIsCartOpen={setIsCartOpen} isRtl={isRtl} t={t} /></header>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <StoreSidebar store={store} vendor={vendor} isRtl={isRtl} />
          <main className="lg:col-span-9 space-y-10">
             <div className={cn("flex items-center gap-3 p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.2rem] border border-white/10 shadow-2xl w-fit", isRtl && "flex-row-reverse")}><button onClick={() => setActiveTab("INVENTORY")} className={cn("px-10 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all border-none bg-transparent", activeTab === "INVENTORY" ? "bg-indigo-600 text-white shadow-2xl" : "text-slate-400 hover:bg-white")}>Inventory</button><button onClick={() => setActiveTab("SIGNALS")} className={cn("px-10 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all border-none bg-transparent", activeTab === "SIGNALS" ? "bg-indigo-600 text-white shadow-2xl" : "text-slate-400 hover:bg-white")}>Signals</button></div>
             <StoreInventory products={products} activeTab={activeTab} isRtl={isRtl} onAddToCart={addToCart} onShowInfo={setSelectedProduct} />
          </main>
       </div>
       <AnimatePresence>{isCartOpen && <StoreCart cart={cart} isRtl={isRtl} onClose={() => setIsCartOpen(false)} onUpdateQty={(id, d) => setCart(cart.map(i => i._id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i))} onRemove={(id) => setCart(cart.filter(i => i._id !== id))} totalAmount={cart.reduce((a, b) => a + (b.price * b.qty), 0)} onCheckout={() => setShowCheckout(true)} />}</AnimatePresence>
       <AnimatePresence>{showCheckout && <MarketplaceCheckoutModal isRtl={isRtl} store={store} cart={cart} totalAmount={cart.reduce((a, b) => a + (b.price * b.qty), 0)} customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} processing={processing} onClose={() => setShowCheckout(false)} onCheckout={handleCheckout} />}</AnimatePresence>
       <AnimatePresence>{selectedProduct && <ProductDetailModal product={selectedProduct} isRtl={isRtl} currencySymbol="DH" onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} t={t} />}</AnimatePresence>
    </div>
  );
};

export default StoreProfile;
