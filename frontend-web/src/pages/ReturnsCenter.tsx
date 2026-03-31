import React, { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  ShieldAlert,
  Package,
  Search,
  Filter,
  RefreshCcw,
  Loader2,
  ArrowUpRight,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  Info,
  Trash2,
  X,
  Save,
  Plus,
  ClipboardList,
  ShieldCheck,
  Box,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export const ReturnsCenter = () => {
  const { t, i18n } = useTranslation();
  const [returns, setReturns] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "CUSTOMER_TO_VENDOR",
    orderId: "",
    purchaseId: "",
    items: [{ productId: "", quantity: 1, reason: "", condition: "OPENED" }],
    notes: "",
  });

  const isRtl = i18n.language === "ar";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rmaRes, ordersRes, productsRes] = await Promise.all([
        api.get("/returns"),
        api.get("/orders"),
        api.get("/products"),
      ]);
      setReturns(rmaRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (e) {
      toast.error(t("returns.toast.linkLost"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.some((i) => !i.productId || !i.reason))
      return toast.error(t("returns.toast.incomplete"));

    setIsSubmitting(true);
    const loadId = toast.loading(t("returns.toast.broadcasting"));
    try {
      await api.post("/returns", formData);
      toast.success(t("returns.toast.success"), { id: loadId });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (e) {
      toast.error(t("returns.toast.failed"), { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "CUSTOMER_TO_VENDOR",
      orderId: "",
      purchaseId: "",
      items: [{ productId: "", quantity: 1, reason: "", condition: "OPENED" }],
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
      case "APPROVED":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]";
      case "INSPECTING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const filtered = returns.filter(
    (r) =>
      r._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.items.some((i: any) =>
        i.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className={cn("w-full space-y-6 pb-20 px-2 md:px-4 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. RMA COMMAND HUD */}
      <header className="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
        <div className={cn("relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10", isRtl && "lg:flex-row-reverse")}>
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-center gap-5",
                isRtl && "flex-row-reverse",
              )}
            >
              <div className="p-5 bg-rose-600 rounded-[2rem] shadow-xl shadow-rose-500/30 rotate-3 transition-transform hover:rotate-0 duration-500">
                <RotateCcw size={36} />
              </div>
              <div className={cn(isRtl && "text-right")}>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                  {t("returns.title").split(" ")[0]}{" "}
                  <span className="text-rose-500">
                    {t("returns.title").split(" ").slice(1).join(" ")}.
                  </span>
                </h1>
                <p className="text-rose-300 font-bold uppercase text-[10px] tracking-[0.5em] mt-2 opacity-80">
                  {t("returns.subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className={cn("flex flex-wrap gap-6 w-full lg:w-auto", isRtl && "lg:flex-row-reverse")}>
            <div className={cn("bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-12 shadow-2xl flex-1 lg:flex-none justify-center", isRtl && "flex-row-reverse")}>
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {t("returns.stats.open")}
                </p>
                <p className="text-4xl font-black text-rose-400 italic leading-none">
                  {returns.filter((r) => r.status !== "COMPLETED").length}
                </p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {t("returns.stats.rate")}
                </p>
                <p className="text-4xl font-black text-emerald-400 italic leading-none">
                  1.2%
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-12 py-6 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 flex items-center gap-4 group flex-1 lg:flex-none justify-center"
            >
              <Plus
                size={24}
                className="group-hover:rotate-90 transition-transform"
              />{" "}
              {t("returns.add")}
            </button>
          </div>
        </div>
      </header>

      {/* 2. OPERATIONAL GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-8">
          <div
            className={cn(
              "flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl backdrop-blur-md transition-all",
              isRtl && "md:flex-row-reverse",
            )}
          >
            <div className="relative flex-1 group">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-all",
                  isRtl ? "right-6" : "left-6",
                )}
                size={22}
              />
              <input
                placeholder={t("returns.fields.reference") + "..."}
                className={cn(
                  "w-full bg-slate-50 dark:bg-black/20 border-none rounded-[1.8rem] py-6 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner",
                  isRtl ? "pr-16 pl-6" : "pl-16 pr-6",
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
              <button className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-rose-600 rounded-3xl shadow-lg transition-all active:scale-95">
                <Filter size={22} />
              </button>
              <button
                onClick={fetchData}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-rose-600 rounded-3xl shadow-lg transition-all active:scale-95 group"
              >
                <RefreshCcw
                  className={cn(
                    "group-hover:rotate-180 transition-transform duration-700",
                    loading && "animate-spin",
                  )}
                  size={22}
                />
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center opacity-20">
                <Loader2
                  size={64}
                  className="animate-spin text-rose-600 mb-6"
                />
                <p className="text-[10px] font-black uppercase tracking-[0.8em]">
                  {t('common.loading')}
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-40 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-30 grayscale">
                <ClipboardList
                  size={80}
                  strokeWidth={1}
                  className="mb-8 text-rose-600"
                />
                <p className="font-black uppercase text-sm tracking-[0.4em]">
                  {t("common.noData")}
                </p>
              </div>
            ) : (
              filtered.map((r, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={r._id}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 group hover:shadow-[0_20px_80px_rgba(244,63,94,0.1)] transition-all duration-700 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div
                    className={cn(
                      "flex items-center gap-10 w-full md:w-auto",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <div className="w-24 h-24 rounded-[2.5rem] bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 relative shrink-0">
                      <Package size={40} />
                      <div className={cn("absolute -bottom-1 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-white/10", isRtl ? "-left-1" : "-right-1")}>
                        <ShieldAlert size={14} />
                      </div>
                    </div>
                    <div className={cn(isRtl ? "text-right" : "text-left")}>
                      <div
                        className={cn(
                          "flex items-center gap-4 mb-3",
                          isRtl && "flex-row-reverse",
                        )}
                      >
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                          #{r._id.slice(-6).toUpperCase()}
                        </h4>
                        <span
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border",
                            getStatusColor(r.status),
                          )}
                        >
                          {t(`returns.status.${r.status}`) as string}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">
                        {t(`returns.types.${r.type}`) as string}
                      </p>
                      <div
                        className={cn(
                          "flex flex-wrap gap-2",
                          isRtl && "justify-end",
                        )}
                      >
                        {r.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className={cn("px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl text-[8px] font-black text-slate-500 uppercase border border-slate-100 dark:border-white/5 flex items-center gap-2", isRtl && "flex-row-reverse")}
                          >
                            <Box size={10} className="text-rose-500" />
                            {item.productId?.name} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-12 w-full md:w-auto justify-between md:justify-end",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <div className={cn(isRtl ? "text-right" : "text-left")}>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">
                        {t("returns.fields.reason")}
                      </p>
                      <p className={cn("text-xs font-bold text-slate-900 dark:text-white uppercase italic opacity-80 line-clamp-1 max-w-[200px] border-rose-500 pl-3", isRtl ? "border-r-2 pr-3 pl-0" : "border-l-2")}>
                        {r.items[0]?.reason}
                      </p>
                    </div>
                    <button className="p-5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-[1.5rem] transition-all border border-transparent hover:border-rose-500/20 active:scale-90">
                      <MoreHorizontal size={24} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* 3. SIDEBAR INTELLIGENCE */}
        <aside className="xl:col-span-4 space-y-8">
          <div className="bg-rose-600 text-white p-10 rounded-[3.5rem] shadow-3xl relative overflow-hidden group">
            <ShieldAlert className="absolute top-[-30px] right-[-30px] w-64 h-64 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
              <h3 className={cn("text-2xl font-black uppercase italic tracking-tighter mb-10", isRtl && "text-right")}>
                {t('returns.analytics.title')}
              </h3>
              <div className="space-y-10">
                <AnalyticNode label={t('returns.analytics.defect1')} val={64} />
                <AnalyticNode label={t('returns.analytics.defect2')} val={28} />
                <AnalyticNode label={t('returns.analytics.defect3')} val={8} />
              </div>
              <button className="w-full mt-12 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-rose-600 transition-all flex items-center justify-center gap-3">
                <Activity size={16} /> {t('returns.analytics.sync')}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl" />
            <h3 className={cn("text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8 italic", isRtl && "text-right")}>
              {t("returns.stats.recovery")}
            </h3>
            <div className="space-y-6">
              <div className={cn("p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all", isRtl && "text-right")}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {t("returns.stats.refunds")}
                </p>
                <div className={cn("flex items-baseline gap-3", isRtl && "flex-row-reverse")}>
                  <p className="text-4xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none">
                    12,480
                  </p>
                  <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">
                    DH
                  </span>
                </div>
              </div>
              <div className={cn("flex items-center gap-4 px-6 py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20", isRtl && "flex-row-reverse")}>
                <ShieldCheck size={20} className="text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-600 uppercase italic">
                  94.2% {t("returns.stats.success")}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* OPEN RMA MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[4rem] p-10 md:p-16 shadow-[0_0_100px_rgba(244,63,94,0.2)] relative border border-white/5 my-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className={cn("absolute top-10 p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-2xl shadow-xl transition-all active:scale-90", isRtl ? "left-10" : "right-10")}
              >
                <X size={24} />
              </button>

              <div
                className={cn(
                  "flex items-center gap-8 mb-16",
                  isRtl && "flex-row-reverse",
                )}
              >
                <div className="p-6 bg-rose-600 rounded-[2.5rem] text-white shadow-2xl rotate-3">
                  <RotateCcw size={40} />
                </div>
                <div className={isRtl ? "text-right" : "text-left"}>
                  <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                    {t("returns.add")}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 italic">
                    {t('returns.modal.protocol')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-10">
                <div className="space-y-4">
                  <label
                    className={cn(
                      "text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] block ml-1",
                      isRtl && "text-right",
                    )}
                  >
                    {t("returns.fields.type")}
                  </label>
                  <div
                    className={cn(
                      "grid grid-cols-1 md:grid-cols-2 gap-4",
                      isRtl && "rtl",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: "CUSTOMER_TO_VENDOR" })
                      }
                      className={cn(
                        "p-6 rounded-[2rem] border-2 font-black text-[11px] uppercase tracking-widest transition-all",
                        formData.type === "CUSTOMER_TO_VENDOR"
                          ? "bg-rose-600 text-white border-rose-500 shadow-xl"
                          : "bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent hover:border-rose-500/30",
                      )}
                    >
                      {t('returns.types.CUSTOMER_TO_VENDOR')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: "VENDOR_TO_SUPPLIER" })
                      }
                      className={cn(
                        "p-6 rounded-[2rem] border-2 font-black text-[11px] uppercase tracking-widest transition-all",
                        formData.type === "VENDOR_TO_SUPPLIER"
                          ? "bg-rose-600 text-white border-rose-500 shadow-xl"
                          : "bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent hover:border-rose-500/30",
                      )}
                    >
                      {t('returns.types.VENDOR_TO_SUPPLIER')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label
                      className={cn(
                        "text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] block ml-1",
                        isRtl && "text-right",
                      )}
                    >
                      {t("returns.fields.orderId")}
                    </label>
                    <select
                      className={cn(
                        "w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-6 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-rose-500 transition-all shadow-inner uppercase",
                        isRtl && "text-right",
                      )}
                      value={formData.orderId}
                      onChange={(e) =>
                        setFormData({ ...formData, orderId: e.target.value })
                      }
                    >
                      <option value="">{t('returns.modal.scanOrder')}</option>
                      {orders.map((o) => (
                        <option key={o._id} value={o._id}>
                          #{o.receiptNumber} ({o.totalPrice} DH)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      className={cn(
                        "text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] block ml-1",
                        isRtl && "text-right",
                      )}
                    >
                      {t("returns.fields.condition")}
                    </label>
                    <select
                      className={cn(
                        "w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-6 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-rose-500 transition-all shadow-inner uppercase",
                        isRtl && "text-right",
                      )}
                      value={formData.items[0].condition}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[0].condition = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                    >
                      <option value="OPENED">{t('returns.conditions.OPENED')}</option>
                      <option value="DAMAGED">{t('returns.conditions.DAMAGED')}</option>
                      <option value="DEFECTIVE">{t('returns.conditions.DEFECTIVE')}</option>
                      <option value="NEW">{t('returns.conditions.NEW')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label
                    className={cn(
                      "text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] block ml-1",
                      isRtl && "text-right",
                    )}
                  >
                    {t('returns.fields.asset')} & {t('returns.fields.reason')}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <select
                        className={cn(
                          "w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-6 font-black text-[11px] text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-rose-500 transition-all shadow-inner uppercase",
                          isRtl && "text-right",
                        )}
                        value={formData.items[0].productId}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[0].productId = e.target.value;
                          setFormData({ ...formData, items: newItems });
                        }}
                      >
                        <option value="">{t('returns.modal.selectAsset')}</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-7">
                      <input
                        required
                        type="text"
                        placeholder={t('returns.modal.defectPlaceholder')}
                        className={cn(
                          "w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-6 font-black text-sm text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-rose-500 transition-all shadow-inner",
                          isRtl && "text-right",
                        )}
                        value={formData.items[0].reason}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[0].reason = e.target.value;
                          setFormData({ ...formData, items: newItems });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 text-white py-7 rounded-[3rem] font-black uppercase text-xs tracking-[0.5em] shadow-2xl shadow-rose-500/30 hover:bg-slate-950 transition-all active:scale-95 mt-10 flex items-center justify-center gap-4 border-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Save size={24} /> {t('returns.modal.submit')}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnalyticNode = ({ label, val }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm font-black italic">{val}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${val}%` }}
        transition={{ duration: 2, ease: "circOut" }}
        className="h-full bg-white shadow-[0_0_15px_white]"
      />
    </div>
  </div>
);

export default ReturnsCenter;
