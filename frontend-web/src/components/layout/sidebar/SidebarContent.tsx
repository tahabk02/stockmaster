import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { 
  Zap, Sun, Moon, LayoutDashboard, Brain, BarChart3, Package, ScrollText, 
  Wallet, Factory, Trello, Truck, Map, RotateCcw, Scan, RefreshCw, Users, 
  Receipt, CircleDollarSign, FileText, Scale, Globe, PlaySquare, MessageCircle, 
  Users as TeamIcon, HeartPulse, Megaphone, Activity, Settings, Puzzle, 
  BookOpen, CreditCard, Terminal, Server, Fingerprint, Unplug, Microscope 
} from "lucide-react";
import { NavButton } from "./NavButton";
import { SectionHeader } from "./SectionHeader";

const LAN_MAP: Record<string, { labelKey: string; flag: string }> = {
  en: { labelKey: "common.languages.en", flag: "🇬🇧" },
  fr: { labelKey: "common.languages.fr", flag: "🇫🇷" },
  ar: { labelKey: "common.languages.ar", flag: "🇲🇦" },
};

interface SidebarContentProps {
  isCollapsed: boolean;
  isRtl: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  tenant: any;
  user: any;
  logout: () => void;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const SidebarContent = ({
  isCollapsed,
  isRtl,
  theme,
  toggleTheme,
  tenant,
  user,
  logout,
  setIsMobileMenuOpen,
}: SidebarContentProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(["nav", "common"]);

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "VENDOR"].includes(user?.role || "");
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsMobileMenuOpen?.(false);
  };

  const goTo = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen?.(false);
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar relative border-r border-slate-200/60 dark:border-[color:var(--border)] bg-white dark:bg-[color:var(--sidebar-bg)]">
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />

      <div className={cn("mb-8 flex flex-col gap-6", isCollapsed ? "items-center" : "px-1")}>
        <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
          <motion.div
            whileHover={{ rotate: -10, scale: 1.05 }}
            onClick={() => goTo("/")}
            className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-xl shrink-0 cursor-pointer relative group overflow-hidden border-none"
          >
            {tenant?.logo ? (
              <img
                src={tenant.logo}
                className="w-full h-full object-contain p-1.5 dark:invert transition-all"
                alt={t('common:logo', 'Logo')}
              />
            ) : (
              <Zap size={28} className="text-white dark:text-black relative z-10" fill="currentColor" />
            )}
          </motion.div>
          {!isCollapsed && (
            <div className={cn("flex flex-col min-w-0", isRtl && "items-end")}>
              <span className="text-lg font-black tracking-tighter uppercase italic leading-none text-slate-900 dark:text-white truncate max-w-[120px]">
                {tenant?.name || t('common:system_name', 'StockMaster')}
              </span>
              <span className="text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] italic mt-1 leading-none">
                {tenant?.slug || t('common:system_version', 'CORE_LATTICE_V5')}
              </span>
            </div>
          )}
        </div>

        <div className={cn("flex gap-2", isCollapsed ? "flex-col items-center" : "flex-row")}>
          <button
            onClick={toggleTheme}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm",
              theme === "dark"
                ? "bg-white/5 text-amber-400 border-white/10 shadow-none"
                : "bg-white text-indigo-600 border-slate-200/60 hover:bg-slate-50",
            )}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="flex gap-1 p-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-transparent flex-1 shadow-sm dark:shadow-none">
            {["en", "fr", "ar"].map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={cn(
                  "rounded-lg transition-all border-none flex items-center justify-center flex-1 h-8",
                  i18n.language === l
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5",
                )}
              >
                <span className="text-xs">{LAN_MAP[l].flag}</span>
                {!isCollapsed && (
                  <span className="text-[8px] font-black uppercase ml-2">
                    {t(`common:languages.${l}`)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 pb-8 space-y-1">
        <SectionHeader label={t('sections.core')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/dashboard")} active={location.pathname === "/dashboard"} icon={<LayoutDashboard />} label={t('dashboard')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/ai-intelligence")} active={location.pathname === "/ai-intelligence"} icon={<Brain />} label={t('ai')} collapsed={isCollapsed} isRtl={isRtl} badge="AI" />
        <NavButton onClick={() => goTo("/financial-intelligence")} active={location.pathname === "/financial-intelligence"} icon={<BarChart3 />} label={t('finance_intel')} collapsed={isCollapsed} isRtl={isRtl} accent="emerald" />

        <SectionHeader label={t('sections.ops')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/inventory")} active={location.pathname === "/inventory"} icon={<Package />} label={t('inventory')} collapsed={isCollapsed} isRtl={isRtl} accent="emerald" />
        <NavButton onClick={() => goTo("/sales")} active={location.pathname === "/sales"} icon={<Zap />} label={t('sales')} collapsed={isCollapsed} isRtl={isRtl} accent="emerald" />
        <NavButton onClick={() => goTo("/stock-ledger")} active={location.pathname === "/stock-ledger"} icon={<ScrollText />} label={t('orders')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/purchases")} active={location.pathname === "/purchases"} icon={<Wallet />} label={t('purchases')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/production/hub")} active={location.pathname === "/production/hub"} icon={<Factory />} label={t('production')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/ops/flow")} active={location.pathname === "/ops/flow"} icon={<Trello />} label={t('ops_flow')} collapsed={isCollapsed} isRtl={isRtl} accent="sky" />
        <NavButton onClick={() => goTo("/ops/quality")} active={location.pathname === "/ops/quality"} icon={<Microscope />} label={t('quality')} collapsed={isCollapsed} isRtl={isRtl} accent="rose" />

        <SectionHeader label={t('sections.infra')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/logistics/fleet")} active={location.pathname === "/logistics/fleet"} icon={<Truck />} label={t('logistics')} collapsed={isCollapsed} isRtl={isRtl} accent="sky" />
        <NavButton onClick={() => goTo("/warehouse-map")} active={location.pathname === "/warehouse-map"} icon={<Map />} label={t('map')} collapsed={isCollapsed} isRtl={isRtl} accent="sky" />
        <NavButton onClick={() => goTo("/logistics/returns")} active={location.pathname === "/logistics/returns"} icon={<RotateCcw />} label={t('returns')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/optical-scanner")} active={location.pathname === "/optical-scanner"} icon={<Scan />} label={t('scanner')} collapsed={isCollapsed} isRtl={isRtl} badge="PRO" />
        <NavButton onClick={() => goTo("/neural-restock")} active={location.pathname === "/neural-restock"} icon={<RefreshCw />} label={t('restock')} collapsed={isCollapsed} isRtl={isRtl} badge="AI" />

        <SectionHeader label={t('sections.commercial')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/clients")} active={location.pathname === "/clients"} icon={<Users />} label={t('clients')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/suppliers")} active={location.pathname === "/suppliers"} icon={<Truck />} label={t('suppliers')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/invoices")} active={location.pathname === "/invoices"} icon={<Receipt />} label={t('invoices')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/finance/expenses")} active={location.pathname === "/finance/expenses"} icon={<CircleDollarSign />} label={t('expenses')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/legal/contracts")} active={location.pathname === "/legal/contracts"} icon={<FileText />} label={t('legal')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/legal/consultant")} active={location.pathname === "/legal/consultant"} icon={<Scale />} label={t('legal_ai')} collapsed={isCollapsed} isRtl={isRtl} badge="AI" />

        <SectionHeader label={t('sections.network')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/community")} active={location.pathname === "/community"} icon={<Globe />} label={t('community')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/reels")} active={location.pathname === "/reels"} icon={<PlaySquare />} label={t('reels')} collapsed={isCollapsed} isRtl={isRtl} badge="NEW" />
        <NavButton onClick={() => goTo("/messages")} active={location.pathname === "/messages"} icon={<MessageCircle />} label={t('messages')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/team")} active={location.pathname === "/team"} icon={<TeamIcon />} label={t('team')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/hr/pulse")} active={location.pathname === "/hr/pulse"} icon={<HeartPulse />} label={t('hr')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/marketing")} active={location.pathname === "/marketing"} icon={<Megaphone />} label={t('marketing')} collapsed={isCollapsed} isRtl={isRtl} />

        <SectionHeader label={t('sections.system')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/system-status")} active={location.pathname === "/system-status"} icon={<Activity />} label={t('system_status')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/settings")} active={location.pathname === "/settings"} icon={<Settings />} label={t('settings')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/integrations")} active={location.pathname === "/integrations"} icon={<Puzzle />} label={t('links')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/docs/archives")} active={location.pathname === "/docs/archives"} icon={<BookOpen />} label={t('docs')} collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton onClick={() => goTo("/subscriptions/plans")} active={location.pathname === "/subscriptions/plans"} icon={<CreditCard />} label={t('plans')} collapsed={isCollapsed} isRtl={isRtl} />

        {isAdmin && (
          <>
            <SectionHeader label={t('sections.admin')} collapsed={isCollapsed} isRtl={isRtl} />
            <NavButton onClick={() => goTo("/admin/console")} active={location.pathname === "/admin/console"} icon={<Terminal />} label={t('admin_console')} collapsed={isCollapsed} isRtl={isRtl} />
            {isSuperAdmin && (
              <NavButton onClick={() => goTo("/admin/tenants")} active={location.pathname === "/admin/tenants"} icon={<Server />} label={t('tenants')} collapsed={isCollapsed} isRtl={isRtl} />
            )}
            <NavButton onClick={() => goTo("/audit")} active={location.pathname === "/audit"} icon={<Fingerprint />} label={t('audit')} collapsed={isCollapsed} isRtl={isRtl} />
            <NavButton onClick={() => goTo("/jobs")} active={location.pathname === "/jobs"} icon={<RefreshCw />} label={t('jobs')} collapsed={isCollapsed} isRtl={isRtl} />
          </>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-200/60 dark:border-white/5 shrink-0">
        {!isCollapsed && (
          <div
            onClick={() => goTo("/profile")}
            className="p-4 mb-4 bg-white dark:bg-[color:var(--card)] rounded-[1.5rem] relative overflow-hidden group/card cursor-pointer shadow-sm border border-slate-200/60"
          >
            <div className={cn("flex items-center gap-4 relative z-10", isRtl && "flex-row-reverse")}>
              <div className="w-11 h-11 rounded-xl bg-[color:var(--primary-color)] flex items-center justify-center text-white font-black text-base shadow-lg group-hover/card:rotate-6 transition-all duration-700 overflow-hidden border border-white/20">
                {user?.profileImage ? (
                  <img src={user.profileImage} className="w-full h-full object-cover" alt="P" />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic truncate mb-1.5">
                  {user?.name}
                </p>
                <div className={cn("flex items-center gap-1.5", isRtl && "flex-row-reverse")}>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t('common:agent', 'AUTHORIZED_AGENT')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (window.confirm(t("common:confirmLogout"))) logout();
          }}
          className="w-full flex items-center gap-4 px-4 py-5 rounded-[2rem] transition-all font-black uppercase text-[10px] tracking-[0.4em] italic group relative overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-none text-[color:var(--primary-color)] shadow-sm dark:shadow-none"
        >
          <Unplug size={20} className="text-rose-500 group-hover:scale-110 transition-all" />
          {!isCollapsed && <span className="text-rose-500/60">{t("common:logout")}</span>}
        </button>
      </div>
    </div>
  );
};
