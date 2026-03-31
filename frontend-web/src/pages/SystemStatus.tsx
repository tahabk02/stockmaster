import React, { useState, useEffect } from "react";
import { 
  Activity, Cpu, Database, Server, Clock, 
  HardDrive, Zap, RefreshCw, ShieldCheck, 
  Globe, Terminal, AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import axios from "axios";
import { useAuth } from "../store/auth.slice";

const StatusCard = ({ title, value, icon: Icon, subtext, status = "good", delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 shadow-xl group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/10" />
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={cn(
        "p-3 rounded-2xl shadow-lg",
        status === "good" ? "bg-emerald-500/10 text-emerald-500" : 
        status === "warning" ? "bg-amber-500/10 text-amber-500" : 
        "bg-rose-500/10 text-rose-500"
      )}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      {status === "good" && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
      {status === "warning" && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
      {status === "error" && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
    </div>

    <div className="relative z-10">
      <h3 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">{title}</h3>
      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1 font-mono">
        {value}
      </div>
      {subtext && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">{subtext}</p>}
    </div>
  </motion.div>
);

const TerminalLog = ({ logs }: { logs: string[] }) => (
  <div className="bg-[#0f172a] rounded-[2rem] p-6 font-mono text-xs overflow-hidden border border-slate-800 shadow-2xl relative h-full min-h-[300px]">
    <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900/50 flex items-center px-4 gap-2 border-b border-white/5">
      <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
      <span className="ml-2 text-slate-500 font-bold uppercase tracking-widest text-[9px]">System_Telemetry_Stream</span>
    </div>
    <div className="mt-8 space-y-2 h-full overflow-y-auto pb-4 custom-scrollbar text-emerald-500/80">
      {logs.map((log, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <span className="text-slate-600 select-none">[{new Date().toLocaleTimeString()}]</span>
          <span className="text-slate-300">$ {log}</span>
        </motion.div>
      ))}
      <div className="w-2 h-4 bg-emerald-500 animate-pulse inline-block align-middle ml-1" />
    </div>
  </div>
);

export const SystemStatus = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const isRtl = i18n.language === 'ar';

  const fetchHealth = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/system/health`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.data);
        addLog(`Health check passed. Latency: ${response.data.data.db.latency}`);
      }
    } catch (error) {
      addLog(`CRITICAL: Health check failed.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), msg]);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-indigo-600" size={32} />
          <p className="text-xs font-black uppercase tracking-widest animate-pulse text-indigo-400">Establishing Neural Link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-8 pb-20 animate-reveal", isRtl ? 'text-right' : 'text-left')}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm", isRtl && "flex-row-reverse")}>
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-tight">
            System <span className="text-indigo-600">Monitor</span>
          </h1>
          <p className="text-slate-400 font-bold italic mt-1 text-sm">Real-time infrastructure telemetry & heuristics</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Systems Nominal</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", isRtl && "rtl")}>
        <StatusCard 
          title="CPU Load" 
          value={`${data?.cpu?.load || 0}%`} 
          subtext={`${data?.cpu?.cores || 0} Cores Active`} 
          icon={Cpu} 
          delay={0.1}
        />
        <StatusCard 
          title="Memory Usage" 
          value={`${data?.memory?.usage || 0}%`} 
          subtext={`Free: ${(data?.memory?.free / 1024 / 1024 / 1024).toFixed(2)} GB`} 
          icon={HardDrive} 
          delay={0.2} 
        />
        <StatusCard 
          title="Database Latency" 
          value={data?.db?.latency || "0ms"} 
          subtext={`Status: ${data?.db?.status}`} 
          icon={Database} 
          delay={0.3}
          status={data?.db?.status === 'connected' ? 'good' : 'error'}
        />
        <StatusCard 
          title="System Uptime" 
          value={`${Math.floor(data?.uptime / 3600)}h ${(Math.floor(data?.uptime % 3600) / 60).toFixed(0)}m`} 
          subtext="Since last reboot" 
          icon={Clock} 
          delay={0.4} 
        />
      </div>

      {/* Advanced Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-xl relative overflow-hidden flex flex-col justify-center items-center">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px]" />
           <Activity size={64} className="text-indigo-500/20 mb-4 animate-pulse" />
           <h3 className="text-2xl font-black text-slate-300 uppercase italic tracking-widest text-center">Neural Network <br/> Visualization</h3>
           <p className="text-slate-400 text-sm mt-2 font-mono">Real-time packet tracing active...</p>
           {/* Placeholder for a chart or map */}
           <div className="w-full h-64 mt-8 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-300">Live Traffic Graph Placeholder</p>
           </div>
        </div>

        <div className="lg:col-span-1 h-full">
           <TerminalLog logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
