import React from "react";
import { motion } from "framer-motion";
import { X, Landmark, Shield, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { PulseNode } from "../team/TeamUI";

interface ContractFormModalProps {
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  entities: { clients: any[]; suppliers: any[] };
  isRtl: boolean;
}

export const ContractFormModal = ({
  formData,
  setFormData,
  isSubmitting,
  onClose,
  onSubmit,
  entities,
  isRtl,
}: ContractFormModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 overflow-y-auto">
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="bg-white dark:bg-[#0b0c10] w-full max-w-2xl rounded-[3rem] p-6 md:p-8 shadow-4xl relative border border-white/10 my-auto overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Shield size={260} strokeWidth={1} />
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-xl transition-all z-20 border-none active:scale-90"
      >
        <X size={24} strokeWidth={3} />
      </button>

      <form onSubmit={onSubmit} className="space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl text-white shadow-xl flex items-center justify-center rotate-6">
            <Landmark size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PulseNode color="indigo" />
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                Logic Provisioning
              </span>
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-950 dark:text-white tracking-tighter leading-none">
              Legal Deed Setup
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">
            Deed Identifier
          </label>
          <input
            required
            placeholder="STRATEGIC SERVICE AGREEMENT"
            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-black text-sm uppercase italic text-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">
              Entity Cluster
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-black text-xs text-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
              value={formData.entityType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  entityType: e.target.value as any,
                  entityId: "",
                })
              }
            >
              <option value="CLIENT">Client Registry</option>
              <option value="SUPPLIER">Supplier Registry</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">
              Target Node
            </label>
            <select
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-black text-xs text-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
              value={formData.entityId}
              onChange={(e) =>
                setFormData({ ...formData, entityId: e.target.value })
              }
            >
              <option value="">SELECT TARGET...</option>
              {formData.entityType === "CLIENT"
                ? entities.clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                : entities.suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">
              Protocol Type
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-black text-xs text-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
            >
              <option value="SUPPLY">Logistics (Supply)</option>
              <option value="SLA">Maintenance (SLA)</option>
              <option value="NDA">Confidentiality (NDA)</option>
              <option value="LEASE">Asset Lease</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">
              Commercial Valuation
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-black text-lg italic text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-4 rounded-4xl font-black uppercase text-xs tracking-[0.5em] shadow-xl hover:bg-slate-950 transition-all active:scale-95 flex items-center justify-center gap-4 border-none"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Shield size={24} /> Commit to Registry
            </>
          )}
        </button>
      </form>
    </motion.div>
  </div>
);
