import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Eye, Edit } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductInventoryGridProps {
  products: any[];
  isRtl: boolean;
  t: (key: string) => string;
  onView: (p: any) => void;
  onEdit: (p: any) => void;
}

export const ProductInventoryGrid = ({
  products,
  isRtl,
  t,
  onView,
  onEdit,
}: ProductInventoryGridProps) => {
  const getStockClasses = (quantity: number) => {
    if (quantity < 5) {
      return {
        dot: "bg-rose-500 animate-pulse",
        text: "text-rose-700",
        badgeBg: "bg-rose-50",
        badgeText: "text-rose-700",
        badgeBorder: "border-rose-100",
        border: "border-rose-100",
        label: t("inventory.critical") || "Critical",
      };
    }

    if (quantity < 20) {
      return {
        dot: "bg-amber-500",
        text: "text-amber-700",
        badgeBg: "bg-amber-50",
        badgeText: "text-amber-700",
        badgeBorder: "border-amber-100",
        border: "border-amber-100",
        label: t("inventory.warning") || "Warning",
      };
    }

    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      badgeBorder: "border-emerald-100",
      border: "border-emerald-100",
      label: t("inventory.success") || "Stock OK",
    };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-2 md:px-0">
      <AnimatePresence>
        {products.map((p, idx) => {
          const status = getStockClasses(p.quantity ?? 0);
          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.02, duration: 0.4 }}
              key={p._id || idx}
              className={cn(
                "bg-white dark:bg-slate-900 shadow-sm border p-3 rounded-[1.5rem] group flex flex-col transition-all",
                status.border,
                "border-[#F3F4F6] dark:border-white/5 hover:border-[color:var(--primary-color)]/40",
              )}
            >
              <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative border border-slate-100 dark:border-white/5 transition-colors shadow-inner">
                {p.image ? (
                  <img
                    src={p.image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt=""
                  />
                ) : (
                  <Package
                    className="text-slate-300 dark:text-slate-800"
                    size={32}
                    strokeWidth={1}
                  />
                )}
                <div
                  className={`absolute top-2 ${isRtl ? "right-2" : "left-2"}`}
                >
                  <span
                    className={cn(
                      "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[6px] font-black uppercase border shadow-sm",
                      status.badgeBg,
                      status.badgeText,
                      status.badgeBorder,
                    )}
                  >
                    {p.category && typeof p.category === "object"
                      ? (p.category as any).name
                      : "Asset"}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-[11px] truncate mb-0 leading-tight group-hover:text-[color:var(--primary-color)] transition-colors text-slate-950 dark:text-white font-black italic uppercase tracking-tighter">
                  {p.name}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-black text-[color:var(--primary-color)] dark:text-indigo-400 italic">
                    {(p.price || 0).toLocaleString()}{" "}
                    <span className="text-[7px] not-italic opacity-50 uppercase font-bold">
                      DH
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.1)]",
                        status.dot,
                      )}
                    />
                    <p
                      className={cn(
                        "text-[9px] font-black uppercase",
                        status.text,
                      )}
                    >
                      {p.quantity} U
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-50 dark:border-white/5 items-center justify-between">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.18em] border",
                    status.badgeBg,
                    status.badgeText,
                    status.badgeBorder,
                  )}
                >
                  {status.label}
                </span>
                <div className="flex gap-1.5 w-full md:w-auto">
                  <button
                    onClick={() => onView(p)}
                    className="flex-1 bg-[color:var(--primary-color)] text-white py-2 rounded-lg flex items-center justify-center hover:bg-[color:var(--primary-color)]/90 transition-all shadow-md active:scale-95 group/btn text-[8px] font-black uppercase border-none"
                  >
                    <Eye size={10} className="mr-1" /> {t("common.view")}
                  </button>
                  <button
                    onClick={() => onEdit(p)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-[color:var(--primary-color)] hover:text-white transition-all active:scale-95 border-none"
                  >
                    <Edit size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
