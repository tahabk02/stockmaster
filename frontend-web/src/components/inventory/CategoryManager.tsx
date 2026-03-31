import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Plus, Trash2, Search, Loader2, Edit2, ShieldCheck, Database } from "lucide-react";
import api from "../../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  isRtl: boolean;
  t: (key: string) => string;
}

export const CategoryManager = ({ isOpen, onClose, onUpdate, isRtl, t }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (e) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, newCat);
        toast.success("Category updated");
      } else {
        await api.post("/categories", newCat);
        toast.success("Category created");
      }
      setNewCat({ name: "", description: "" });
      setEditingId(null);
      setIsAdding(false);
      fetchCategories();
      onUpdate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this tier? This may affect linked assets.")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category purged");
      fetchCategories();
      onUpdate();
    } catch (e) {
      toast.error("Purge failed");
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020205]/95 backdrop-blur-xl overflow-y-auto">
          <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
            className="bg-white dark:bg-[#050508] w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.1)] relative my-auto border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-950 p-8 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
               <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 border border-white/20">
                     <Tag size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Tier <span className="text-indigo-500">Registry.</span></h2>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 italic">Classification_Hub_v9.4</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl transition-all duration-500 border-none shadow-xl group">
                  <X size={20} className="group-hover:rotate-90 transition-transform" />
               </button>
            </div>

            <div className="p-8 space-y-8">
               {/* Search & Add Toggle */}
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group">
                     <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-4" : "left-4")} size={18} />
                     <input 
                       placeholder="SCAN_TIER_IDENTIFIER..." 
                       className={cn("w-full bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl py-4 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner italic", isRtl ? "pr-12 text-right" : "pl-12 pr-4")} 
                       value={searchTerm} 
                       onChange={(e)=>setSearchTerm(e.target.value)} 
                     />
                  </div>
                  <button 
                    onClick={() => { setIsAdding(!isAdding); setEditingId(null); setNewCat({name: "", description: ""}); }}
                    className={cn("px-8 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-3 border-none shadow-xl", isAdding ? "bg-rose-600 text-white" : "bg-indigo-600 text-white hover:bg-slate-950")}
                  >
                     {isAdding ? <X size={16} /> : <Plus size={16} />}
                     {isAdding ? "Abort" : "New Tier"}
                  </button>
               </div>

               {/* Add/Edit Form */}
               <AnimatePresence>
                  {(isAdding || editingId) && (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-[2rem] border border-indigo-500/20 space-y-4 shadow-inner overflow-hidden"
                    >
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Tier_Name</label>
                             <input required value={newCat.name} onChange={e=>setNewCat({...newCat, name: e.target.value})} placeholder="ENT_ALPHA_01..." className="w-full bg-white dark:bg-black/40 border border-transparent dark:border-white/5 rounded-xl p-3 text-xs font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all italic uppercase" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Description</label>
                             <input value={newCat.description} onChange={e=>setNewCat({...newCat, description: e.target.value})} placeholder="Strategic Descriptor..." className="w-full bg-white dark:bg-black/40 border border-transparent dark:border-white/5 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all italic" />
                          </div>
                       </div>
                       <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-[0.3em] shadow-xl hover:bg-slate-950 transition-all flex items-center justify-center gap-3 border-none">
                          {submitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                          {editingId ? "Commit Update" : "Authorize Provisioning"}
                       </button>
                    </motion.form>
                  )}
               </AnimatePresence>

               {/* Categories List */}
               <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-20"><Loader2 className="animate-spin text-indigo-600 mb-4" size={32} /></div>
                  ) : filtered.length === 0 ? (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4"><Database size={48} /><p className="text-[10px] font-black uppercase tracking-[0.5em] italic">No_Registry_Data</p></div>
                  ) : filtered.map((cat, i) => (
                    <div key={cat._id} className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-500 shadow-inner group-hover:rotate-6 transition-transform">
                             <Tag size={18} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{cat.name}</p>
                             <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60 truncate max-w-[200px]">{cat.description || "NO_STRATEGIC_DESC"}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingId(cat._id); setNewCat({name: cat.name, description: cat.description || ""}); setIsAdding(false); }} className="p-2.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-500 rounded-xl border border-transparent dark:border-white/5 shadow-md active:scale-90 transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(cat._id)} className="p-2.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-xl border border-transparent dark:border-white/5 shadow-md active:scale-90 transition-all"><Trash2 size={14} /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-white/5 flex justify-between items-center relative">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Tier_Lattice_Secure</span>
               </div>
               <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{categories.length} NODES_INDEXED</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
