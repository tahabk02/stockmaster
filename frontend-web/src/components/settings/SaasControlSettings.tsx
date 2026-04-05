import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Server, Globe, Users, Package, TrendingUp, ShieldAlert, 
  Settings2, Activity, RefreshCw, Search, ArrowUpRight, 
  Cpu, Zap, HardDrive, BarChart3, Database
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import api from "../../api/client";
import { useTranslation } from "react-i18next";

export const SaasControlSettings = ({ isRtl }: { isRtl: boolean }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, tenantsRes] = await Promise.all([
                api.get("/saas/stats"),
                api.get("/saas/tenants")
            ]);
            setStats(statsRes.data.data);
            setTenants(tenantsRes.data.data);
        } catch (e) {
            toast.error("Cluster Sync Failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20">
            {/* 1. CLUSTER HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SaasStatCard label="Total Nodes" value={stats?.tenants || 0} icon={Server} color="indigo" />
                <SaasStatCard label="Active Agents" value={stats?.users || 0} icon={Users} color="emerald" />
                <SaasStatCard label="System Assets" value={stats?.products || 0} icon={Package} color="sky" />
                <SaasStatCard label="Cluster MRR" value={`${(stats?.totalRevenue / 100 || 0).toLocaleString()} DH`} icon={TrendingUp} color="amber" />
            </div>

            {/* 2. LIVE LATTICE CONTROL */}
            <div className="theme-card p-1 overflow-hidden relative group">
                <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
                
                <div className={cn("p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 relative z-10", isRtl && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-xl shadow-indigo-500/20">
                            <Activity size={20} className="animate-pulse" />
                        </div>
                        <div className={isRtl ? "text-right" : "text-left"}>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Node Override Matrix</h3>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic leading-none">Live_System_Calibration</p>
                        </div>
                    </div>
                    
                    <div className={cn("flex items-center gap-4 w-full md:w-auto", isRtl && "flex-row-reverse")}>
                        <div className="relative flex-1 md:min-w-[300px] group/search">
                            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors", isRtl ? "right-4" : "left-4")} size={16} />
                            <input 
                                placeholder="Scan Node UID..." 
                                className={cn("pro-input w-full bg-white dark:bg-black/40", isRtl ? "pr-12 text-right" : "pl-12 pr-4")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchData} className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className={cn("pro-table w-full", isRtl && "text-right")}>
                        <thead>
                            <tr>
                                <th>Node Identity</th>
                                <th>Tier Protocol</th>
                                <th>Resource Saturation</th>
                                <th>Neural Sync</th>
                                <th className="text-right">Overrides</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {filteredTenants.map((node, i) => (
                                <tr key={node._id} className="group/row cursor-default">
                                    <td>
                                        <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-inner group-hover/row:rotate-3 transition-transform duration-500 overflow-hidden">
                                                {node.logo ? <img src={node.logo} className="w-full h-full object-cover" /> : <Database size={18} className="text-indigo-500" />}
                                            </div>
                                            <div className={isRtl ? "text-right" : "text-left"}>
                                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{node.name}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">{node.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm", 
                                            node.plan === 'ENTERPRISE' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
                                            node.plan === 'PRO' ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10"
                                        )}>
                                            {node.plan}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="space-y-2 max-w-[150px]">
                                            <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-400 italic">
                                                <span>{node.usage?.products?.current || 0} / {node.usage?.products?.limit || '∞'}</span>
                                                <span>{Math.round(node.usage?.products?.percent || 0)}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                <motion.div 
                                                    initial={{ width: 0 }} 
                                                    animate={{ width: `${node.usage?.products?.percent || 0}%` }} 
                                                    className={cn("h-full", node.usage?.products?.percent > 90 ? "bg-rose-500" : "bg-indigo-600")}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", node.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{node.isActive ? "NODE_LOCKED" : "NODE_ISOLATED"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all active:scale-90 border-none bg-transparent">
                                                <Settings2 size={14} />
                                            </button>
                                            <button className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all active:scale-90 border-none bg-transparent">
                                                <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. SYSTEM PERFORMANCE OVERLAY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SaasMetricNode label="Neural Latency" value="14ms" icon={Cpu} color="emerald" percent={98} />
                <SaasMetricNode label="Storage Saturation" value="2.4TB" icon={HardDrive} color="indigo" percent={42} />
                <SaasMetricNode label="Protocol Uptime" value="99.99%" icon={ShieldAlert} color="sky" percent={100} />
            </div>
        </div>
    );
};

const SaasStatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="theme-card p-8 group relative overflow-hidden">
        <div className={cn("absolute right-[-20px] top-[-20px] w-32 h-32 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700", `text-${color}-500`)}>
            <Icon size={128} />
        </div>
        <div className="relative z-10 flex flex-col gap-6">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", `bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`)}>
                <Icon size={22} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 italic leading-none">{label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none tabular-nums">{value}</p>
            </div>
        </div>
    </div>
);

const SaasMetricNode = ({ label, value, icon: Icon, color, percent }: any) => (
    <div className="theme-card p-8 flex flex-col gap-8">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic leading-none">{label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none tabular-nums">{value}</p>
            </div>
            <div className={cn("p-4 rounded-2xl shadow-inner", `bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`)}>
                <Icon size={24} />
            </div>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                <span>Calibration_Index</span>
                <span>{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${percent}%` }} 
                    className={cn("h-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", `bg-${color}-500`)} 
                />
            </div>
        </div>
    </div>
);
