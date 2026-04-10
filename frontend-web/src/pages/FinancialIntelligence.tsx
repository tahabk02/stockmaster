import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Receipt,
  Percent,
  Briefcase,
  Activity,
  Calendar,
  Download,
  RefreshCcw,
  Loader2,
  Wallet,
  ShieldCheck,
  Zap,
  X,
  FileText,
  Table,
  Filter,
  Coins,
  CreditCard,
  BarChart as BarChartIcon,
  Shield,
  AlertTriangle,
  Cpu,
  Crosshair,
  Radar as RadarIcon,
  Globe,
  Database,
  Search,
  Flame,
  Binary,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
} from "recharts";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

// --- Hard System Assets ---

const Scanline = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-50">
    <motion.div 
      animate={{ y: ["-100%", "100%"] }} 
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      className="w-full h-[150px] bg-gradient-to-b from-transparent via-indigo-500/[0.08] to-transparent opacity-30"
    />
  </div>
);

const PulseNode = ({ color = "indigo", label }: { color?: string, label?: string }) => (
  <div className="flex items-center gap-2">
    <div className="relative flex items-center justify-center w-2 h-2">
      <div className={cn("absolute inset-0 rounded-full animate-ping opacity-40", `bg-${color}-500`)} />
      <div className={cn("relative w-1.5 h-1.5 rounded-full shadow-sm", `bg-${color}-500`)} />
    </div>
    {label && <span className={cn("text-[7px] font-black uppercase tracking-widest", `text-${color}-500`)}>{label}</span>}
  </div>
);

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/10 p-6 rounded-[1rem] shadow-4xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 border-b border-white/5 pb-2 italic text-left">
          SIGNAL_TRACE_{String(label || '').toUpperCase()}
        </p>
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center gap-12">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('fiscal.stats.revenue')}</span>
            <span className="text-sm font-black text-white italic tabular-nums">
              {payload[0].value.toLocaleString()} <span className="text-[8px] not-italic opacity-40">MAD</span>
            </span>
          </div>
          <div className="flex justify-between items-center gap-12">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t('fiscal.stats.profit')}</span>
            <span className="text-sm font-black text-emerald-400 italic tabular-nums">
              {payload[1].value.toLocaleString()} <span className="text-[8px] not-italic opacity-40">MAD</span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const FinancialIntelligence = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [timeRange, setTimeRange] = useState<"6M" | "1Y" | "ALL">("6M");
  const [activeView, setActiveTab] = useState<"CORE" | "LEDGER" | "AI">("CORE");

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/financial/sync");
      setData(res.data.data);
      const histRes = await api.get("/financial/history");
      setHistory(histRes.data.data);
    } catch (e) {
      toast.error(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinance(); }, []);

  const filteredHistory = React.useMemo(() => {
    if (timeRange === "6M") return history.slice(0, 6).reverse();
    if (timeRange === "1Y") return history.slice(0, 12).reverse();
    return history.slice().reverse();
  }, [history, timeRange]);

  const radarData = React.useMemo(() => {
    if (!data?.diagnostics) return [];
    return [
      { subject: t('fiscal.stats.revenue').split(' ')[1] || "REV", A: data.diagnostics.growth, fullMark: 100 },
      { subject: t('fiscal.stats.margin').split(' ')[1] || "MARG", A: data.diagnostics.margin * 2, fullMark: 100 },
      { subject: t('fiscal.stats.efficiency').split(' ')[1] || "EFF", A: data.diagnostics.efficiencyScore, fullMark: 100 },
      { subject: t('fiscal.stability'), A: 85, fullMark: 100 },
      { subject: t('fiscal.liquidity'), A: 70, fullMark: 100 },
    ];
  }, [data, t]);

  const isRtl = i18n.language === 'ar';

  if (loading)
    return (
      <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 dark:opacity-10" />
        <div className="relative">
          <div className="w-32 h-32 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin-slow" />
          <Terminal size={48} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
        </div>
        <p className="text-[12px] font-black uppercase tracking-[1.5em] text-slate-600 dark:text-white animate-pulse italic mt-12 mr-[-1.5em]">{t('fiscal.booting')}</p>
      </div>
    );

  return (
    <div className={cn("w-full p-2 md:p-4 space-y-8 pb-32 animate-reveal relative min-h-screen text-slate-900 dark:text-slate-200", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. HARD SYSTEM HUD HEADER */}
      <header className="group relative bg-white dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 p-8 md:p-12 rounded-[2.5rem] overflow-hidden transition-all duration-700 shadow-sm dark:shadow-4xl">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-indigo-600/10 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none" />
         <Scanline />

         <div className={cn("relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8", isRtl && "flex-col")}>
            <div className="space-y-6 w-full xl:w-auto">
               <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
                  <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 border border-white/20">
                     <Cpu size={32} className="text-white animate-pulse" />
                  </div>
                  <div className={isRtl ? "text-right" : "text-left"}>
                     <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900 dark:text-white">
                       {t('fiscal.title').split(' ')[0]}_<span className="text-emerald-600 dark:text-indigo-500">{t('fiscal.oscillator')}</span>
                     </h1>
                     <div className={cn("flex items-center gap-4 mt-3 ml-1", isRtl && "flex-row-reverse")}>
                        <PulseNode color="emerald" label="Lattice_Sync_v9.4" />
                        <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{t('dashboard.traceId')}: 0x82F...A9</span>
                     </div>
                  </div>
               </div>

               <nav className={cn("flex bg-slate-50 dark:bg-black/20 p-1 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-inner w-fit", isRtl && "flex-row-reverse mx-auto xl:mx-0")}>
                  {(["CORE", "LEDGER", "AI"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-none relative overflow-hidden group/btn shadow-sm", activeView === tab ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-md scale-105" : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent")}>
                       <span className="relative z-10">{tab === "CORE" ? t('fiscal.telemetry') : tab === "LEDGER" ? t('fiscal.forensicLogs') : t('fiscal.neuralProjection')}</span>
                    </button>
                  ))}
               </nav>
            </div>

            <div className={cn("flex flex-wrap gap-4 relative z-10 w-full xl:w-auto", isRtl && "flex-row-reverse justify-center")}>
               <div className={cn("bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 p-6 rounded-[2rem] flex items-center gap-8 shadow-sm dark:shadow-3xl hover:border-emerald-500/30 transition-all", isRtl && "flex-row-reverse")}>
                  <div className="text-center space-y-1">
                     <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{t('fiscal.resonanceIndex')}</p>
                     <p className="text-4xl font-black text-emerald-500 italic leading-none tabular-nums">A+</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200 dark:bg-white/10" />
                  <div className="text-center space-y-1">
                     <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{t('fiscal.capitalVelocity')}</p>
                     <p className="text-4xl font-black text-emerald-600 dark:text-indigo-400 italic leading-none tabular-nums">
                       {((data?.netProfit / (data?.revenue || 1)) * 100).toFixed(1)}<span className="text-base opacity-40">%</span>
                     </p>
                  </div>
               </div>
               <div className={cn("flex xl:flex-col gap-2", isRtl && "flex-row-reverse")}>
                  <button onClick={fetchFinance} className="p-5 bg-white dark:bg-white/5 hover:bg-emerald-500 rounded-2xl border border-slate-200/60 dark:border-white/10 text-slate-400 dark:text-white transition-all active:scale-90 shadow-sm dark:shadow-xl group/sync">
                     <RefreshCcw size={20} className="group-hover/sync:rotate-180 transition-transform duration-1000" />
                  </button>
                  <button onClick={() => setShowExport(true)} className="p-5 bg-emerald-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95 hover:bg-emerald-600">
                     <Download size={20} />
                  </button>
               </div>
            </div>
         </div>
      </header>


      <AnimatePresence mode="wait">
        {activeView === "CORE" && (
          <motion.div key="core" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            {/* 2. HARD METRIC GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <HardMetricNode label={t('fiscal.stats.revenue')} value={data?.revenue} icon={Wallet} color="indigo" delay={0.1} />
               <HardMetricNode label={t('fiscal.stats.cogs')} value={data?.costOfGoodsSold} icon={Flame} color="amber" delay={0.2} />
               <HardMetricNode label={t('fiscal.stats.profit')} value={data?.netProfit} icon={TrendingUp} color="emerald" highlight delay={0.3} />
               <HardMetricNode label={t('fiscal.stats.tax')} value={data?.taxAmount} icon={Binary} color="rose" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
               {/* 3. TEMPORAL TRAJECTORY CHART */}
               <div className="xl:col-span-8 bg-white dark:bg-slate-950 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-4xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-pulse" />
                  <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10", isRtl && "md:flex-row-reverse")}>
                     <div className={isRtl ? "text-right" : "text-left"}>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-950 dark:text-white leading-none">{t('fiscal.temporalFlux')}</h3>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic">{t('fiscal.holographicActive')}</p>
                     </div>
                     <div className={cn("flex bg-slate-100 dark:bg-black/20 p-1 rounded-xl border border-slate-200/60 dark:border-white/5", isRtl && "flex-row-reverse")}>
                        {["6M", "1Y", "ALL"].map((range: any) => (
                          <button key={range} onClick={() => setTimeRange(range)} className={cn("px-5 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest border-none", timeRange === range ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent")}>{range}</button>
                        ))}
                     </div>
                  </div>

                  <div className="h-[380px] w-full relative z-10">
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={filteredHistory}>
                           <defs>
                              <linearGradient id="hardProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                              <linearGradient id="hardRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} /></linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="currentColor" opacity={0.05} />
                           <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: "900", fill: "currentColor" }} style={{ textTransform: 'uppercase' }} dy={15} className="text-slate-400" />
                           <YAxis hide />
                           <Tooltip content={<CustomTooltip t={t} />} cursor={{ stroke: "rgba(99, 102, 241, 0.2)", strokeWidth: 2 }} />
                           <Bar dataKey="revenue" fill="url(#hardRev)" radius={[8, 8, 0, 0]} barSize={40} />
                           <Area type="stepAfter" dataKey="netProfit" stroke="#10b981" strokeWidth={4} fill="url(#hardProfit)" activeDot={{ r: 8, fill: "#10b981", stroke: "#000", strokeWidth: 3 }} />
                        </ComposedChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* 4. VECTOR DIAGNOSTIC HUD */}
               <div className="xl:col-span-4 bg-white dark:bg-slate-950 backdrop-blur-3xl p-8 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-4xl flex flex-col items-center justify-center relative overflow-hidden">
                  <Scanline />
                  <div className="absolute top-10 text-center w-full">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-500 mb-2 italic">{t('fiscal.vectorDiagnostics')}</h4>
                     <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic opacity-60 italic">{t('fiscal.bandwidthCore')}</p>
                  </div>
                  <div className="w-full h-[320px] mt-12">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                           <PolarGrid stroke="currentColor" opacity={0.1} className="text-slate-300 dark:text-white" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 8, fontWeight: "900" }} className="text-slate-400" />
                           <Radar name="Strategy" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.1} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full mt-8">
                     <HardStatus label={t('fiscal.stability')} val="85%" color="emerald" />
                     <HardStatus label={t('fiscal.liquidity')} val="70%" color="amber" />
                  </div>
               </div>
            </div>

            {/* 5. CAPITAL BURN & NEURAL ALLOCATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-white dark:bg-slate-950 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-4xl relative overflow-hidden">
                  <h3 className={cn("text-xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-4 text-slate-950 dark:text-white", isRtl && "flex-row-reverse")}>
                    <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20"><Flame className="text-amber-500" size={24} /></div>
                    {t('fiscal.burnTelemetry')}
                  </h3>
                  <div className="space-y-8 relative z-10">
                     <BurnNode label={t('fiscal.nodes.sourcing')} value="45%" color="amber" isRtl={isRtl} />
                     <BurnNode label={t('fiscal.nodes.ops')} value="15%" color="indigo" isRtl={isRtl} />
                     <BurnNode label={t('fiscal.nodes.tax')} value="20%" color="rose" isRtl={isRtl} />
                     <BurnNode label={t('fiscal.nodes.margin')} value="20%" color="emerald" isRtl={isRtl} />
                  </div>
               </div>

               <div className="lg:col-span-2 bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-4xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20" />
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-48 -mt-48 blur-[100px] animate-pulse" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                     <div className={cn("flex items-center gap-5 mb-10", isRtl && "flex-row-reverse")}>
                        <div className="p-4 bg-black/30 rounded-[1.8rem] border border-white/20 backdrop-blur-3xl shadow-2xl"><Cpu size={32} className="animate-pulse" /></div>
                        <div className={isRtl ? "text-right" : "text-left"}>
                           <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{t('fiscal.allocationCore')}</h3>
                           <p className="text-white/60 font-black text-[9px] tracking-[0.6em] mt-3 italic">{t('fiscal.predictiveEnabled')}</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="p-8 bg-black/30 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-inner flex flex-col justify-center">
                           <p className={cn("text-lg font-black italic text-white/90 leading-relaxed uppercase tracking-tight", isRtl ? "text-right" : "text-left")}>
                             "SYSTEM_DETECTED: 12.4% MARGIN_GAIN PROBABLE IF SOURCING NODES ARE OPTIMIZED BY 5% WITHIN TEMPORAL_CYCLE_Q3."
                           </p>
                        </div>
                        <div className="flex flex-col gap-4 justify-center">
                           <HardProjection label={t('fiscal.forecast')} val="+18.5%" color="indigo" />
                           <HardProjection label="BURN_RISK_LEVEL" val="MINIMAL" color="emerald" />
                           <HardProjection label="CAPITAL_FLOW_STATUS" val="OPTIMAL" color="indigo" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeView === "LEDGER" && (
          <motion.div key="ledger" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-white dark:bg-slate-950 backdrop-blur-3xl rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-4xl overflow-hidden relative">
             <div className={cn("p-12 border-b border-slate-100 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10", isRtl && "md:flex-row-reverse")}>
                <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                   <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl rotate-6 border border-white/20"><Database size={32} /></div>
                   <div className={isRtl ? "text-right" : "text-left"}>
                      <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none">{t('fiscal.registryTraceHub')}</h2>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em] mt-3 italic">FORENSIC_REGISTRY_ACTIVE</p>
                   </div>
                </div>
                <div className="relative group w-full md:w-[400px]">
                   <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all", isRtl ? "right-6" : "left-6")} size={20} />
                   <input placeholder={t('fiscal.scanTraceId')} className={cn("w-full bg-slate-50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 rounded-[2rem] py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all italic shadow-inner text-slate-900 dark:text-white", isRtl ? "pr-16 text-right" : "pl-16 pr-6")} />
                </div>
             </div>
             <div className="overflow-x-auto custom-scrollbar relative z-10">
                <table className={cn("w-full border-collapse min-w-[1100px]", isRtl ? "text-right" : "text-left")}>
                   <thead>
                      <tr className="bg-slate-50 dark:bg-white/[0.03] text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] border-b border-slate-100 dark:border-white/5 italic">
                         <th className="p-10 text-center w-24">IDX</th>
                         <th className="p-10">{t('fiscal.temporalNode')}</th>
                         <th className="p-10">{t('fiscal.registryRef')}</th>
                         <th className="p-10">{t('fiscal.payloadValue')}</th>
                         <th className="p-10 text-center">{t('fiscal.logicStatus')}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {history.map((h, i) => (
                        <tr key={i} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group cursor-default">
                           <td className="p-10 text-center font-black text-[10px] text-slate-600 opacity-40">#{(i+1).toString().padStart(3, '0')}</td>
                           <td className="p-10"><span className="text-sm font-black text-slate-950 dark:text-white uppercase italic tracking-tighter">{h.period}</span></td>
                           <td className="p-10 font-mono text-[11px] font-black text-indigo-500 uppercase bg-indigo-500/5 px-4 py-1.5 rounded-lg w-fit border border-indigo-500/10">0X-REF-{(i+100).toString(16).toUpperCase()}</td>
                           <td className="p-10"><span className="text-2xl font-black text-slate-950 dark:text-white italic tabular-nums">{(h.revenue || 0).toLocaleString()} <span className="text-xs opacity-30 ml-1 uppercase">MAD</span></span></td>
                           <td className="p-10"><div className="flex justify-center"><div className="px-6 py-2.5 rounded-xl text-[9px] font-black border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 shadow-pro uppercase tracking-[0.3em] flex items-center gap-3">VERIFIED_TRACE</div></div></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </motion.div>
        )}

        {activeView === "AI" && (
          <motion.div 
            key="ai" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-950 rounded-[4rem] p-8 md:p-16 text-white shadow-[0_0_100px_rgba(79,70,229,0.2)] relative overflow-hidden border border-white/10"
          >
             <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)]" />
             
             <div className="relative z-10 flex flex-col items-center justify-center space-y-16 py-12">
                {/* AI Core Visualization */}
                <div className="relative">
                   <motion.div 
                     animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                     className="w-64 h-64 border-4 border-dashed border-indigo-500/20 rounded-full" 
                   />
                   <motion.div 
                     animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     className="w-56 h-56 border-2 border-dashed border-emerald-500/20 rounded-full absolute inset-0 m-auto" 
                   />
                   <div className="absolute inset-0 m-auto w-32 h-32 bg-indigo-600 rounded-[3rem] shadow-[0_0_60px_rgba(79,70,229,0.6)] border border-white/30 flex items-center justify-center rotate-45 group">
                      <Cpu size={56} className="text-white -rotate-45 animate-pulse group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   
                   {/* Orbiting Signal Nodes */}
                   {[0, 72, 144, 216, 288].map((angle, i) => (
                     <motion.div 
                       key={i}
                       animate={{ rotate: 360 }} 
                       transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0"
                       style={{ transform: `rotate(${angle}deg)` }}
                     >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 border border-indigo-500/50 rounded-lg flex items-center justify-center shadow-lg">
                           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                        </div>
                     </motion.div>
                   ))}
                </div>

                <div className="text-center space-y-6 max-w-3xl">
                   <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-400">{t('fiscal.neuralProjection')}</h2>
                   <div className="flex items-center justify-center gap-4">
                      <PulseNode color="emerald" label={t('fiscal.deepLatticeParsing')} />
                      <div className="w-px h-4 bg-white/10" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] italic">{t('fiscal.precisionIndex')}: 98.42%</span>
                   </div>
                   <p className="text-slate-400 font-bold italic text-lg md:text-xl leading-relaxed pt-8 border-t border-white/5 uppercase tracking-tight">
                     The neural core is currently synthesizing 1.2M historical registry nodes to generate temporal trajectory signals. Predictive consensus is indexed as <span className="text-indigo-500">OPTIMAL</span>.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                   <NeuralDataNode label={t('fiscal.forecast')} val="+18.52%" desc="Temporal_Delta_Positive" icon={TrendingUp} color="indigo" />
                   <NeuralDataNode label="ENTROPY_RATING" val="MINIMAL" desc="Lattice_Stability_Ok" icon={ShieldCheck} color="emerald" />
                   <NeuralDataNode label="COHERENCE_SYNC" val="94.2%" desc="Signal_Resonance_High" icon={Activity} color="indigo" />
                </div>

                {/* Holographic Projection Chart */}
                <div className="w-full max-w-6xl bg-white/5 rounded-[3rem] border border-white/10 p-10 backdrop-blur-xl relative group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                   <div className={cn("flex justify-between items-center mb-10", isRtl && "flex-row-reverse")}>
                      <div className={isRtl ? "text-right" : "text-left"}>
                         <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{t('fiscal.marketResonance')}</h4>
                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">{t('fiscal.holographicVector')}</p>
                      </div>
                      <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">{t('fiscal.liveCalculation')}</span>
                      </div>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={filteredHistory}>
                            <defs>
                               <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="5" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                               </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="10 10" stroke="white" opacity={0.03} vertical={false} />
                            <Tooltip content={<CustomTooltip t={t} />} cursor={{ stroke: "rgba(16, 185, 129, 0.2)", strokeWidth: 2 }} />
                            <Line 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="#6366f1" 
                              strokeWidth={4} 
                              dot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#000" }}
                              activeDot={{ r: 10, fill: "#fff", stroke: "#6366f1", strokeWidth: 4 }}
                              filter="url(#glow)"
                            />
                            <Line 
                              type="stepAfter" 
                              dataKey="netProfit" 
                              stroke="#10b981" 
                              strokeWidth={3} 
                              strokeDasharray="5 5"
                              dot={false}
                            />
                         </LineChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Sub-signals Terminal */}
                <div className="w-full max-w-4xl bg-black/40 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-3xl shadow-inner relative group">
                   <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                   <div className={cn("flex justify-between items-center mb-6", isRtl && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                         <Terminal size={16} className="text-indigo-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{t('fiscal.logTerminal')}</span>
                      </div>
                      <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500/20" />
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                      </div>
                   </div>
                   <div className={cn("space-y-3 font-mono text-[9px] text-slate-500 uppercase tracking-widest italic", isRtl ? "text-right" : "text-left")}>
                      <p className={cn("flex gap-4", isRtl && "flex-row-reverse")}><span className="text-indigo-500/60">[0xFD92]</span> SYNC_AUTH: Establishing sovereign fiscal link...</p>
                      <p className={cn("flex gap-4", isRtl && "flex-row-reverse")}><span className="text-indigo-500/60">[0xFD92]</span> PARSING: 42,000 transaction nodes indexed.</p>
                      <p className={cn("flex gap-4", isRtl && "flex-row-reverse")}><span className="text-indigo-500/60">[0xFD92]</span> VECTOR: Calculating margin-entropy coefficients...</p>
                      <p className={cn("flex gap-4 animate-pulse", isRtl && "flex-row-reverse")}><span className="text-indigo-500/60">[0xFD92]</span> SIGNAL: Trajectory confirmed. Authorized.</p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPORT TERMINAL MODAL */}
      <AnimatePresence>
        {showExport && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 overflow-hidden relative">
              <div className={cn("p-12 border-b border-white/5 flex justify-between items-center bg-white/[0.02]", isRtl && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                   <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl rotate-12"><Download size={28} /></div>
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{t('fiscal.extractionProtocol')}</h2>
                </div>
                <button onClick={() => setShowExport(false)} className="p-4 hover:bg-rose-600 text-slate-500 hover:text-white rounded-2xl transition-all border-none bg-transparent active:scale-90 group"><X size={28} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <div className="p-12 space-y-6">
                <HardExportItem icon={<FileText size={24} />} title="EXECUTIVE_PDF" desc="Condensed board-level briefing document" t={t} isRtl={isRtl} />
                <HardExportItem icon={<Binary size={24} />} title="FORENSIC_CSV" desc="Raw industrial ledger data stream" t={t} isRtl={isRtl} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Hard System Atomic Components ---

const NeuralDataNode = ({ label, val, desc, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="p-8 bg-white/5 dark:bg-black/40 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
  >
    <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40", `bg-${color}-500`)} />
    <div className={cn("p-4 rounded-2xl mb-8 w-fit shadow-inner", `bg-${color}-500/10 text-${color}-500 border border-${color}-500/20 group-hover:rotate-12 transition-transform`)}>
       <Icon size={24} />
    </div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">{label}</p>
    <h4 className="text-3xl font-black text-white italic tracking-tighter mb-2">{val}</h4>
    <p className={cn("text-[8px] font-black uppercase tracking-widest opacity-60", `text-${color}-400`)}>{desc}</p>
  </motion.div>
);

const HardMetricNode = ({ label, value, icon: Icon, color, highlight, delay }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6 }} className={cn("p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden shadow-2xl", highlight ? "bg-indigo-600 text-white border-none" : "bg-white/5 dark:bg-slate-950 border-white/10 dark:hover:border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.2)]")}>
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000"><Icon size={100} /></div>
    <div className={cn("p-4 rounded-xl mb-10 w-fit group-hover:rotate-12 transition-transform shadow-inner relative z-10", highlight ? "bg-white/10" : `bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`)}>
       <Icon size={24} />
    </div>
    <p className={cn("font-black uppercase text-[8px] tracking-[0.5em] mb-4 leading-none italic relative z-10", highlight ? "text-indigo-200" : "text-slate-500")}>{label}</p>
    <h3 className="text-3xl font-black italic tracking-tighter leading-none relative z-10 tabular-nums text-slate-950 dark:text-white">{(value || 0).toLocaleString()}<span className="text-xs not-italic opacity-40 uppercase tracking-widest ml-2">MAD</span></h3>
  </motion.div>
);

const BurnNode = ({ label, value, color, isRtl }: any) => (
  <div className="space-y-4">
    <div className={cn("flex justify-between items-center px-2", isRtl && "flex-row-reverse")}>
      <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.4em] italic">{label}</span>
      <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{value}</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
      <motion.div initial={{ width: 0 }} whileInView={{ width: value }} transition={{ duration: 1.5, ease: "circOut" }} className={cn("h-full shadow-[0_0_15px_currentColor]", `bg-${color}-500`)} />
    </div>
  </div>
);

const HardStatus = ({ label, val, color }: any) => (
  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center group hover:border-indigo-500/30 transition-all relative overflow-hidden shadow-xl">
     <div className={`absolute top-0 left-0 w-full h-0.5 bg-${color}-500 opacity-20 group-hover:opacity-100 transition-opacity`} />
     <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-2 italic">{label}</p>
     <p className={cn("text-2xl font-black italic leading-none tabular-nums", color === 'emerald' ? "text-emerald-400" : "text-amber-400")}>{val}</p>
  </div>
);

const HardProjection = ({ label, val, color }: any) => (
  <div className="flex justify-between items-center p-5 bg-black/20 rounded-2xl border border-white/5 transition-all hover:bg-black/40 group shadow-lg">
     <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors italic">{label}</span>
     <span className={cn("text-base font-black italic tabular-nums", color === 'emerald' ? "text-emerald-400 drop-shadow-[0_0_8px_#10b981]" : "text-indigo-300 drop-shadow-[0_0_8px_#6366f1]")}>{val}</span>
  </div>
);

const HardExportItem = ({ icon, title, desc, t, isRtl }: any) => (
  <button onClick={() => toast.success(t('common.success'))} className={cn("w-full flex items-center gap-8 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.08] transition-all group shadow-2xl relative overflow-hidden border-none", isRtl ? "flex-row-reverse text-right" : "text-left")}>
    <div className="p-5 bg-black/40 rounded-xl shadow-xl text-indigo-500 group-hover:scale-110 transition-transform group-hover:text-white group-hover:bg-indigo-600 border border-white/5 relative z-10">{icon}</div>
    <div className="relative z-10">
      <h4 className="text-xl font-black uppercase italic text-white tracking-tighter group-hover:tracking-widest transition-all leading-none">{title}</h4>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-3">{desc}</p>
    </div>
    <div className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-700" />
  </button>
);

export default FinancialIntelligence;
