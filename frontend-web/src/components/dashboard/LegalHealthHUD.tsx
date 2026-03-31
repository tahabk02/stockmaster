import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, AlertTriangle, ShieldCheck, ChevronRight, Gavel } from "lucide-react";
import api from "../../api/client";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

export const LegalHealthHUD = ({ t, isRtl }: { t: any; isRtl: boolean }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await api.get("/legal/health");
      setData(res.data);
    } catch (e) {
      console.error("Legal HUD Error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-200/60 dark:border-white/10 h-full animate-pulse flex flex-col justify-center items-center gap-4">
       <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl" />
       <div className="w-24 h-2 bg-slate-100 dark:bg-white/5 rounded-full" />
    </div>
  );

  const scoreColor = data?.score > 80 ? "emerald" : data?.score > 50 ? "amber" : "rose";

  return (
    <div className="bg-[#0b141a] text-white rounded-[1.5rem] p-5 border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer h-full flex flex-col" onClick={() => navigate("/legal/consultant")}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
      
      <div className={cn("relative z-10 flex justify-between items-start mb-6", isRtl && "flex-row-reverse")}>
         <div>
            <h3 className="text-sm font-black italic tracking-tighter uppercase flex items-center gap-2">
               <Scale size={14} className="text-amber-500" /> LEGAL_HEALTH
            </h3>
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">JURISDICTION: MOROCCO_v26</p>
         </div>
         <div className={cn("text-right", isRtl ? "text-left" : "text-right")}>
            <span className={cn("text-2xl font-black italic tracking-tighter", `text-${scoreColor}-500`)}>{data?.score}%</span>
         </div>
      </div>

      <div className="flex-1 space-y-4 mb-6">
         {data?.alerts.length > 0 ? (
           <div className={cn("p-4 rounded-xl bg-white/5 border border-white/10 space-y-2", isRtl && "text-right")}>
              <div className="flex items-center gap-2 text-amber-500">
                 <AlertTriangle size={12} />
                 <span className="text-[8px] font-black uppercase tracking-widest">PENDING_SIGNAL</span>
              </div>
              <p className="text-[10px] font-bold text-slate-300 leading-tight uppercase italic">{data.alerts[0].title}</p>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-4 opacity-40 grayscale">
              <ShieldCheck size={32} className="text-emerald-500 mb-2" />
              <p className="text-[8px] font-black uppercase tracking-widest">LATTICE_SECURED</p>
           </div>
         )}
      </div>

      <button className="w-full py-3 bg-white/5 hover:bg-amber-600 transition-all rounded-xl border border-white/10 flex items-center justify-center gap-2 group/btn">
         <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t('common.viewDetails', { defaultValue: "INITIALIZE_CONSULTATION" })}</span>
         <ChevronRight size={12} className={cn("transition-transform group-hover/btn:translate-x-1", isRtl && "rotate-180")} />
      </button>
    </div>
  );
};
