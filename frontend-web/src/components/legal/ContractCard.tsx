import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Activity,
  FileText,
  ChevronRight,
  Globe2,
  GanttChartSquare,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { PulseNode, ForensicLabel } from "../team/TeamUI";

import type { Contract } from "../../types/contract";

interface ContractCardProps {
  c: Contract;
  i: number;
  isRtl: boolean;
}

export const ContractCard = ({ c, i, isRtl }: ContractCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ delay: i * 0.05, duration: 0.4 }}
    key={c._id}
    className="group relative"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur-xl transition duration-700" />
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl p-4 md:p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-4 right-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <span className="text-6xl font-black italic uppercase tracking-tighter select-none">
          {c._id.slice(-4)}
        </span>
      </div>

      <div
        className={cn(
          "flex items-center gap-6 md:gap-8 w-full lg:w-auto",
          isRtl && "flex-row-reverse",
        )}
      >
        <div className="relative shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700">
            {c.type === "NDA" ? (
              <Shield size={32} strokeWidth={1.5} />
            ) : c.type === "SLA" ? (
              <Activity size={32} strokeWidth={1.5} />
            ) : (
              <FileText size={32} strokeWidth={1.5} />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-lg">
            <PulseNode color="emerald" />
          </div>
        </div>

        <div
          className={cn("flex-1 min-w-0", isRtl ? "text-right" : "text-left")}
        >
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 mb-3",
              isRtl && "flex-row-reverse",
            )}
          >
            <h4 className="text-base md:text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-tight group-hover:text-indigo-500 transition-colors leading-none truncate">
              {c.title}
            </h4>
            <div className="flex gap-2">
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all",
                  c.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                )}
              >
                SIG_{c.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/5">
                {c.type}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-wrap items-center gap-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]",
              isRtl && "flex-row-reverse",
            )}
          >
            <span className="flex items-center gap-2 text-indigo-500 shrink-0">
              <Globe2 size={12} /> {c.entityId?.name || "Lattice Node"}
            </span>
            <span className="opacity-20 hidden sm:inline">/</span>
            <span className="flex items-center gap-2 shrink-0">
              <GanttChartSquare size={12} /> EXP:{" "}
              {new Date(c.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 dark:border-white/5 pt-4 lg:pt-0",
          isRtl && "flex-row-reverse",
        )}
      >
        <div className={isRtl ? "text-right" : "text-left"}>
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Commercial Valuation
          </p>
          <p className="text-lg md:text-xl font-black text-slate-950 dark:text-white italic leading-none group-hover:text-indigo-500 transition-colors">
            {(c.value || 0).toLocaleString()}{" "}
            <span className="text-[10px] not-italic opacity-30 uppercase text-slate-500">
              DH
            </span>
          </p>
        </div>
        <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 rounded-2xl transition-all shadow-sm active:scale-90 border-none group/btn">
          <ChevronRight
            size={20}
            strokeWidth={3}
            className={cn(
              "transition-transform group-hover/btn:translate-x-1",
              isRtl && "rotate-180 group-hover/btn:-translate-x-1",
            )}
          />
        </button>
      </div>

      <div className="absolute bottom-2 left-8 flex gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <ForensicLabel label={`CRC_${c._id.slice(0, 8)}`} />
        <ForensicLabel label={`BLOCK_SYNC_VERIFIED`} />
      </div>
    </div>
  </motion.div>
);
