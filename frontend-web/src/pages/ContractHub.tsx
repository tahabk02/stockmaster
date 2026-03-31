import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/client";
import { Search, RefreshCcw, Loader2, Fingerprint, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { ContractHeader } from "../components/legal/ContractHeader";
import { ContractCard } from "../components/legal/ContractCard";
import { ContractFormModal } from "../components/legal/ContractFormModal";
import { ComplianceSidebar } from "../components/legal/ComplianceSidebar";

interface EntityNode { _id: string; name: string; }
interface Contract { _id: string; title: string; entityId: { name: string }; type: string; value: number; endDate: string; status: string; }

export const ContractHub = () => {
  const { t, i18n } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [entities, setEntities] = useState<{clients: EntityNode[], suppliers: EntityNode[]}>({clients: [], suppliers: []});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isRtl = i18n.language === 'ar';

  const [formData, setFormData] = useState({ title: "", entityId: "", entityType: "CLIENT", type: "SUPPLY", value: "", startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "ACTIVE" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contRes, clientRes, suppRes] = await Promise.all([api.get("/contracts"), api.get("/clients"), api.get("/suppliers")]);
      setContracts(contRes.data.data || []); setEntities({ clients: clientRes.data.data || [], suppliers: suppRes.data.data || [] });
    } catch (e) { toast.error("Registry Link Lost"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entityId || !formData.title) return toast.error("Parameters Incomplete");
    setIsSubmitting(true);
    const loadId = toast.loading("Synthesizing Legal Deed...");
    try {
      await api.post("/contracts", { ...formData, value: Number(formData.value) });
      toast.success("Deed Synchronized", { id: loadId }); setIsModalOpen(false);
      setFormData({ title: "", entityId: "", entityType: "CLIENT", type: "SUPPLY", value: "", startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "ACTIVE" });
      fetchData();
    } catch (e) { toast.error("Registry Refusal", { id: loadId }); } finally { setIsSubmitting(false); }
  };

  const filteredContracts = useMemo(() => contracts.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || c.entityId?.name?.toLowerCase().includes(searchQuery.toLowerCase())), [contracts, searchQuery]);
  const totalValue = useMemo(() => contracts.reduce((acc, c) => acc + (c.value || 0), 0), [contracts]);

  return (
    <div className={cn("w-full space-y-8 pb-16 animate-reveal text-slate-900 dark:text-slate-200", isRtl ? "font-ar text-right" : "font-sans text-left")}>
      <ContractHeader totalContracts={contracts.length} totalValue={totalValue} onAdd={() => setIsModalOpen(true)} isRtl={isRtl} t={t} />
      
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2 md:px-0">
         <div className="xl:col-span-8 space-y-8">
            <div className={cn("flex flex-col md:flex-row gap-4 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-3 rounded-[2rem] border border-white/10 shadow-pro", isRtl && "md:flex-row-reverse")}>
               <div className="relative flex-1 group/input"><Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-all", isRtl ? "right-6" : "left-6")} size={18} /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="SCAN LEGAL DEEDS..." className={cn("w-full bg-slate-100/50 dark:bg-black/40 border-none rounded-2xl py-5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl ? "pr-14 pl-6" : "pl-14 pr-6")} /></div>
               <button onClick={fetchData} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all group/refresh shadow-sm border-none bg-transparent"><RefreshCcw className={cn("text-slate-400 group-hover/refresh:text-indigo-500 group-hover/refresh:rotate-180 transition-all duration-700", loading && "animate-spin")} size={18} /></button>
            </div>

            <div className="grid gap-6">
               {loading ? (
                 <div className="py-32 flex flex-col items-center justify-center bg-white/5 rounded-[3rem] border border-white/5 relative overflow-hidden"><div className="absolute inset-0 grid-pattern opacity-5" /><Loader2 size={60} className="animate-spin text-indigo-500 opacity-50 mb-6"/><p className="text-[11px] font-black uppercase tracking-[0.8em] text-indigo-500 animate-pulse italic">Syncing Ledger...</p></div>
               ) : filteredContracts.length === 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 bg-slate-950/10 dark:bg-slate-900/20 backdrop-blur-sm rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center relative overflow-hidden group"><div className="absolute inset-0 grid-pattern opacity-[0.03]" /><div className="relative z-10 flex flex-col items-center"><div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-10 relative"><div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin opacity-20" /><Database size={48} className="text-slate-400 group-hover:text-indigo-500 transition-all duration-700" /></div><h3 className="text-lg font-black uppercase italic tracking-[0.4em] text-slate-400 mb-2">Registry Offline</h3><p className="text-[8px] font-bold uppercase tracking-[0.6em] text-slate-500 opacity-60">No legal deeds detected in the current lattice buffer.</p></div></motion.div>
               ) : (
                 <AnimatePresence mode="popLayout">{filteredContracts.map((c, i) => <ContractCard key={c._id} c={c} i={i} isRtl={isRtl} />)}</AnimatePresence>
               )}
            </div>
         </div>
         <ComplianceSidebar />
      </main>

      <AnimatePresence>{isModalOpen && <ContractFormModal formData={formData} setFormData={setFormData} isSubmitting={isSubmitting} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} entities={entities} isRtl={isRtl} />}</AnimatePresence>
    </div>
  );
};

export default ContractHub;
