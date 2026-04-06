import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getClients, getClientById, createClient, updateClient, deleteClient } from "../services/client.service";
import type { Client } from "../types/client";
import { UserPlus, Search, Activity, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { can, PERMISSIONS } from "../permissions/can";
import { useAuth } from "../store/auth.slice";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { ClientHeaderHUD } from "../components/clients/ClientHeaderHUD";
import { ClientCard } from "../components/clients/ClientCard";
import { ClientDetailDrawer } from "../components/clients/ClientDetailDrawer";
import { ClientFormModal } from "../components/clients/ClientFormModal";

export const Clients = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAdmin = useMemo(() => ["ADMIN", "SUPER_ADMIN", "VENDOR"].includes(user?.role || ""), [user]);

  const [clients, setClients] = useState<any[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientDetail, setClientDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", type: "INDIVIDUAL" as any, taxId: "", vatNumber: "", creditLimit: "0", status: "ACTIVE" as any });

  const fetchClients = useCallback(async () => {
    try { setLoading(true); const data = await getClients(1, searchTerm); setClients(data.clients || []); setTotalClients(data.total || 0); } 
    catch (e) { toast.error(t('clients.messages.accessFailure')); } finally { setLoading(false); }
  }, [searchTerm, t]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleExport = () => {
    const csv = "Name,Type,Phone,Email,Debt\n" + clients.map(c => `${c.name},${c.type},${c.phone},${c.email},${c.totalDebt}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Clients-Registry-${Date.now()}.csv`; a.click();
  };

  const handleOpenDrawer = async (c: any) => {
    setSelectedClient(c); setIsDrawerOpen(true); setLoadingDetail(true);
    try { const detail = await getClientById(c._id); setClientDetail(detail); } 
    catch (e) { toast.error(t('clients.messages.fetchError')); } finally { setLoadingDetail(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tid = toast.loading(t('clients.messages.broadcasting'));
    try {
      const p = { ...form, creditLimit: Number(form.creditLimit) };
      if (editingId) await updateClient(editingId, p); else await createClient(p);
      toast.success(t('clients.messages.updated'), { id: tid }); setIsModalOpen(false); setEditingId(null); setForm({ name: "", phone: "", email: "", address: "", type: "INDIVIDUAL", taxId: "", vatNumber: "", creditLimit: "0", status: "ACTIVE" }); fetchClients();
    } catch (err: any) { toast.error(err.response?.data?.message || t('clients.messages.transmissionError'), { id: tid }); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('clients.messages.terminationProtocol'))) { try { await deleteClient(id); toast.success(t('clients.messages.decommissioned')); fetchClients(); } catch (e) { toast.error(t('clients.messages.terminationBlocked')); } }
  };

  const isRtl = i18n.language === "ar";

  return (
    <div className={cn("w-full space-y-10 pb-32 animate-reveal", isRtl ? "text-right" : "text-left")}>
      <ClientHeaderHUD totalClients={totalClients} totalExposure={clients.reduce((a,c)=>a+(c.totalDebt||0),0)} isRtl={isRtl} t={t} />
      
      {/* CONTROL_STATION */}
      <div className="glass-card p-4 rounded-full border-white/10 dark:bg-slate-950/40 flex flex-col md:flex-row gap-4 shadow-pro backdrop-blur-3xl">
        <div className="relative flex-1 group">
           <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-6" : "left-6")} size={20} />
           <input 
             placeholder={t('clients.searchPlaceholder')} 
             className={cn("w-full bg-slate-100 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full py-5 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all italic", isRtl ? "pr-16 text-right" : "pl-16 pr-6")} 
             value={searchTerm} 
             onChange={(e)=>setSearchTerm(e.target.value)} 
           />
        </div>
        <div className="flex gap-4">
           <button onClick={handleExport} className="px-10 py-5 bg-white/5 border border-white/10 hover:border-indigo-500/30 text-slate-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 italic shadow-xl">
              <Download size={16} /> {t('clients.exportCSV')}
           </button>
           {isAdmin && (
             <button 
               onClick={()=>{setEditingId(null); setForm({ name: "", phone: "", email: "", address: "", type: "INDIVIDUAL", taxId: "", vatNumber: "", creditLimit: "0", status: "ACTIVE" }); setIsModalOpen(true);}} 
               className="group relative px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-4xl hover:scale-105 transition-all active:scale-95 border-none italic overflow-hidden"
             >
                <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-4">{t('clients.registerNode')} <UserPlus size={18} /></span>
             </button>
           )}
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-8">
           <div className="relative">
              <div className="w-24 h-24 border-4 border-dashed border-indigo-500/20 rounded-full animate-spin-slow" />
              <Activity size={40} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-500 animate-pulse italic">{t('clients.scanning')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
           {clients.map((c, i) => <ClientCard key={c._id} c={c} idx={i} isAdmin={isAdmin} t={t} onOpenDrawer={handleOpenDrawer} onEdit={(cl)=>{setEditingId(cl._id); setForm({name:cl.name, phone:cl.phone, email:cl.email||"", address:cl.address||"", type:cl.type, taxId:cl.taxId||"", vatNumber:cl.vatNumber||"", creditLimit:String(cl.creditLimit||0), status:cl.status}); setIsModalOpen(true);}} onDelete={handleDelete} />)}
        </div>
      )}

      <ClientDetailDrawer isOpen={isDrawerOpen} onClose={()=>setIsDrawerOpen(false)} selectedClient={selectedClient} clientDetail={clientDetail} loadingDetail={loadingDetail} isRtl={isRtl} t={t} onEdit={(cl)=>{setIsDrawerOpen(false); setEditingId(cl._id); setForm({name:cl.name, phone:cl.phone, email:cl.email||"", address:cl.address||"", type:cl.type, taxId:cl.taxId||"", vatNumber:cl.vatNumber||"", creditLimit:String(cl.creditLimit||0), status:cl.status}); setIsModalOpen(true);}} onExport={handleExport} canViewInvoices={can(user?.role || null, PERMISSIONS.INVOICES_VIEW)} />
      <AnimatePresence>{isModalOpen && <ClientFormModal editingId={editingId} form={form} handleFormChange={(e: any)=>setForm({...form, [e.target.name]: e.target.value})} isSubmitting={isSubmitting} isRtl={isRtl} onClose={()=>setIsModalOpen(false)} onSubmit={handleSubmit} t={t} />}</AnimatePresence>
    </div>
  );
};

export default Clients;
