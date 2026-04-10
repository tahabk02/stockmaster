import React, { useEffect, useState, useCallback, useMemo } from "react";
import apiClient from "../api/client";
import { endpoints } from "../api/endpoints";
import { Loader2, BoxSelect, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { ProductInventoryHeader } from "../components/inventory/ProductInventoryHeader";
import { ProductInventoryGrid } from "../components/inventory/ProductInventoryGrid";
import { ProductInventoryList } from "../components/inventory/ProductInventoryList";
import { BulkAddModal } from "../components/inventory/BulkAddModal";
import { ProductDetailModal } from "../components/sales/ProductDetailModal";
import { CategoryManager } from "../components/inventory/CategoryManager";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const Products = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categorySearch, setCategorySearch] = useState("");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [bulkProducts, setBulkProducts] = useState<any[]>([{ name: "", sku: "", price: "", quantity: "", category: "", image: "", gallery: [], description: "", location: "" }]);
  const [categories, setCategories] = useState<any[]>([]);

  const isAdmin = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : { role: "USER" };
    return ["ADMIN", "SUPER_ADMIN", "VENDOR"].includes(user.role);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setFetching(true);
      const [prodRes, catRes] = await Promise.all([apiClient.get(endpoints.products.list), apiClient.get("/categories")]);
      setProducts(prodRes.data?.data || []); setCategories(catRes.data || []);
    } catch (err) { toast.error(t('errors.networkError')); } finally { setFetching(false); }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      if (isGallery) {
        const base64s = await Promise.all(files.map(file => toBase64(file)));
        const updated = [...bulkProducts]; updated[index].gallery = [...(updated[index].gallery || []), ...base64s];
        setBulkProducts(updated);
      } else {
        const base64 = await toBase64(files[0]);
        const updated = [...bulkProducts]; updated[index].image = base64;
        setBulkProducts(updated);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) { await apiClient.put(`${endpoints.products.list}/${editingId}`, bulkProducts[0]); toast.success(t('common.success')); }
      else {
        const valid = bulkProducts.filter(p => p.name && p.sku && p.price && p.quantity);
        if (valid.length === 0) { toast.error(t('common.invalidInput')); setIsSubmitting(false); return; }
        await Promise.all(valid.map(p => apiClient.post(endpoints.products.list, p)));
        toast.success(t('common.success'));
      }
      setIsModalOpen(false); setEditingId(null); setBulkProducts([{ name: "", sku: "", price: "", quantity: "", category: "", image: "", gallery: [], description: "", location: "" }]); fetchData();
    } catch (error) { toast.error(t('errors.serverError')); } finally { setIsSubmitting(false); }
  };

  const filtered = products.filter(p => {
    const mSearch = [p.name, p.sku].some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
    const mLoc = (p.location || "").toLowerCase().includes(locationSearch.toLowerCase());
    const pCatId = (p.category && typeof p.category === 'object') ? (p.category as any)?._id : p.category;
    const mCat = selectedCategory === "all" || pCatId === selectedCategory;
    return mSearch && mLoc && mCat;
  });

  const isRtl = i18n.language === 'ar';

  if (fetching) return <div className="py-40 flex flex-col items-center justify-center opacity-20"><Loader2 className="animate-spin text-indigo-600 mb-4" size={48} /><p className="font-black text-[10px] uppercase tracking-[0.5em]">{t('common.loading')}</p></div>;

  return (
    <div className={cn("w-full space-y-6 pb-32 animate-reveal text-[var(--text)]", isRtl ? 'text-right' : 'text-left')}>
      <ProductInventoryHeader isAdmin={isAdmin} editingId={editingId} viewMode={viewMode} setViewMode={setViewMode} onOpenCategory={()=>setIsCatManagerOpen(true)} onOpenAdd={()=>{setEditingId(null); setBulkProducts([{ name: "", sku: "", price: "", quantity: "", category: "", image: "", gallery: [], description: "", location: "" }]); setIsModalOpen(true);}} t={t} />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
           <div className="theme-card p-6 shadow-sm flex flex-col h-full lg:max-h-[70vh]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">{t('products.categories')}</p>
              
              <div className="relative group mb-4">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-3" : "left-3")} size={14} />
                <input 
                  placeholder={t('products.filterPlaceholder')} 
                  className={cn(
                    "pro-input w-full py-2 text-[10px] font-black uppercase tracking-widest",
                    isRtl ? "pr-9 pl-4 text-right" : "pl-9 pr-4 text-left"
                  )}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>

              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 no-scrollbar custom-scrollbar pr-1">
                 <button 
                   onClick={() => setSelectedCategory("all")}
                   className={cn(
                     "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none shrink-0",
                     isRtl ? "text-right" : "text-left",
                     selectedCategory === "all" ? "bg-indigo-600 text-white shadow-lg" : "bg-transparent text-slate-500 hover:text-indigo-500"
                   )}
                 >
                    {t('products.allCategories')}
                 </button>
                 {categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map(c => (
                   <button 
                     key={c._id}
                     onClick={() => setSelectedCategory(c._id)}
                     className={cn(
                       "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none shrink-0 truncate",
                       isRtl ? "text-right" : "text-left",
                       selectedCategory === c._id ? "bg-indigo-600 text-white shadow-lg" : "bg-transparent text-slate-500 hover:text-indigo-500"
                     )}
                   >
                      {c.name}
                   </button>
                 ))}
              </div>
           </div>
        </aside>

        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="py-24 theme-card border-2 border-dashed flex flex-col items-center justify-center opacity-30 grayscale"><BoxSelect size={64} strokeWidth={1} /><p className="font-black uppercase text-xs tracking-widest mt-4">{t('products.title')} {t('common.empty')}</p></div>
          ) : viewMode === "GRID" ? (
            <ProductInventoryGrid products={filtered} isRtl={isRtl} t={t} onView={setSelectedProduct} onEdit={(p)=>{setEditingId(p._id); setBulkProducts([p]); setIsModalOpen(true);}} />
          ) : (
            <ProductInventoryList products={filtered} isRtl={isRtl} onView={setSelectedProduct} onEdit={(p)=>{setEditingId(p._id); setBulkProducts([p]); setIsModalOpen(true);}} />
          )}
        </div>
      </div>

      <AnimatePresence>{isModalOpen && <BulkAddModal editingId={editingId} bulkProducts={bulkProducts} categories={categories} isSubmitting={isSubmitting} isRtl={isRtl} onClose={()=>setIsModalOpen(false)} onSubmit={handleSubmit} onAddRow={()=>setBulkProducts([...bulkProducts, { name: "", sku: "", price: "", quantity: "", category: "", image: "", gallery: [], description: "", location: "" }])} onRemoveRow={(i)=>setBulkProducts(bulkProducts.filter((_, idx)=>idx!==i))} onBulkChange={(i,f,v)=>{const u=[...bulkProducts]; u[i][f]=v; setBulkProducts(u);}} onFileChange={handleFileChange} onRemoveGalleryImg={(pi, ii)=>{const u=[...bulkProducts]; u[pi].gallery=u[pi].gallery.filter((_:any,idx:number)=>idx!==ii); setBulkProducts(u);}} t={t} />}</AnimatePresence>
      <AnimatePresence>{isCatManagerOpen && <CategoryManager isOpen={isCatManagerOpen} onClose={()=>setIsCatManagerOpen(false)} onUpdate={fetchData} isRtl={isRtl} t={t} />}</AnimatePresence>
      <AnimatePresence>{selectedProduct && <ProductDetailModal product={selectedProduct} isRtl={isRtl} currencySymbol={t('common.currency')} onClose={()=>setSelectedProduct(null)} onAddToCart={()=>{}} t={t} />}</AnimatePresence>
    </div>
  );
};

export default Products;
