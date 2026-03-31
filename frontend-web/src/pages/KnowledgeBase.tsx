import React, { useState, useEffect, useCallback } from "react";
import { 
  BookOpen, FileText, Search, Plus, Filter, 
  RefreshCcw, Loader2, ArrowUpRight, ShieldCheck,
  Zap, Clock, MoreHorizontal, ChevronRight, 
  ExternalLink, Info, Trash2, X, Save, Bookmark,
  Paperclip, Share2, Eye, Fingerprint, Database,
  Scale, Cpu, GraduationCap, Lock, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

const CATEGORY_ICONS: Record<string, any> = {
  SOP: Settings2Icon,
  LEGAL: Scale,
  TECHNICAL: Cpu,
  TRAINING: GraduationCap,
  default: FileText
};

function Settings2Icon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
}

export const KnowledgeBase = () => {
  const { t, i18n } = useTranslation();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "SOP",
    isPublic: true
  });

  const isRtl = i18n.language === 'ar';

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/documents");
      setDocs(res.data.data || []);
    } catch (e) {
      toast.error("Knowledge Lattice Link Failure");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return toast.error("Intelligence Payload Incomplete");
    
    setIsSubmitting(true);
    const loadId = toast.loading("Indexing Neural Signal...");
    try {
      await api.post("/documents", formData);
      toast.success("Archive Node Synchronized", { id: loadId });
      setIsModalOpen(false);
      resetForm();
      fetchDocs();
    } catch (e) {
      toast.error("Indexing Refused", { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", category: "SOP", isPublic: true });
  };

  const getCategoryIcon = (cat: string) => CATEGORY_ICONS[cat] || CATEGORY_ICONS.default;

  const filtered = docs.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("w-full space-y-4 pb-16 px-2 md:px-4 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. KNOWLEDGE HUD - COMPACT SCALE */}
      <header className="bg-slate-950 text-white p-4 md:p-6 rounded-[1.5rem] shadow-3xl relative overflow-hidden border border-white/5">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
               <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                  <div className="p-4 bg-indigo-600 rounded-[1.2rem] shadow-xl shadow-indigo-500/40 rotate-2 transition-transform hover:rotate-0 duration-700 relative group shrink-0">
                     <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                     <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-none">{t('docs.title').split(' ')[0]} <span className="text-indigo-500">{t('docs.title').split(' ').slice(1).join(' ')}.</span></h1>
                     <p className="text-indigo-300 font-bold uppercase text-[7px] tracking-[0.4em] mt-1 opacity-80">{t('docs.subtitle')}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-4 shrink-0 w-full md:w-auto">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[1.5rem] flex items-center gap-6 shadow-2xl flex-1 md:flex-none justify-center">
                  <div className="text-center">
                     <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('docs.stats.total')}</p>
                     <p className="text-xl font-black text-indigo-400 italic leading-none">{docs.length}</p>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-center">
                     <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('docs.stats.capacity')}</p>
                     <p className="text-xl font-black text-emerald-400 italic leading-none">92%</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(true)} className="px-6 py-4 bg-white text-slate-900 rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest shadow-3xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center gap-3 group flex-1 md:flex-none justify-center">
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" /> {t('docs.add')}
               </button>
            </div>
         </div>
      </header>

      {/* 2. REGISTRY FILTERS - STREAMLINED */}
      <div className={cn("flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-2xl backdrop-blur-md", isRtl && "sm:flex-row-reverse")}>
        <div className="relative flex-1 group">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-4" : "left-4")} size={18} />
          <input placeholder={t('docs.search')} className={cn("w-full bg-slate-50 dark:bg-black/20 border-none rounded-[1rem] py-4 text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner", isRtl ? "pr-12 pl-4" : "pl-12 pr-4")} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
           <button className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-lg transition-all active:scale-95"><Filter size={18} /></button>
           <button onClick={fetchDocs} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-lg transition-all active:scale-95 group">
              <RefreshCcw className={cn("group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} size={18} />
           </button>
        </div>
      </div>

      {/* 3. DOCUMENT MATRIX - HIGH DENSITY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
         {loading ? (
           <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
              <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">Syncing Archives...</p>
           </div>
         ) : filtered.length === 0 ? (
           <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-30 grayscale">
              <Bookmark size={48} strokeWidth={1} className="mb-4 text-indigo-600" />
              <p className="font-black uppercase text-[10px] tracking-[0.3em]">{t('common.noData')}</p>
           </div>
         ) : filtered.map((doc, idx) => {
           const Icon = getCategoryIcon(doc.category);
           return (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ delay: idx * 0.02 }}
               key={doc._id} 
               onClick={() => setSelectedDoc(doc)}
               className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-[1.2rem] border border-slate-100 dark:border-white/5 shadow-md hover:shadow-indigo-500/10 transition-all duration-500 group cursor-pointer relative overflow-hidden flex flex-col h-full"
             >
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/5 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={cn("flex justify-between items-start mb-4", isRtl && "flex-row-reverse")}>
                   <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Icon size={18} />
                   </div>
                   <span className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 rounded-md text-[6px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5">{(t(`docs.categories.${doc.category}`) as string)}</span>
                </div>

                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2rem]">{doc.title}</h3>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-tight line-clamp-3 mb-4 flex-1">"{doc.content.substring(0, 100)}..."</p>

                <div className={cn("flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5", isRtl && "flex-row-reverse")}>
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-600 border border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                         {doc.createdBy?.name?.charAt(0) || "U"}
                      </div>
                      <div className={isRtl ? "text-right" : "text-left"}>
                         <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none">Temporal</p>
                         <p className="text-[7px] font-black text-slate-900 dark:text-white uppercase leading-none">{new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="p-1.5 bg-slate-50 dark:bg-white/5 rounded-md text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight size={12} className={isRtl ? "rotate-180" : ""} />
                   </div>
                </div>
             </motion.div>
           );
         })}
      </div>

      {/* DOCUMENT INDEXING MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[4rem] p-10 md:p-16 shadow-[0_0_100px_rgba(99,102,241,0.2)] relative border border-white/5 my-auto">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-2xl shadow-xl transition-all active:scale-90"><X size={24} /></button>
                
                <div className={cn("flex items-center gap-8 mb-16", isRtl && "flex-row-reverse")}>
                   <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl rotate-3"><Save size={40} /></div>
                   <div className={isRtl ? 'text-right' : 'text-left'}>
                      <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{t('docs.add')}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 italic">Neural Intelligence Archiving Protocol</p>
                   </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                   <div className="space-y-2">
                      <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('docs.fields.title')}</label>
                      <input required placeholder="Protocol Identifier..." className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('docs.fields.category')}</label>
                        <select className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase", isRtl && "text-right")} value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})}>
                           {Object.keys(t('docs.categories', { returnObjects: true })).map(key => (
                             <option key={key} value={key}>{t(`docs.categories.${key}`)}</option>
                           ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('docs.fields.visibility')}</label>
                        <div className={cn("flex gap-3 p-1.5 bg-slate-50 dark:bg-black/20 rounded-2xl", isRtl && "flex-row-reverse")}>
                           <button type="button" onClick={()=>setFormData({...formData, isPublic: true})} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all", formData.isPublic ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400")}>Universal</button>
                           <button type="button" onClick={()=>setFormData({...formData, isPublic: false})} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all", !formData.isPublic ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400")}>Restricted</button>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block ml-1", isRtl && "text-right")}>{t('docs.fields.content')}</label>
                      <textarea placeholder="Detailed intelligence payload and tactical sequences..." className={cn("w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] p-10 text-base font-medium text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner min-h-[300px] resize-none", isRtl && "text-right")} value={formData.content} onChange={(e)=>setFormData({...formData, content: e.target.value})} />
                   </div>

                   <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-7 rounded-[3rem] font-black uppercase text-sm tracking-[0.5em] shadow-3xl shadow-indigo-500/30 hover:bg-slate-950 transition-all active:scale-95 mt-6 flex items-center justify-center gap-4 group">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} className="group-hover:scale-110 transition-transform" /> Index Protocol Signal</>}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT INSPECTOR MODAL */}
      <AnimatePresence>
         {selectedDoc && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl overflow-y-auto">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white dark:bg-[#0b141a] w-full max-w-5xl rounded-[4rem] shadow-3xl relative my-auto border border-white/5 overflow-hidden">
                 <button onClick={() => setSelectedDoc(null)} className={cn("absolute top-10 p-4 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl transition-all shadow-xl z-20 active:scale-90", isRtl ? "left-10" : "right-10")}><X size={24} /></button>
                 
                 <div className="p-12 md:p-20 space-y-12">
                    <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                       <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl rotate-3 shrink-0"><Fingerprint size={48} /></div>
                       <div className={isRtl ? 'text-right' : 'text-left'}>
                          <div className={cn("flex items-center gap-4 mb-4", isRtl && "flex-row-reverse")}>
                             <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">{(t(`docs.categories.${selectedDoc.category}`) as string)}</span>
                             <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                <Clock size={12}/> {new Date(selectedDoc.createdAt).toLocaleString()}
                             </div>
                          </div>
                          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{selectedDoc.title}</h2>
                       </div>
                    </div>

                    <div className={cn("p-12 md:p-16 bg-slate-50 dark:bg-black/40 rounded-[3.5rem] border border-slate-100 dark:border-white/5 relative group shadow-inner", isRtl && "text-right")}>
                       <div className="absolute top-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={100} /></div>
                       <p className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic opacity-90 whitespace-pre-wrap relative z-10">
                          {selectedDoc.content}
                       </p>
                    </div>

                    <div className={cn("flex flex-wrap gap-6 pt-10 border-t border-slate-100 dark:border-white/5", isRtl && "flex-row-reverse")}>
                       <button className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-3xl hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-4">
                          <Share2 size={20} /> Broadcast Signal
                       </button>
                       <button className="px-12 py-6 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-white transition-all flex items-center gap-4 border border-transparent hover:border-slate-200">
                          <Paperclip size={20} /> Attachments (0)
                       </button>
                       <button onClick={async () => { if(window.confirm('Purge intelligence node?')) { await api.delete(`/documents/${selectedDoc._id}`); setSelectedDoc(null); fetchDocs(); } }} className="p-6 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[1.8rem] transition-all border border-rose-500/20 active:scale-95 ml-auto">
                          <Trash2 size={24} />
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default KnowledgeBase;
