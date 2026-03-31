import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { 
  Zap, TrendingUp, AlertTriangle, ArrowRight, Brain, 
  X, ShieldCheck, Activity, Target, Cpu, Fingerprint,
  FileText, Download, Share2, Sparkles, AlertCircle, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

const data = [
  { name: 'Mon', revenue: 4000, stock: 2400 },
  { name: 'Tue', revenue: 3000, stock: 2210 },
  { name: 'Wed', revenue: 5000, stock: 2290 },
  { name: 'Thu', revenue: 2780, stock: 2000 },
  { name: 'Fri', revenue: 6890, stock: 1700 },
  { name: 'Sat', revenue: 2390, stock: 2500 },
  { name: 'Sun', revenue: 3490, stock: 2100 },
];

const ForensicReportModal = ({ isOpen, onClose, isRtl, t }: { isOpen: boolean; onClose: () => void; isRtl: boolean; t: any }) => {
  const handleArchive = () => {
    const tid = toast.loading(t('dashboard.forensic.archiving'));
    setTimeout(() => toast.success(t('dashboard.forensic.indexed'), { id: tid }), 1500);
  };

  const handleShare = async () => {
    const tid = toast.loading(t('dashboard.forensic.sharing'));
    try {
      await navigator.clipboard.writeText("https://stockmaster.pro/forensic/" + Math.random().toString(36).substring(7));
      toast.success(t('dashboard.forensic.copied'), { id: tid });
    } catch (e) {
      toast.error(t('dashboard.forensic.failed'), { id: tid });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[#020205] w-full max-w-5xl rounded-[2.5rem] shadow-3xl relative border border-white/5 my-auto overflow-hidden"
          >
            <div className={cn("p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-50/30 dark:bg-transparent", isRtl && "flex-row-reverse")}>
               <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                  <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl rotate-3"><Fingerprint size={24} /></div>
                  <div className={isRtl ? "text-right" : "text-left"}>
                     <h2 className="text-xl font-black italic uppercase text-indigo-950 dark:text-white leading-none">{t('dashboard.forensic.title')}</h2>
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('dashboard.forensic.subtitle')}</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-3 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl active:scale-90 transition-all border-none"><X size={20}/></button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar text-slate-900 dark:text-slate-100">
               <div className="lg:col-span-7 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <ReportStatCard label={t('dashboard.forensic.anomaly')} value="NOMINAL" color="emerald" />
                     <ReportStatCard label={t('dashboard.forensic.integrity')} value="99.9%" color="indigo" />
                  </div>
                  <div className="bg-slate-50 dark:bg-black/40 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner h-48">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                           <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.1} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
               <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{t('dashboard.forensic.spectrum')}</h4>
                     <DistributionBar label={t('dashboard.forensic.penetration')} value={78} color="#6366f1" />
                     <DistributionBar label={t('dashboard.forensic.liquidity')} value={92} color="#10b981" />
                  </div>
               </div>
            </div>

            <div className={cn("p-6 bg-slate-50 dark:bg-black/60 border-t border-white/5 flex justify-between items-center gap-4", isRtl && "flex-row-reverse")}>
               <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{t('dashboard.forensic.ledger')}</p>
               <div className="flex gap-2">
                  <button onClick={handleShare} className="btn-outline px-4 py-2 rounded-lg text-[7px] border-none bg-transparent flex items-center gap-2"><Share2 size={14}/> {t('dashboard.forensic.share')}</button>
                  <button onClick={handleArchive} className="btn-pro px-4 py-2 rounded-lg text-[7px] border-none flex items-center gap-2"><Save size={14}/> {t('dashboard.forensic.archive')}</button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ReportStatCard = ({ label, value, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
     <p className="text-[7px] font-black text-slate-400 uppercase mb-1">{label}</p>
     <h4 className={`text-xl font-black italic tracking-tighter text-${color}-500`}>{value}</h4>
  </div>
);

const DistributionBar = ({ label, value, color }: any) => (
  <div className="space-y-1.5">
     <div className="flex justify-between items-center">
        <span className="text-[7px] font-black uppercase opacity-60">{label}</span>
        <span className="text-[8px] font-black italic">{value}%</span>
     </div>
     <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full" style={{ backgroundColor: color, width: `${value}%` }} />
     </div>
  </div>
);

export const PredictiveEngine = ({ t, isRtl }: { t: any; isRtl: boolean }) => {
  const [activeTab, setActiveTab] = useState<'REVENUE' | 'STOCK'>('REVENUE');
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-200/60 dark:border-white/10 shadow-pro relative overflow-hidden group">
      <div className="relative z-10 flex flex-col h-full">
        <div className={cn("flex justify-between items-start mb-4", isRtl && "flex-row-reverse")}>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h3 className="text-sm font-black text-indigo-950 dark:text-white uppercase italic tracking-tighter flex items-center gap-2">
              <Brain size={14} className="text-indigo-600" /> {t('dashboard.predictions')}
            </h3>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('dashboard.aiProtocol')}</p>
          </div>
          <div className={cn("flex gap-1 p-0.5 bg-slate-50 dark:bg-slate-800 rounded-lg", isRtl && "flex-row-reverse")}>
            {['REVENUE', 'STOCK'].map((tab: any) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-3 py-1 rounded-md text-[7px] font-black transition-all border-none bg-transparent", activeTab === tab ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600")}>{tab}</button>
            ))}
          </div>
        </div>

        <div className="h-[140px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <Area type="monotone" dataKey={activeTab === 'REVENUE' ? 'revenue' : 'stock'} stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.05} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
           <InsightCard label={t('dashboard.engine.growth')} value="+24%" color="emerald" />
           <InsightCard label={t('dashboard.engine.risk')} value="LOW" color="amber" />
        </div>

        <button onClick={() => setIsReportOpen(true)} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md border-none">
           {t('dashboard.engine.report')} <ArrowRight size={12} className={isRtl ? "rotate-180" : ""} />
        </button>
      </div>
      <ForensicReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} isRtl={isRtl} t={t} />
    </div>
  );
};

const InsightCard = ({ label, value, color }: any) => (
  <div className="bg-slate-50/50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
     <p className="text-[6px] font-black text-slate-400 uppercase mb-0.5">{label}</p>
     <p className={cn("text-xs font-black italic", `text-${color}-500`)}>{value}</p>
  </div>
);
