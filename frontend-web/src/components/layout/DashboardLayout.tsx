import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth.slice";
import { useTenant } from "../../store/tenant.slice";
import { 
  Truck, LayoutDashboard, Package, ShoppingCart, 
  Settings, ChevronLeft, Menu, X, 
  LogOut, Zap, Globe, MessageCircle, 
  FileText, Activity, Trello, Map, Users as TeamIcon,
  ShieldCheck, Server, Terminal, Fingerprint, Search,
  Lock, Cpu, Radio, Shield, BarChart3, Box, 
  Database, Layers, Compass, Brain, Sparkles,
  CreditCard, Wallet, BookOpen, Share2, Scan, Scale,
  History, Camera, Microscope, Factory, HeartPulse,
  Megaphone, RotateCcw, Landmark, ScrollText, Puzzle,
  FileStack, Briefcase, Video, Receipt, Sun, Moon,
  CircleDollarSign, ClipboardList, HardDrive, Unplug,
  PlaySquare, Landmark as BankIcon, FileSpreadsheet, RefreshCw,
  Construction, Boxes, Microscope as QualityIcon, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import NeuralChat from "./NeuralChat";
import { NotificationCenter } from "./NotificationCenter";
import { PulseNode } from "../team/TeamUI";
import { NavButton } from "./sidebar/NavButton";
import { SectionHeader } from "./sidebar/SectionHeader";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1440);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "VENDOR"].includes(user?.role || "");
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 1440) setIsCollapsed(true); else setIsCollapsed(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeLang = (lang: string) => { i18n.changeLanguage(lang); setIsMobileMenuOpen(false); };
  const goTo = (path: string) => { navigate(path); setIsMobileMenuOpen(false); };

  const SidebarContent = () => (
    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar relative">
      <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="scanline opacity-[0.02] pointer-events-none" />

      {/* BRAND & KINETIC LOGO */}
      <div className={cn("mb-10 flex flex-col gap-6", isCollapsed ? "items-center" : "px-1")}>
         <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
            <motion.div 
              whileHover={{ rotate: -10, scale: 1.05 }}
              onClick={() => goTo("/")} 
              className="w-12 h-12 bg-slate-950 dark:bg-white rounded-xl flex items-center justify-center shadow-xl shrink-0 cursor-pointer relative group overflow-hidden border-none"
            >
               <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity" />
               {tenant?.logo ? 
                 <img src={tenant.logo} className="w-full h-full object-contain p-1.5 dark:invert transition-all" alt="Logo" /> : 
                 <Zap size={28} fill="currentColor" className="text-white dark:text-black" />
               }
            </motion.div>
            {!isCollapsed && (
              <div className={cn("flex flex-col min-w-0", isRtl && "items-end")}>
                 <span className="text-lg font-black tracking-tighter uppercase italic leading-none text-slate-950 dark:text-white">
                    StockMaster.
                 </span>
                 <div className={cn("flex items-center gap-1.5 mt-1.5", isRtl && "flex-row-reverse")}>
                    <PulseNode color="indigo" />
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none truncate max-w-[120px]">
                       {tenant?.name || 'CORE_LATTICE_V5'}
                    </span>
                 </div>
              </div>
            )}
         </div>
      </div>

      <div className="flex-1 pb-8">
        <SectionHeader label={t('nav.sections.core', { defaultValue: "Core Intel" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/dashboard")} active={location.pathname === "/dashboard"} icon={<LayoutDashboard />} label={t('nav.dashboard')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/ai-intelligence")} active={location.pathname === "/ai-intelligence"} icon={<Brain />} label={t('nav.ai')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/financial-intelligence")} active={location.pathname === "/financial-intelligence"} icon={<BarChart3 />} label={t('nav.finance_intel', { defaultValue: "Fiscal Intel" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/reports")} active={location.pathname === "/reports"} icon={<Layers />} label={t('nav.reports')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/ops/quality")} active={location.pathname === "/ops/quality"} icon={<QualityIcon />} label={t('nav.quality', { defaultValue: "Quality Zenith" })} collapsed={isCollapsed} isRtl={isRtl} />

        {isAdmin && (
          <>
            <SectionHeader label={t('nav.sections.admin', { defaultValue: "System Overlord" })} collapsed={isCollapsed} isRtl={isRtl} />
            <NavButton onClick={() => goTo("/admin/console")} active={location.pathname === "/admin/console"} icon={<Terminal />} label={t('nav.admin_console', { defaultValue: "Command Deck" })} collapsed={isCollapsed} isRtl={isRtl} />
            {isSuperAdmin && <NavButton onClick={() => goTo("/admin/tenants")} active={location.pathname === "/admin/tenants"} icon={<Server />} label={t('nav.tenants', { defaultValue: "Node Registry" })} collapsed={isCollapsed} isRtl={isRtl} />}
            <NavButton onClick={() => goTo("/audit")} active={location.pathname === "/audit"} icon={<Fingerprint />} label={t('nav.audit')} collapsed={isCollapsed} isRtl={isRtl} />
            <NavButton onClick={() => goTo("/jobs")} active={location.pathname === "/jobs"} icon={<RefreshCw />} label={t('nav.jobs')} collapsed={isCollapsed} isRtl={isRtl} />
          </>
        )}

        <SectionHeader label={t('nav.sections.ops', { defaultValue: "Industrial Ops" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/sales")} active={location.pathname === "/sales"} icon={<Zap />} label={t('nav.sales')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/inventory")} active={location.pathname === "/inventory"} icon={<Package />} label={t('nav.inventory')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/stock-ledger")} active={location.pathname === "/stock-ledger"} icon={<ScrollText />} label={t('nav.orders')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/purchases")} active={location.pathname === "/purchases"} icon={<Wallet />} label={t('nav.purchases')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/production/hub")} active={location.pathname === "/production/hub"} icon={<Factory />} label={t('nav.production')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/neural-restock")} active={location.pathname === "/neural-restock"} icon={<RefreshCw />} label={t('nav.restock', { defaultValue: "Neural Restock" })} collapsed={isCollapsed} isRtl={isRtl} badge="AI" />
        <NavButton onClick={() => goTo("/optical-scanner")} active={location.pathname === "/optical-scanner"} icon={<Scan />} label={t('nav.scanner')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/logistics/returns")} active={location.pathname === "/logistics/returns"} icon={<RotateCcw />} label={t('nav.returns')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/ops/flow")} active={location.pathname === "/ops/flow"} icon={<Trello />} label={t('nav.ops_flow', { defaultValue: "Ops Flow" })} collapsed={isCollapsed} isRtl={isRtl} />

        <SectionHeader label={t('nav.sections.commercial', { defaultValue: "Commercial Assets" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/clients")} active={location.pathname === "/clients"} icon={<Users />} label={t('nav.clients')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/suppliers")} active={location.pathname === "/suppliers"} icon={<Truck />} label={t('nav.suppliers')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/logistics/fleet")} active={location.pathname === "/logistics/fleet"} icon={<Activity />} label={t('nav.logistics')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/warehouse-map")} active={location.pathname === "/warehouse-map"} icon={<Map />} label={t('nav.map')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/legal/consultant")} active={location.pathname === "/legal/consultant"} icon={<Scale />} label={t('nav.legal_consultant', { defaultValue: "Conseiller Juridique" })} collapsed={isCollapsed} isRtl={isRtl} badge="AI" />
        <NavButton onClick={() => goTo("/legal/contracts")} active={location.pathname === "/legal/contracts"} icon={<FileText />} label={t('nav.legal')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/invoices")} active={location.pathname === "/invoices"} icon={<Receipt />} label={t('nav.invoices', { defaultValue: "Invoice Vault" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/finance/expenses")} active={location.pathname === "/finance/expenses"} icon={<CircleDollarSign />} label={t('nav.expenses')} collapsed={isCollapsed} isRtl={isRtl} />

        <SectionHeader label={t('nav.sections.growth', { defaultValue: "Growth" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/community")} active={location.pathname === "/community"} icon={<Globe />} label={t('nav.community', { defaultValue: "Market Feed" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/reels")} active={location.pathname === "/reels"} icon={<PlaySquare />} label={t('nav.reels')} collapsed={isCollapsed} isRtl={isRtl} badge="NEW" />
        <NavButton onClick={() => goTo("/messages")} active={location.pathname === "/messages"} icon={<MessageCircle />} label={t('nav.comms')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/team")} active={location.pathname === "/team"} icon={<TeamIcon />} label={t('nav.team')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/hr/pulse")} active={location.pathname === "/hr/pulse"} icon={<HeartPulse />} label={t('nav.hr')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/marketing")} active={location.pathname === "/marketing"} icon={<Megaphone />} label={t('nav.marketing')} collapsed={isCollapsed} isRtl={isRtl} />

        <SectionHeader label={t('nav.sections.infra', { defaultValue: "Infrastructure" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/system-status")} active={location.pathname === "/system-status"} icon={<Activity />} label={t('nav.system_status', { defaultValue: "System Monitor" })} collapsed={isCollapsed} isRtl={isRtl} badge="PRO" />
        <NavButton onClick={() => goTo("/settings")} active={location.pathname === "/settings"} icon={<Settings />} label={t('nav.settings')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/profile")} active={location.pathname === "/profile"} icon={<Users />} label={t('nav.profile')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/integrations")} active={location.pathname === "/integrations"} icon={<Puzzle />} label={t('nav.links')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/docs/archives")} active={location.pathname === "/docs/archives"} icon={<BookOpen />} label={t('nav.docs', { defaultValue: "Archive Vault" })} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/subscriptions/plans")} active={location.pathname === "/subscriptions/plans"} icon={<CreditCard />} label={t('nav.saas')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/my-subscriptions")} active={location.pathname === "/my-subscriptions"} icon={<Briefcase />} label={t('nav.my_subs', { defaultValue: "My Subscriptions" })} collapsed={isCollapsed} isRtl={isRtl} />
      </div>

      {/* CREATIVE CONTROL HUB */}
      {!isCollapsed && (
        <div className="mb-6 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-pro relative overflow-hidden">
           <div className="absolute inset-0 bg-indigo-600/5 opacity-50" />
           <div className="flex gap-1 relative z-10">
              {['en', 'fr', 'ar'].map(l => (
                <button key={l} onClick={() => changeLang(l)} className={cn("w-8 h-8 rounded-lg text-[8px] font-black uppercase transition-all border-none bg-white dark:bg-black/40 shadow-sm", i18n.language === l ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-indigo-500/40" : "text-slate-400 hover:text-indigo-500")}>{l}</button>
              ))}
           </div>
           {/* NEURAL THEME SWITCH - V2 ULTRA PRO */}
           <div 
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className={cn(
               "group relative w-16 h-9 rounded-full p-1 cursor-pointer transition-all duration-500 overflow-hidden border shadow-2xl",
               theme === 'dark' 
                 ? "bg-white/5 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                 : "bg-slate-200 border-slate-300 shadow-[0_0_20px_rgba(0,0,0,0.05)]"
             )}
           >
              {/* REACTIVE GLOW TRAIL */}
              <div className={cn(
                "absolute inset-0 transition-opacity duration-1000 blur-xl opacity-20",
                theme === 'dark' ? "bg-indigo-500" : "bg-amber-500"
              )} />

              {/* SLIDING TRACK AURA */}
              <motion.div 
                animate={{ 
                  x: theme === 'dark' ? 28 : 0,
                  rotate: theme === 'dark' ? 360 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "absolute inset-1 w-7 h-7 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.2)] z-10 flex items-center justify-center transition-colors duration-500",
                  theme === 'dark' ? "bg-white text-black" : "bg-slate-950 text-white"
                )}
              >
                 <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div
                        key="moon"
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "backOut" }}
                      >
                        <Moon size={14} fill="currentColor" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "backOut" }}
                      >
                        <Sun size={14} fill="currentColor" />
                      </motion.div>
                    )}
                 </AnimatePresence>

                 {/* MINI PULSE INDICATOR */}
                 <div className={cn(
                   "absolute inset-0 rounded-full animate-ping opacity-20",
                   theme === 'dark' ? "bg-indigo-400" : "bg-amber-400"
                 )} />
              </motion.div>

              {/* TRACK DECORATIONS */}
              <div className="flex justify-between items-center h-full px-2 relative z-0">
                 <Sun size={12} className={cn("transition-all duration-500", theme === 'light' ? "text-amber-500 opacity-100 scale-110" : "text-slate-400 opacity-20 scale-90")} />
                 <Moon size={12} className={cn("transition-all duration-500", theme === 'dark' ? "text-indigo-400 opacity-100 scale-110" : "text-slate-400 opacity-20 scale-90")} />
              </div>

              {/* KINETIC SHINE OVERLAY */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />
           </div>
        </div>
      )}

      {/* USER IDENTITY SECURITY CARD */}
      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5 shrink-0">
         {!isCollapsed && (
           <div onClick={() => goTo("/profile")} className={cn("p-4 mb-4 bg-slate-950 dark:bg-white rounded-[1.5rem] relative overflow-hidden group/card cursor-pointer shadow-2xl", isRtl && "text-right")}>
              <div className="absolute inset-0 grid-pattern opacity-10 dark:opacity-5" />
              <div className="scanline opacity-20" />
              <div className={cn("flex items-center gap-4 relative z-10", isRtl && "flex-row-reverse")}>
                 <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-xl group-hover/card:rotate-6 transition-all duration-700 overflow-hidden border border-white/20">
                    {user?.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" alt="Profile" /> : user?.name?.charAt(0)}
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-white dark:text-black uppercase italic truncate leading-none mb-1.5">{user?.name}</p>
                    <div className={cn("flex items-center gap-1.5", isRtl && "flex-row-reverse")}>
                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                       <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('common.status')}: Authorized</span>
                    </div>
                 </div>
              </div>
           </div>
         )}
         <button 
           onClick={() => {
             if(window.confirm("TERMINATE_SESSION_PROTOCOL?")) logout();
           }} 
           className={cn(
             "w-full flex items-center gap-4 px-4 py-5 rounded-[2rem] transition-all duration-700 font-black uppercase text-[10px] tracking-[0.4em] italic group relative overflow-hidden border border-transparent hover:border-rose-500/30 bg-slate-50/50 dark:bg-white/5 shadow-none hover:shadow-[0_20px_60px_rgba(244,63,94,0.15)]",
             isCollapsed ? "justify-center px-0" : "justify-start",
             isRtl && "flex-row-reverse"
           )}
         >
            {/* AMBIENT GLOW & GRID */}
            <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors duration-700" />
            <div className="absolute inset-0 grid-pattern opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
            
            {/* SCANLINE OVERLAY */}
            <div className="absolute inset-0 scanline opacity-0 group-hover:opacity-20 transition-opacity" />

            {/* KINETIC SHINE */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />

            <div className="relative z-10 flex items-center justify-center shrink-0">
               <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-white/10 flex items-center justify-center relative group-hover:bg-rose-600 transition-colors duration-500 shadow-2xl">
                  <div className="absolute inset-0 bg-rose-500 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 rounded-full scale-150" />
                  <Unplug size={20} className="text-rose-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shrink-0 relative z-10" />
               </div>
            </div>

            {!isCollapsed && (
              <div className={cn("flex flex-col relative z-10 min-w-0 flex-1 transition-all duration-700 group-hover:translate-x-1", isRtl ? "text-right pr-3" : "text-left pl-3")}>
                <span className="truncate text-[9px] text-rose-500/60 group-hover:text-rose-600 tracking-[0.3em] uppercase font-black leading-none mb-1">
                  {t('common.logout')}
                </span>
                <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
                   <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
                   <span className="text-[6px] font-black text-slate-400 dark:text-rose-500/40 uppercase tracking-widest truncate">SYSTEM_TERMINATE_v9.0</span>
                </div>
              </div>
            )}
            
            {/* INDICATOR LIGHT */}
            <div className={cn(
              "absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-500/20 group-hover:bg-rose-500 group-hover:shadow-[0_0_10px_#f43f5e] transition-all",
              isCollapsed && "hidden"
            )} />
         </button>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-white dark:bg-[#000] text-slate-900 dark:text-white selection:bg-indigo-500/30 transition-colors duration-500", isRtl && "rtl")}>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-white/90 dark:bg-black/80 backdrop-blur-3xl border-b border-slate-200 dark:border-white/10 px-6 py-4 flex justify-between items-center shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-slate-950 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-xl"><Zap size={20} fill="currentColor" /></div>
            <span className="text-sm font-black tracking-tighter uppercase italic text-slate-950 dark:text-white">StockMaster <span className="text-indigo-600">PRO</span></span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-indigo-600 text-white rounded-xl active:scale-90 transition-all border-none shadow-lg shadow-indigo-500/30">{isMobileMenuOpen ? <X size={22} strokeWidth={4} /> : <Menu size={22} strokeWidth={4} />}</button>
      </div>

      <aside className={cn("hidden lg:block fixed top-0 bottom-0 z-[90] bg-white dark:bg-black backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 transition-all duration-700 shadow-[10px_0_60px_rgba(0,0,0,0.05)] dark:shadow-none", isCollapsed ? "w-20" : "w-64", isRtl ? "right-0 border-l border-r-0" : "left-0")}>
         <SidebarContent />
         <button onClick={() => setIsCollapsed(!isCollapsed)} className={cn("absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-4xl hover:scale-110 active:scale-90 transition-all z-[100] border-none", isRtl ? "-left-4" : "-right-4")}><ChevronLeft size={18} strokeWidth={3} className={cn("transition-transform duration-500", isCollapsed && "rotate-180")} /></button>
      </aside>

      <AnimatePresence>{isMobileMenuOpen && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-3xl lg:hidden" /><motion.aside initial={{ x: isRtl ? "100%" : "-100%" }} animate={{ x: 0 }} exit={{ x: isRtl ? "100%" : "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 250 }} className="fixed top-0 bottom-0 z-[120] w-64 bg-white dark:bg-black border-r border-white/5 lg:hidden overflow-hidden"><div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" /><SidebarContent /></motion.aside></>}</AnimatePresence>

      <div className={cn("transition-all duration-700 pt-20 lg:pt-0", !isCollapsed ? "lg:pl-64" : "lg:pl-20", isRtl && (!isCollapsed ? "lg:pr-64 lg:pl-0" : "lg:pr-20 lg:pl-0"))}>
        <main className="min-h-screen p-4 md:p-8 lg:p-12 relative z-10"><div className="reveal-effect max-w-[1600px] mx-auto">{children}</div></main>
      </div>

      <NeuralChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-slate-950 dark:bg-white text-white dark:text-black rounded-[1.5rem] flex items-center justify-center shadow-4xl hover:scale-110 active:scale-90 transition-all group overflow-hidden border-none"><div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" /><MessageCircle size={28} className="relative z-10" /></button>
    </div>
  );
};
