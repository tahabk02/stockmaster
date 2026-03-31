import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Puzzle, Globe, Zap, ShieldCheck, 
  RefreshCcw, Plus, ExternalLink, Key,
  Lock, Code, Terminal, Webhook as WebhookIcon,
  Trash2, Search, Filter, Loader2, Save, X,
  Copy, Check, AlertCircle, Cpu, Layers,
  ChevronRight, ArrowUpRight, Activity, Settings2,
  HardDrive, Network, Radio, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { PulseNode as TeamPulseNode, ForensicLabel } from "../components/team/TeamUI";

// --- Types ---
interface AppConfig {
  id: string;
  name: string;
  logo: string;
  desc: string;
  category: "E-COMMERCE" | "AUTOMATION" | "PAYMENT" | "SHIPPING";
}

const MARKETPLACE_APPS: AppConfig[] = [
  { id: "SHOPIFY", name: "Shopify", logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg", desc: "integrations.apps.shopify", category: "E-COMMERCE" },
  { id: "WOO", name: "WooCommerce", logo: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg", desc: "integrations.apps.woo", category: "E-COMMERCE" },
  { id: "ZAPIER", name: "Zapier", logo: "https://cdn.worldvectorlogo.com/logos/zapier-2.svg", desc: "integrations.apps.zapier", category: "AUTOMATION" },
  { id: "STRIPE", name: "Stripe", logo: "https://cdn.worldvectorlogo.com/logos/stripe-4.svg", desc: "integrations.apps.stripe", category: "PAYMENT" },
  { id: "SHIPSTATION", name: "ShipStation", logo: "https://cdn.worldvectorlogo.com/logos/shipstation.svg", desc: "integrations.apps.shipstation", category: "SHIPPING" }
];

export const Integrations = () => {
  const { t, i18n } = useTranslation();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"APPS" | "WEBHOOKS" | "API">("APPS");
  const [selectedApp, setSelectedDoc] = useState<AppConfig | null>(null);
  
  const isRtl = i18n.language === 'ar';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [intRes, webRes] = await Promise.all([
        api.get("/integrations"),
        api.get("/integrations/webhooks")
      ]);
      setIntegrations(intRes.data.data || []);
      setWebhooks(webRes.data.data || []);
    } catch (e) {
      toast.error(t('integrations.toast.failure'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className={cn("w-full space-y-5 pb-16 px-2 md:px-4 animate-reveal", isRtl ? "text-right" : "text-left")}>
      
      {/* 1. CONNECTIVITY HUD */}
      <header className="bg-slate-950 text-white p-5 md:p-6 rounded-[1.5rem] shadow-3xl relative overflow-hidden border border-white/5">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-72 -mt-72 animate-pulse" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[80px] -ml-36 -mb-36" />
         
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
               <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
                  <div className="p-4 bg-indigo-600 rounded-[1.8rem] shadow-3xl shadow-indigo-500/40 rotate-3 transition-transform hover:rotate-0 duration-700 relative group">
                     <Puzzle size={32} className="group-hover:scale-110 transition-transform" />
                     <div className="absolute inset-0 bg-white/20 rounded-[1.8rem] animate-ping opacity-20" />
                  </div>
                  <div>
                     <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{t('integrations.title').split(' ')[0]} <span className="text-indigo-500 underline decoration-indigo-500/30">{t('integrations.title').split(' ')[1]}.</span></h1>
                     <p className="text-indigo-300 font-black uppercase text-[8px] tracking-[0.5em] mt-3 opacity-80">{t('integrations.subtitle')}</p>
                  </div>
               </div>
            </div>

            <div className={cn("flex items-center gap-2.5 p-1.5 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl shrink-0 w-full lg:w-auto", isRtl && "flex-row-reverse")}>
               {[
                 { id: "APPS", label: t('integrations.tabs.market'), icon: Globe },
                 { id: "WEBHOOKS", label: t('integrations.tabs.webhooks'), icon: Radio },
                 { id: "API", label: t('integrations.tabs.api'), icon: Code }
               ].map((tab) => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)} 
                   className={cn(
                     "flex-1 lg:flex-none px-6 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2.5",
                     activeTab === tab.id ? "bg-indigo-600 text-white shadow-2xl scale-105" : "text-slate-400 hover:text-white"
                   )}
                 >
                    <tab.icon size={14} />
                    {tab.label}
                 </button>
               ))}
            </div>
         </div>
      </header>

      {/* 2. OPERATIONAL GRID */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         
         <div className="xl:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
               {activeTab === "APPS" && <AppsView integrations={integrations} loading={loading} isRtl={isRtl} onConfigure={setSelectedDoc} key="apps" t={t} />}
               {activeTab === "WEBHOOKS" && <WebhooksView webhooks={webhooks} loading={loading} isRtl={isRtl} key="webhooks" t={t} />}
               {activeTab === "API" && <APIView isRtl={isRtl} key="api" t={t} />}
            </AnimatePresence>
         </div>

         {/* 3. SIDEBAR TELEMETRY */}
         <aside className="xl:col-span-4 space-y-6">
            <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-3xl relative overflow-hidden group border border-white/10">
               <Cpu className="absolute top-[-30px] right-[-30px] w-56 h-56 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
               <div className="relative z-10">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                     <Activity size={20} /> {t('integrations.sync.title')}
                  </h3>
                  <div className="space-y-8">
                     <PulseNode label={t('integrations.apps.shopify').split(' ')[0] + " Lattice"} value={98} color="emerald" />
                     <PulseNode label={t('integrations.apps.woo').split(' ')[0] + " Node"} value={74} color="amber" />
                     <PulseNode label={t('integrations.apps.zapier').split(' ')[0] + " Flow"} value={100} color="emerald" />
                  </div>
                  <button onClick={fetchData} className="w-full mt-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-black uppercase text-[9px] tracking-[0.25em] hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center gap-3 group/btn border-none">
                     <RefreshCcw size={16} className={cn(loading && "animate-spin", "group-hover/btn:rotate-180 transition-transform duration-700")}/> {t('integrations.sync.resync')}
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-[40px]" />
               <h3 className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8 italic">{t('integrations.security.title')}</h3>
               <div className="space-y-5">
                  <SecurityCard icon={<ShieldCheck size={18}/>} title={t('integrations.security.hmac')} status="ACTIVE" desc={t('integrations.security.hmacDesc')} />
                  <SecurityCard icon={<Key size={18}/>} title={t('integrations.security.aes')} status="ENFORCED" desc={t('integrations.security.aesDesc')} />
                  <SecurityCard icon={<Lock size={18}/>} title={t('integrations.security.whitelist')} status="PENDING" desc={t('integrations.security.whitelistDesc')} />
               </div>
            </div>
         </aside>

      </main>

      {/* APP CONFIGURATION MODAL */}
      <AnimatePresence>
         {selectedApp && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white dark:bg-[#0b141a] w-full max-w-xl rounded-[3rem] shadow-3xl relative border border-white/5 overflow-hidden">
                 <button onClick={() => setSelectedDoc(null)} className={cn("absolute top-8 p-3 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-xl z-20 border-none", isRtl ? "left-8" : "right-8")}><X size={20} /></button>
                 
                 <div className="p-10 md:p-12 space-y-8">
                    <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                       <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-white/5 p-4 flex items-center justify-center border border-white/10 shadow-inner">
                          <img src={selectedApp.logo} className="w-full h-full object-contain" />
                       </div>
                       <div className={isRtl ? "text-right" : "text-left"}>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{selectedApp.name}</h2>
                          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-2.5">{t('integrations.modal.title')}</p>
                       </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-white/5">
                       <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('integrations.modal.endpoint')}</label>
                          <input placeholder="https://your-store.myshopify.com" className="w-full bg-slate-50 dark:bg-black/40 border-none rounded-xl p-5 font-black text-xs text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" />
                       </div>
                       <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('integrations.modal.token')}</label>
                          <div className="relative group">
                             <input type="password" placeholder="shpat_xxxxxxxxxxxxxxxxxxxx" className="w-full bg-slate-50 dark:bg-black/40 border-none rounded-xl p-5 font-black text-xs text-slate-900 dark:text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" />
                             <Lock className="absolute top-1/2 right-5 -translate-y-1/2 text-slate-500" size={16} />
                          </div>
                       </div>
                    </div>

                    <button className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-3xl shadow-indigo-500/30 hover:bg-slate-950 transition-all active:scale-95 flex items-center justify-center gap-3 border-none">
                       <Zap size={18} fill="currentColor" /> {t('integrations.modal.establish')}
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

// --- View Components ---

const AppsView = ({ integrations, loading, isRtl, onConfigure, t }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
     {MARKETPLACE_APPS.map((app) => {
       const isConnected = integrations.some((i: any) => i.provider === app.id);
       return (
         <div key={app.id} className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:shadow-[0_20px_80px_rgba(0,0,0,0.1)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Puzzle size={100}/></div>
            <div className={cn("flex items-center gap-6 mb-8", isRtl && "flex-row-reverse")}>
               <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 p-3.5 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                  <img src={app.logo} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" alt={app.name} />
               </div>
               <div className={isRtl ? "text-right" : "text-left"}>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{app.name}</h4>
                  <span className={cn("inline-block mt-2.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", isConnected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent")}>
                     {isConnected ? t('integrations.apps.linked') : t('integrations.apps.available')}
                  </span>
               </div>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic mb-10 leading-relaxed opacity-80">"{t(app.desc)}"</p>
            <button 
              onClick={() => onConfigure(app)}
              className={cn("w-full py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.25em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2.5 border-none", isConnected ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20")}
            >
               {isConnected ? <><Settings2 size={16}/> {t('integrations.apps.configure')}</> : <><Zap size={16} fill="currentColor"/> {t('integrations.apps.establish')}</>}
            </button>
         </div>
       );
     })}
  </motion.div>
);

const WebhooksView = ({ webhooks, loading, isRtl, t }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
     <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-white/5 flex justify-between items-center shadow-3xl">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-600 rounded-xl shadow-xl"><Radio size={20} /></div>
           <div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter">{t('integrations.webhooks.title')}</h3>
              <p className="text-[7px] font-black text-indigo-300 uppercase tracking-widest">{t('integrations.webhooks.subtitle')}</p>
           </div>
        </div>
        <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center gap-2.5 border-none">
           <Plus size={18}/> {t('integrations.webhooks.new')}
        </button>
     </div>
     <div className="grid gap-5">
        {webhooks.length === 0 ? (
          <div className="py-24 bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-30 grayscale">
             <WebhookIcon size={80} strokeWidth={1} className="mb-6 text-indigo-600 animate-pulse" />
             <p className="font-black uppercase text-xs tracking-[0.4em] italic">{t('integrations.webhooks.empty')}</p>
          </div>
        ) : webhooks.map((w: any) => (
          <div key={w._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:shadow-3xl transition-all">
             <div className={cn("flex items-center gap-8", isRtl && "flex-row-reverse")}>
                <div className="w-16 h-16 rounded-[1.8rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                   <WebhookIcon size={28} />
                </div>
                <div className={isRtl ? "text-right" : "text-left"}>
                   <div className={cn("flex items-center gap-3 mb-1.5", isRtl && "flex-row-reverse")}>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{w.event}</h4>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">{t('common.active')}</span>
                   </div>
                   <code className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-black/20 p-1.5 rounded-lg block mt-3 border border-slate-100 dark:border-white/5">{w.targetUrl}</code>
                </div>
             </div>
             <div className="flex items-center gap-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-indigo-500/20 active:scale-90 border-none"><Edit size={18}/></button>
                <button className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:text-rose-600 hover:bg-rose-500 rounded-xl transition-all border border-transparent active:scale-90 shadow-sm border-none"><Trash2 size={18}/></button>
             </div>
          </div>
        ))}
     </div>
  </motion.div>
);

const APIView = ({ isRtl, t }: any) => {
  const [copied, setCopied] = useState(false);
  const apiKey = import.meta.env.VITE_API_KEY || "sk_test_PLACEHOLDER_FOR_UI";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success(t('integrations.toast.cached'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
       <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-3xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 p-10 opacity-5"><Code size={200} /></div>
          <div className="relative z-10 space-y-10">
             <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                <div className="p-5 bg-white/10 rounded-[1.8rem] backdrop-blur-3xl border border-white/10 shadow-2xl shrink-0"><Key size={32} /></div>
                <div className={isRtl ? "text-right" : "text-left"}>
                   <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">{t('integrations.apiView.title')}</h3>
                   <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-60 mt-3">{t('integrations.apiView.subtitle')}</p>
                </div>
             </div>
             
             <div className="p-8 bg-black/60 rounded-[2.5rem] border border-white/10 relative group shadow-inner">
                <div className={cn("flex justify-between items-center mb-5", isRtl && "flex-row-reverse")}>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t('integrations.apiView.masterSign')}</p>
                   <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse flex items-center gap-2.5"><ShieldCheck size={12}/> {t('integrations.apiView.secure')}</span>
                </div>
                <div className={cn("flex items-center gap-5", isRtl && "flex-row-reverse")}>
                   <code className="text-xs font-mono font-bold text-slate-300 break-all bg-white/5 p-3 rounded-xl flex-1 border border-white/5 select-all">{apiKey}</code>
                   <button onClick={copyToClipboard} className="p-4 bg-white text-indigo-600 rounded-xl shadow-2xl hover:scale-110 active:scale-95 transition-all shrink-0 border-none">
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                   </button>
                </div>
             </div>

             <div className={cn("flex flex-wrap gap-5", isRtl && "flex-row-reverse")}>
                <button className="px-10 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-3xl shadow-indigo-500/40 hover:bg-emerald-500 transition-all active:scale-95 flex items-center gap-3.5 border-none">
                   <RefreshCcw size={18} /> {t('integrations.apiView.rotate')}
                </button>
                <button className="px-10 py-5 bg-white/5 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest backdrop-blur-3xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3.5 active:scale-95 border-none">
                   <Terminal size={18} /> {t('integrations.apiView.docs')}
                </button>
             </div>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-3xl relative">
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] italic">{t('integrations.apiView.topology')}</h3>
             <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 uppercase">{t('integrations.apiView.live')}</span>
             </div>
          </div>
          <div className="h-[200px] flex flex-col items-center justify-center opacity-20 group">
             <Network size={64} className="text-indigo-600 animate-pulse mb-6 group-hover:scale-110 transition-transform duration-1000" />
             <p className="text-[10px] font-black uppercase tracking-[0.6em]">{t('integrations.apiView.monitoring')}</p>
          </div>
       </div>
    </motion.div>
  );
};

// --- Helper Components ---

const PulseNode = ({ label, value, color }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80">{label}</span>
        <span className="text-xs font-black italic tracking-tighter">{value}%</span>
     </div>
     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 2.5, ease: "circOut" }} className={cn("h-full bg-white", value > 90 ? 'shadow-[0_0_15px_white]' : '')} />
     </div>
  </div>
);

const SecurityCard = ({ icon, title, status, desc }: any) => (
  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all shadow-sm">
     <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 group-hover:rotate-12 transition-transform shadow-lg border border-white/5 shrink-0 border-none">{icon}</div>
           <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">{title}</p>
        </div>
        <span className={cn("text-[7px] font-black px-2.5 py-1 rounded-lg border shadow-sm", 
          status === 'ACTIVE' || status === 'ENFORCED' 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
        )}>SIGNAL_{status}</span>
     </div>
     <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-[52px] opacity-70 italic leading-relaxed">"{desc}"</p>
  </div>
);

export default Integrations;
