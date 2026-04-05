import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import api from "../api/client";
import { Search, RefreshCcw } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Types ---
import type { Contract, EntityNode, ContractFormData } from "../types/contract";

// --- Modular Components ---
import { ContractHeader } from "../components/legal/ContractHeader";
import { ContractCard } from "../components/legal/ContractCard";
import { ComplianceSidebar } from "../components/legal/ComplianceSidebar";
import { ContractLoadingState } from "../components/legal/ContractLoadingState";
import { ContractEmptyState } from "../components/legal/ContractEmptyState";

const ContractFormModal = lazy(() =>
  import("../components/legal/ContractFormModal").then((m) => ({
    default: m.ContractFormModal,
  })),
);

const INITIAL_FORM: ContractFormData = {
  title: "",
  entityId: "",
  entityType: "CLIENT",
  type: "SUPPLY",
  value: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  status: "ACTIVE",
};

export const ContractHub = () => {
  const { t, i18n } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [entities, setEntities] = useState<{
    clients: EntityNode[];
    suppliers: EntityNode[];
  }>({ clients: [], suppliers: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isRtl = i18n.language === "ar";

  const [formData, setFormData] = useState<ContractFormData>(INITIAL_FORM);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contRes, clientRes, suppRes] = await Promise.all([
        api.get("/contracts"),
        api.get("/clients"),
        api.get("/suppliers"),
      ]);
      setContracts(contRes.data.data || []);
      setEntities({
        clients: clientRes.data.data || [],
        suppliers: suppRes.data.data || [],
      });
    } catch {
      toast.error("Registry Link Lost");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entityId || !formData.title)
      return toast.error("Parameters Incomplete");
    setIsSubmitting(true);
    const loadId = toast.loading("Synthesizing Legal Deed...");
    try {
      await api.post("/contracts", {
        ...formData,
        value: Number(formData.value),
      });
      toast.success("Deed Synchronized", { id: loadId });
      setIsModalOpen(false);
      setFormData(INITIAL_FORM);
      fetchData();
    } catch {
      toast.error("Registry Refusal", { id: loadId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(
    () =>
      contracts.filter((c) =>
        [c.title, c.entityId?.name].some((v) =>
          v?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      ),
    [contracts, searchQuery],
  );

  const totalValue = useMemo(
    () => contracts.reduce((acc, c) => acc + (c.value || 0), 0),
    [contracts],
  );

  return (
    <div
      className={cn(
        "w-full space-y-6 pb-12 animate-reveal text-slate-900 dark:text-slate-200 px-4 lg:px-0",
        isRtl ? "font-ar text-right" : "font-sans text-left",
      )}
    >
      <ContractHeader
        totalContracts={contracts.length}
        totalValue={totalValue}
        onAdd={() => setIsModalOpen(true)}
        isRtl={isRtl}
        t={t}
      />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-2 rounded-4xl border border-white/10 shadow-pro",
              isRtl && "sm:flex-row-reverse",
            )}
          >
            <div className="relative flex-1 group/input">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 transition-all",
                  isRtl ? "right-6" : "left-6",
                )}
                size={18}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SCAN LEGAL DEEDS..."
                className={cn(
                  "w-full bg-slate-100/50 dark:bg-black/40 border-none rounded-2xl py-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner",
                  isRtl ? "pr-14 pl-6" : "pl-14 pr-6",
                )}
              />
            </div>
            <button
              onClick={fetchData}
              className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all group/refresh shadow-sm hover:bg-white/10"
            >
              <RefreshCcw
                className={cn(
                  "text-slate-400 group-hover/refresh:text-indigo-500 group-hover/refresh:rotate-180 transition-all duration-700",
                  loading && "animate-spin",
                )}
                size={18}
              />
            </button>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <ContractLoadingState />
            ) : filtered.length === 0 ? (
              <ContractEmptyState />
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((c, i) => (
                  <ContractCard key={c._id} c={c} i={i} isRtl={isRtl} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
        <div className="lg:col-span-4 order-1 lg:order-2">
          <ComplianceSidebar />
        </div>
      </main>

      <Suspense fallback={null}>
        <AnimatePresence>
          {isModalOpen && (
            <ContractFormModal
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleCreate}
              entities={entities}
              isRtl={isRtl}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default ContractHub;
