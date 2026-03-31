import React, { useEffect, useState } from "react";
import api from "../api/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, ScatterChart, Scatter, ZAxis
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, 
  Target, Zap, ArrowRight, ArrowUpRight, Loader2, Calendar, FileDown,
  BarChart3, PieChart as PieChartIcon, Activity, ChevronRight, 
  Download, Filter, Sparkles, ShieldCheck, Globe, Cpu, MousePointer2,
  Database, Radio, Shield, History as HistoryIcon, Terminal, Crosshair, Binary
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { useTenant } from "../store/tenant.slice";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface ReportStats {
  chartData: any[];
  categoryStats: any[];
  topProducts: any[];
  aiInsights: any[];
}

const GridPattern = () => (
  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.03] dark:opacity-[0.15] pointer-events-none" />
);

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

export const Reports = () => {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const [data, setData] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveTab] = useState('financial');
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/stats");
      if (res.data.success) setData(res.data.data);
    } catch (e) { toast.error(t('errors.networkError')); } finally { setLoading(false); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading(t('common.download') + "...");
    try {
      const response = await api.get("/reports/export", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Institutional-Export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('common.success'), { id: toastId });
    } catch (error) { toast.error(t('errors.serverError'), { id: toastId }); } finally { setIsExporting(false); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950">
       <div className="relative">
          <div className="w-32 h-32 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin-slow" />
          <Terminal size={48} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
       </div>
       <p className="mt-12 text-[12px] font-black uppercase tracking-[1.5em] text-white animate-pulse italic mr-[-1.5em]">BOOTING_DECISION_KERNEL</p>
    </div>
  );

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("w-full space-y-6 pb-20 px-2 md:px-4 transition-all duration-700", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. MASTER ANALYTICS HUD HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 p-8 md:p-10 bg-slate-950 text-white rounded-[3rem] shadow-4xl relative overflow-hidden border border-white/10 group">
           <GridPattern />
           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
           <Scanline />
           
           <div className={cn("relative z-10 flex flex-col md:flex-row justify-between items-start gap-8", isRtl && "md:flex-row-reverse")}>
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className={cn("flex items-center gap-4 mb-6", isRtl && "flex-row-reverse")}>
                   <div className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shadow-[0_0_8px_#6366f1]" />
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">{t('reports.node')}: {(tenant?.name || "STOCKMASTER").toUpperCase()}_9.4</span>
                   </div>
                   <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                      <Terminal size={10} className="text-slate-400" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('reports.stable')}</span>
                   </div>
                </div>
                
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.8] text-white">
                  {t('reports.title')}_<br />
                  <span className="text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">{t('reports.subtitle')}.</span>
                </h1>
              </div>

              <div className={cn("flex flex-col gap-4 shrink-0", isRtl && "items-end")}>
                 <div className={cn("flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-inner", isRtl && "flex-row-reverse")}>
                    {['7d', '30d', '90d'].map(range => (
                      <button key={range} onClick={() => setDateRange(range)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none relative overflow-hidden", dateRange === range ? "bg-white text-slate-950 shadow-2xl scale-105" : "text-slate-500 hover:text-white")}>
                        <span className="relative z-10">{range}</span>
                        {dateRange === range && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />}
                      </button>
                    ))}
                 </div>
                 <button onClick={handleExport} disabled={isExporting} className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-4xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 border-none italic group">
                    {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />} {t('common.export')}
                 </button>
              </div>
           </div>
        </div>

        <div className="p-8 md:p-10 bg-indigo-600 text-white rounded-[3rem] relative overflow-hidden flex flex-col justify-between shadow-4xl border border-white/20 group cursor-pointer transition-all active:scale-95">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
           <div className={cn("relative z-10", isRtl ? "text-right" : "text-left")}>
              <div className="p-4 bg-white/10 rounded-2xl w-fit mb-8 backdrop-blur-xl border border-white/20"><HistoryIcon size={24} className="text-white" /></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2 opacity-60 italic">{t('reports.signature')}</p>
              <h2 className="text-3xl font-black tracking-tighter italic leading-none text-white uppercase">{t('reports.verified')}</h2>
              <div className={cn("mt-6 flex items-center gap-3 px-4 py-1.5 bg-black/20 w-fit rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 shadow-lg", isRtl && "mr-auto ml-0")}>
                 <ShieldCheck size={12} className="text-emerald-400" /> {t('reports.compliance')}
              </div>
           </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION DECK */}
      <div className={cn("flex items-center gap-2 p-2 bg-white/10 dark:bg-slate-950/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl w-fit mx-auto lg:mx-0", isRtl && "flex-row-reverse")}>
         {[
           { id: 'financial', icon: <DollarSign size={14}/>, label: t('settings.billing') },
           { id: 'inventory', icon: <Package size={14}/>, label: t('nav.inventory') },
           { id: 'strategic', icon: <Target size={14}/>, label: t('nav.intelligence') }
         ].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border-none relative overflow-hidden", activeReportTab === tab.id ? 'bg-indigo-600 text-white shadow-4xl scale-105' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800')}>
              <span className="relative z-10 flex items-center gap-3">{tab.icon} {tab.label}</span>
              {activeReportTab === tab.id && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
           </button>
         ))}
      </div>

      {/* 3. CONTENT DEPLOYMENT MATRIX */}
      <AnimatePresence mode="wait">
        <motion.div key={activeReportTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="space-y-8">
          
          {activeReportTab === 'financial' && (
            <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: t('reports.institutionalMargin'), value: "32.4%", trend: "+2.1%", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: TrendingUp },
                    { label: t('reports.resourceEfficiency'), value: "94.2%", trend: "OPTIMAL", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: Target },
                    { label: t('reports.capitalRotation'), value: "4.8X", trend: "+0.4", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Zap },
                  ].map((kpi, i) => (
                    <motion.div whileHover={{y: -5}} key={i} className={cn("bg-white dark:bg-[#050508] backdrop-blur-3xl p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-pro dark:shadow-4xl flex items-center justify-between group transition-all", isRtl && "flex-row-reverse")}>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 italic">{kpi.label}</p>
                          <h4 className="text-4xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none tabular-nums">{kpi.value}</h4>
                          <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-lg mt-4 text-[8px] font-black uppercase tracking-widest border", kpi.bg, kpi.border, kpi.color)}>{kpi.trend} SIG_SYNC</div>
                       </div>
                       <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:rotate-12 group-hover:scale-110 shadow-inner", kpi.bg)}><kpi.icon size={28} className={kpi.color} /></div>
                    </motion.div>
                  ))}
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-8 bg-white dark:bg-[#050508] p-10 md:p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-4xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/[0.03] rounded-full blur-[100px] pointer-events-none" />
                     <Scanline />
                     <div className={cn("flex justify-between items-center mb-12 relative z-10", isRtl && "flex-row-reverse")}>
                        <div className={isRtl ? "text-right" : "text-left"}>
                           <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none">{t('reports.resonanceMatrix')}</h3>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-3 italic">{t('reports.temporalSignal')}</p>
                        </div>
                        <div className={cn("hidden sm:flex gap-8", isRtl && "flex-row-reverse")}>
                           <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_#6366f1] animate-pulse" /><span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{t('dashboard.revenue')}</span></div>
                           <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" /><span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{t('reports.latticeCost')}</span></div>
                        </div>
                     </div>
                     <div className="h-[400px] w-full relative z-10 px-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={data?.chartData || []}>
                              <defs>
                                 <linearGradient id="hardReportRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="currentColor" opacity={0.05} />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'black', fill: '#64748b', textTransform: 'uppercase'}} dy={15} />
                              <YAxis hide />
                              <Tooltip content={<CustomTooltip t={t} />} cursor={{stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2}} />
                              <Area type="stepAfter" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fill="url(#hardReportRev)" animationDuration={2500} />
                              <Line type="monotone" dataKey="cost" stroke="#f43f5e" strokeWidth={3} strokeDasharray="8 8" dot={false} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="xl:col-span-4 bg-white dark:bg-[#050508] p-10 md:p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-4xl flex flex-col group relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
                     <h3 className={cn("text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter mb-12 self-start z-10", isRtl && "self-end")}>{t('reports.assetAllocation')}</h3>
                     <div className="flex-1 flex items-center justify-center min-h-[300px] relative z-10 group-hover:scale-105 transition-transform duration-1000">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie data={data?.categoryStats || []} innerRadius="70%" outerRadius="95%" paddingAngle={10} dataKey="value" nameKey="_id" stroke="none">
                                 {(data?.categoryStats || []).map((_entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                           <span className="text-4xl font-black text-slate-950 dark:text-white italic tracking-tighter leading-none">{(tenant?.name || "STOCKMASTER").toUpperCase()}</span>
                           <div className="mt-2 flex items-center gap-2 justify-center">
                              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Active_Lattice</span>
                           </div>
                        </div>
                     </div>
                     <div className="mt-12 space-y-3 relative z-10">
                        {(data?.categoryStats || []).map((cat: any, i: number) => (
                           <motion.div whileHover={{x: isRtl ? -5 : 5}} key={i} className={cn("flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5 transition-all shadow-sm", isRtl && "flex-row-reverse")}>
                              <div className={cn("flex items-center gap-3.5", isRtl && "flex-row-reverse")}>
                                 <div className="w-2.5 h-2.5 rounded-lg shadow-lg" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                                 <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest truncate max-w-[140px] italic">{cat._id}</span>
                              </div>
                              <span className="text-sm font-black text-slate-950 dark:text-white italic tabular-nums">{cat.value.toLocaleString()} <span className="text-[8px] not-italic opacity-40 uppercase ml-1">MAD</span></span>
                           </motion.div>
                        ))}
                     </div>
                  </div>
               </div>
            </>
          )}

          {activeReportTab === 'inventory' && (
            <div className="space-y-8 pb-16">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-[#050508] p-10 md:p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-4xl relative group overflow-hidden">
                     <Scanline />
                     <h3 className={cn("text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter mb-12 flex items-center gap-4 relative z-10", isRtl && "flex-row-reverse")}>
                        <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20"><Activity size={24} className="text-indigo-600"/></div> {t('reports.velocityScan')}
                     </h3>
                     <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={data?.topProducts || []}>
                              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="currentColor" opacity={0.05} />
                              <XAxis dataKey="name" hide />
                              <YAxis hide />
                              <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.03)'}} contentStyle={{borderRadius: '1.5rem', border: 'none', background: 'rgba(5, 5, 8, 0.95)', backdropFilter: 'blur(10px)', fontWeight: 'black', color: '#fff'}} />
                              <Bar dataKey="totalSold" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={45}>
                                 {data?.topProducts.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="bg-slate-950 p-12 rounded-[4rem] text-white shadow-4xl relative overflow-hidden flex flex-col justify-center border border-white/10 group">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 pointer-events-none" />
                     <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                     <h3 className={cn("text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 relative z-10 leading-[0.9]", isRtl && "text-right")}>{t('reports.fluxOptimization').split('.')[0]}<br /><span className="text-indigo-500">{t('reports.fluxOptimization').split('.')[1]}</span></h3>
                     <p className={cn("text-xl font-bold text-indigo-300 uppercase tracking-widest leading-relaxed mb-12 relative z-10 opacity-80 italic border-l-4 border-indigo-600 pl-8", isRtl && "border-l-0 border-r-4 pl-0 pr-8 text-right")}>
                        {t('reports.efficiencyIncreased')}
                     </p>
                     <div className="grid grid-cols-2 gap-6 relative z-10">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-3xl shadow-4xl text-center group/item hover:bg-white/10 transition-all">
                           <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-[0.4em] italic">{t('reports.turnoverIndex')}</p>
                           <p className="text-4xl font-black italic tracking-tighter text-white tabular-nums">12.4<span className="text-xl opacity-40">X</span></p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-3xl shadow-4xl text-center group/item hover:bg-white/10 transition-all">
                           <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-[0.4em] italic">{t('reports.nodeAccuracy')}</p>
                           <p className="text-4xl font-black italic tracking-tighter text-emerald-400 tabular-nums">99.8<span className="text-xl opacity-40">%</span></p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-[#050508] border border-slate-200 dark:border-white/5 rounded-[4rem] shadow-4xl overflow-hidden transition-all">
                  <div className={cn("p-10 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] relative", isRtl && "flex-row-reverse")}>
                     <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                        <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-2xl rotate-6 border border-white/20"><HistoryIcon size={28} /></div>
                        <div className={isRtl ? "text-right" : "text-left"}>
                           <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none">{t('reports.healthAudit')}</h3>
                           <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] mt-3 italic">{t('reports.forensicTracking')}</p>
                        </div>
                     </div>
                     <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl group-hover:scale-150 transition-transform duration-1000" />
                        <ShieldCheck size={40} className="text-emerald-500 relative z-10 drop-shadow-[0_0_12px_#10b981]" />
                     </div>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar relative z-10">
                     <table className={`w-full text-left border-collapse min-w-[1000px] ${isRtl ? "text-right" : "text-left"}`}>
                        <thead>
                           <tr className="bg-white/[0.03] text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-slate-100 dark:border-white/10 italic">
                              <th className="px-10 py-8">{t('reports.assetDesignation')}</th>
                              <th className="px-10 py-8 text-center">{t('reports.nodeState')}</th>
                              <th className="px-10 py-8 text-center">{t('reports.velocitySignal')}</th>
                              <th className="px-10 py-8 text-center">{t('reports.payloadYield')}</th>
                              <th className="px-10 py-8 text-right">{t('reports.integrity')}</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                           {data?.topProducts?.map((prod: any, i: number) => (
                              <tr key={i} className="hover:bg-indigo-600/[0.03] transition-all group cursor-default">
                                 <td className="px-10 py-8">
                                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                                       <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-white/5 shrink-0 p-1.5 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all shadow-inner">
                                          {prod.image ? <img src={prod.image} className="w-full h-full object-cover rounded-xl" /> : <Package className="m-auto mt-2 text-slate-300 dark:text-slate-700" size={32} />}
                                       </div>
                                       <div className={cn("flex flex-col", isRtl && "items-end")}>
                                          <span className="font-black text-slate-950 dark:text-white uppercase italic text-sm tracking-tight">{prod.name}</span>
                                          <div className="flex items-center gap-2 mt-1.5">
                                             <Binary size={10} className="text-indigo-500" />
                                             <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">TRACE_ID: #{Math.random().toString(36).substring(7).toUpperCase()}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8 text-center"><span className="text-[13px] font-black text-slate-500 dark:text-slate-400 italic">84 UNITS_NODE</span></td>
                                 <td className="px-10 py-8 text-center"><span className="text-lg font-black text-indigo-600 italic tracking-tighter tabular-nums">+{prod.totalSold} FLUX</span></td>
                                 <td className="px-10 py-8 text-center font-black text-slate-950 dark:text-white italic text-lg tracking-tighter tabular-nums">{prod.revenue.toLocaleString()} <span className="text-[10px] not-italic opacity-40 uppercase ml-1">MAD</span></td>
                                 <td className="px-10 py-8 text-right">
                                    <div className={cn("flex items-center justify-end gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 shadow-pro inline-flex", isRtl && "flex-row-reverse")}>
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" /> NOMINAL_OK
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeReportTab === 'strategic' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
               <div className="lg:col-span-2 bg-white dark:bg-[#050508] p-10 md:p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-4xl relative overflow-hidden group">
                  <GridPattern />
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full -mr-48 -mt-48 blur-[100px]" />
                  <h3 className={cn("text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-tighter mb-12 flex items-center gap-5 relative z-10", isRtl && "flex-row-reverse")}>
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-2xl border border-white/10"><Radio className="text-white animate-pulse" size={28}/></div> {t('reports.strategicAnalysis')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                     {data?.aiInsights?.map((ins: any, i: number) => (
                        <motion.div 
                           initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                           key={i} 
                           className={cn(
                              "p-8 rounded-[3rem] border transition-all hover:shadow-4xl group/card relative overflow-hidden",
                              ins.priority === 'HIGH' ? 'bg-rose-500/[0.03] border-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-white/5'
                           )}
                        >
                           <div className={cn("flex justify-between items-start mb-8", isRtl && "flex-row-reverse")}>
                              <div className={cn(
                                 "px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.4em] text-white shadow-4xl flex items-center gap-3",
                                 ins.priority === 'HIGH' ? 'bg-rose-600' : 'bg-amber-500'
                              )}>
                                 {ins.priority === 'HIGH' ? <Shield size={10} /> : <Zap size={10} />}
                                 {ins.priority} {t('reports.protocol')}
                              </div>
                              <Sparkles size={24} className="text-indigo-500 group-hover/card:rotate-12 group-hover:scale-125 transition-all duration-500" />
                           </div>
                           <h4 className={cn("font-black text-slate-950 dark:text-white uppercase italic text-sm mb-5 leading-tight tracking-tight", isRtl && "text-right")}>{ins.title}</h4>
                           <p className={cn("text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed opacity-80 uppercase tracking-tighter", isRtl && "text-right")}>{ins.desc}</p>
                           <div className={cn("mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between", isRtl && "flex-row-reverse")}>
                              <button className={cn("bg-transparent border-none p-0 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform active:scale-95 group/btn-link", isRtl && "flex-row-reverse")}>
                                 {t('reports.executeSignal')} <ChevronRight size={14} className={cn("group-hover/btn-link:translate-x-1 transition-transform", isRtl && "rotate-180 group-hover/btn-link:-translate-x-1")} />
                              </button>
                              <MousePointer2 size={18} className="text-slate-200 dark:text-slate-800 group-hover/card:text-indigo-500 transition-colors" />
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="bg-indigo-600 p-10 md:p-12 rounded-[4rem] text-white shadow-4xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-950 opacity-60 group-hover:scale-125 transition-transform duration-[2000ms] pointer-events-none" />
                     <h3 className={cn("text-3xl font-black uppercase italic tracking-tighter mb-10 relative z-10 leading-none", isRtl && "text-right")}>{t('reports.neuralResonance').split('.')[0]}<br /><span className="text-indigo-200 opacity-60">{t('reports.neuralResonance').split('.')[1]}</span></h3>
                     <div className="space-y-10 relative z-10">
                        <div>
                           <div className={cn("flex justify-between items-end mb-4 px-2", isRtl && "flex-row-reverse")}>
                              <div className="flex items-center gap-3">
                                 <Radio size={12} className="animate-pulse" />
                                 <span className="text-[10px] font-black uppercase text-indigo-100 tracking-[0.4em] italic">{t('reports.latticeConfidence')}</span>
                              </div>
                              <span className="text-5xl font-black italic tracking-tighter tabular-nums">98.4<span className="text-xl opacity-40 ml-1">%</span></span>
                           </div>
                           <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/10 p-0.5">
                              <motion.div initial={{ width: 0 }} animate={{ width: "98.4%" }} transition={{ duration: 3, ease: "circOut" }} className="bg-white h-full rounded-full shadow-[0_0_20px_white]" />
                           </div>
                        </div>
                        <div className={cn("p-6 bg-black/20 rounded-[2.2rem] border border-white/5 backdrop-blur-3xl", isRtl && "text-right")}>
                           <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-[0.15em] leading-relaxed italic opacity-90 border-l-2 border-indigo-400/40 pl-6 pr-2">
                              {t('reports.strategicVectors')}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-[#050508] p-8 md:p-10 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-4xl relative group overflow-hidden">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-[60px] pointer-events-none" />
                     <div className={cn("flex items-center gap-4 mb-10", isRtl && "flex-row-reverse")}>
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><ShieldCheck size={20} className="text-emerald-500" /></div>
                        <h3 className={cn("text-[11px] font-black uppercase tracking-[0.5em] text-slate-950 dark:text-white italic", isRtl && "text-right")}>{t('reports.forensicAudit')}</h3>
                     </div>
                     <div className="space-y-4 relative z-10">
                        {[
                           { label: t('reports.dataIntegrity'), val: "100%", color: "text-emerald-500", icon: <Database size={10} /> },
                           { label: t('reports.clusterCompliance'), val: "OPTIMAL", color: "text-indigo-500", icon: <Shield size={10} /> },
                           { label: t('reports.securityRegistry'), val: t('reports.hardened'), color: "text-emerald-500", icon: <Crosshair size={10} /> }
                        ].map((item, i) => (
                           <div key={i} className={cn("flex justify-between items-center p-5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-transparent hover:border-indigo-500/30 transition-all cursor-default group/audit", isRtl && "flex-row-reverse")}>
                              <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                                 <span className="opacity-40 group-hover/audit:opacity-100 transition-opacity">{item.icon}</span>
                                 <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-widest">{item.label}</span>
                              </div>
                              <span className={cn("text-[11px] font-black uppercase italic tracking-widest", item.color)}>{item.val}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* 4. DRAGGABLE MASTER AUDIT NODULE */}
      <motion.div 
         drag 
         dragConstraints={{ left: -500, right: 0, top: -500, bottom: 0 }} 
         whileHover={{ scale: 1.05 }}
         className={cn("fixed bottom-10 right-10 p-6 bg-slate-950 text-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-[100] border border-white/10 backdrop-blur-3xl cursor-grab active:cursor-grabbing flex items-center gap-6 group transition-all duration-500", isRtl && "right-auto left-10 flex-row-reverse")}
      >
         <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(79,70,229,0.6)] group-hover:rotate-12 transition-transform shrink-0"><Sparkles size={28} /></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
         </div>
         <div className={cn("hidden sm:block min-w-[180px]", isRtl ? "text-right" : "text-left")}>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-1.5 italic leading-none">{t('reports.auditPulse')}</p>
            <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
               <span className="text-2xl font-black italic tracking-tighter leading-none uppercase text-white drop-shadow-lg">{t('reports.nominalState')}</span>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_#10b981]" />
            </div>
         </div>
         <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all shadow-inner border border-white/5 active:scale-90"><ChevronRight size={20} className={cn("text-slate-400", isRtl ? "rotate-180" : "")}/></button>
      </motion.div>

    </div>
  );
};

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050508]/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[1.8rem] shadow-4xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-5 border-b border-white/5 pb-3 italic text-left">
          ANALYTICS_TRACE_{String(label || '').toUpperCase()}
        </p>
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center gap-16">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">REVENUE_FLUX</span>
            <span className="text-sm font-black text-white italic tabular-nums">
              {payload[0].value.toLocaleString()} <span className="text-[8px] not-italic opacity-40">MAD</span>
            </span>
          </div>
          {payload[1] && (
            <div className="flex justify-between items-center gap-16">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">LATTICE_COST</span>
              <span className="text-sm font-black text-rose-400 italic tabular-nums">
                {payload[1].value.toLocaleString()} <span className="text-[8px] not-italic opacity-40">MAD</span>
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">DIAGNOSTIC_STATUS</span>
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">OPTIMAL_SYNC</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default Reports;
