import React, { useState, useEffect } from "react";
import { 
  Truck, MapPin, Package, Clock, ShieldCheck, 
  ChevronRight, Search, Filter, RefreshCcw, 
  MoreHorizontal, Navigation, Zap, AlertTriangle,
  ArrowUpRight, Loader2, User, Globe, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export const FleetLogistics = () => {
  const { t, i18n } = useTranslation();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isRtl = i18n.language === 'ar';

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/logistics/deliveries");
      setDeliveries(res.data.data || []);
    } catch (e) {
      toast.error("Fleet Comms Interrupted");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "IN_TRANSIT": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]";
      case "PROCESSING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "CANCELLED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const filtered = deliveries.filter(d => 
    d.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.destination?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("w-full space-y-8 pb-32 px-3 md:px-6 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. FLEET COMMAND HUD */}
      <header className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
               <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                  <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/30 rotate-3 transition-transform hover:rotate-0">
                     <Truck size={32} />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">Fleet <span className="text-indigo-500">Control.</span></h1>
               </div>
               <p className="text-indigo-300 font-black uppercase text-[9px] tracking-[0.5em] ml-1">Universal Distribution Protocol v7.2</p>
            </div>

            <div className="flex gap-4">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-10">
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Shipments</p>
                     <p className="text-3xl font-black text-indigo-400 italic leading-none">{deliveries.filter(d => d.status === 'IN_TRANSIT').length}</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Efficiency</p>
                     <p className="text-3xl font-black text-emerald-400 italic leading-none">99.4%</p>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* 2. REAL-TIME TELEMETRY GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         
         {/* Tracking Matrix */}
         <div className="xl:col-span-8 space-y-6">
            <div className={cn("flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-[2.2rem] border border-slate-100 dark:border-white/5 shadow-xl backdrop-blur-md", isRtl && "md:flex-row-reverse")}>
               <div className="relative flex-1 group">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-5" : "left-5")} size={20} />
                  <input 
                    placeholder="LOCATE SHIPMENT BY TRACKING ID..." 
                    className={cn("w-full bg-slate-50 dark:bg-black/20 border-none rounded-3xl py-5 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all", isRtl ? "pr-14 pl-6" : "pl-14 pr-6")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="px-8 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95">Deploy Unit</button>
            </div>

            <div className="grid gap-4">
               {loading ? (
                 <div className="py-32 flex flex-col items-center justify-center opacity-20">
                    <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Scanning Grid...</p>
                 </div>
               ) : filtered.length === 0 ? (
                 <div className="py-24 bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-30 grayscale">
                    <Globe size={64} strokeWidth={1} className="mb-6" />
                    <p className="font-black uppercase text-xs tracking-widest">No Active Signals</p>
                 </div>
               ) : filtered.map((d, i) => (
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                   key={d._id} 
                   className={cn("bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-2xl transition-all", isRtl && "md:flex-row-reverse")}
                 >
                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                       <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform relative">
                          <Truck size={24} />
                          {d.status === 'IN_TRANSIT' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />}
                       </div>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1 block">#{d.trackingNumber}</span>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{d.destination?.city} Registry</h3>
                          <div className={cn("flex items-center gap-3 mt-3", isRtl && "flex-row-reverse")}>
                             <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", getStatusColor(d.status))}>{d.status}</span>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Navigation size={10}/> {d.priority} Priority</span>
                          </div>
                       </div>
                    </div>

                    <div className={cn("flex flex-col md:flex-row items-center gap-10 w-full md:w-auto", isRtl && "flex-row-reverse")}>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ETA Signal</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(d.estimatedArrival).toLocaleDateString()}</p>
                       </div>
                       <button className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-indigo-500/20"><MoreHorizontal size={20}/></button>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Distribution Radar */}
         <div className="xl:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-20"><Globe size={120} /></div>
               <div className="relative z-10">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">Node Awareness</h3>
                  <div className="space-y-8">
                     <RadarNode label="Casablanca Node" pulse={94} color="emerald" />
                     <RadarNode label="Tangier Node" pulse={72} color="amber" />
                     <RadarNode label="Marrakech Node" pulse={45} color="rose" />
                  </div>
                  <button className="w-full mt-10 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center gap-3">
                     <Activity size={14}/> Sync Global Grid
                  </button>
               </div>
            </div>

            <div className="glass-card p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl">
               <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6 italic">Tactical Alerts</h3>
               <div className="space-y-4">
                  <AlertNode icon={<Zap size={14}/>} color="amber" msg="Route Alpha experiencing high latency." />
                  <AlertNode icon={<AlertTriangle size={14}/>} color="rose" msg="Unit TRK-998 requires maintenance." />
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

const RadarNode = ({ label, pulse, color }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black italic">{pulse}%</span>
     </div>
     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pulse}%` }} transition={{ duration: 2 }} className={cn("h-full bg-white", pulse > 90 ? 'shadow-[0_0_10px_white]' : '')} />
     </div>
  </div>
);

const AlertNode = ({ icon, color, msg }: any) => (
  <div className={cn("p-4 rounded-2xl flex items-start gap-4 border", color === 'rose' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-amber-500/5 border-amber-500/10')}>
     <div className={cn("p-2 rounded-xl shrink-0", color === 'rose' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white')}>{icon}</div>
     <p className={cn("text-[10px] font-bold leading-relaxed", color === 'rose' ? 'text-rose-600' : 'text-amber-600')}>"{msg}"</p>
  </div>
);

export default FleetLogistics;
