import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth.slice";
import { useTenant } from "../../store/tenant.slice";
import {
  Truck,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Zap,
  Globe,
  MessageCircle,
  FileText,
  Activity,
  Trello,
  Map,
  Users as TeamIcon,
  ShieldCheck,
  Server,
  Terminal,
  Fingerprint,
  Search,
  Lock,
  Cpu,
  Radio,
  Shield,
  BarChart3,
  Box,
  Database,
  Layers,
  Compass,
  Brain,
  Sparkles,
  CreditCard,
  Wallet,
  BookOpen,
  Share2,
  Scan,
  Scale,
  History,
  Camera,
  Microscope,
  Factory,
  HeartPulse,
  Megaphone,
  RotateCcw,
  Landmark,
  ScrollText,
  Puzzle,
  FileStack,
  Briefcase,
  Video,
  Receipt,
  Sun,
  Moon,
  CircleDollarSign,
  ClipboardList,
  HardDrive,
  Unplug,
  PlaySquare,
  Landmark as BankIcon,
  FileSpreadsheet,
  RefreshCw,
  Construction,
  Boxes,
  Microscope as QualityIcon,
  Users,
  Heart,
  Layers3,
  FlaskConical,
  LifeBuoy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import NeuralChat from "./NeuralChat";
import { NotificationCenter } from "./NotificationCenter";
import { PulseNode } from "../team/TeamUI";
import { NavButton } from "./sidebar/NavButton";
import { SectionHeader } from "./sidebar/SectionHeader";
import { useThemeStore } from "../../store/theme.slice";

const LAN_MAP: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  fr: { label: "Français", flag: "🇫🇷" },
  ar: { label: "العربية", flag: "🇲🇦" },
};

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1440);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { theme, toggleTheme, primaryColor, fontFamily } = useThemeStore();
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "VENDOR"].includes(user?.role || "");
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.style.setProperty("--primary-color", primaryColor);
    root.style.setProperty("--font-family", fontFamily);
    document.body.style.fontFamily = fontFamily;
  }, [theme, primaryColor, fontFamily]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1440) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsMobileMenuOpen(false);
  };
  const goTo = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar relative border-r border-[color:var(--border)] bg-[color:var(--sidebar-bg)] dark:bg-[color:var(--sidebar-bg)]">
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
                alt="Logo"
              />
            ) : (
              <Zap size={28} className="text-white dark:text-black relative z-10" fill="currentColor" />
            )}
          </motion.div>
          {!isCollapsed && (
            <div className={cn("flex flex-col min-w-0", isRtl && "items-end")}>
              <span className="text-lg font-black tracking-tighter uppercase italic leading-none text-slate-900 dark:text-white truncate max-w-[120px]">
                {tenant?.name || "StockMaster"}
              </span>
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] italic mt-1 leading-none">
                {tenant?.slug || "CORE_LATTICE_V5"}
              </span>
            </div>
          )}

        </div>


        <div
          className={cn(
            "flex gap-2",
            isCollapsed ? "flex-col items-center" : "flex-row",
          )}
        >
          <button
            onClick={toggleTheme}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm",
              theme === "dark"
                ? "bg-white/5 text-amber-400 border-white/10 shadow-none"
                : "bg-white text-indigo-600 border-slate-100",
            )}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="flex gap-1 p-1 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-transparent flex-1 shadow-sm dark:shadow-none">
            {["en", "fr", "ar"].map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={cn(
                  "rounded-lg transition-all border-none flex items-center justify-center flex-1 h-8",
                  i18n.language === l
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5",
                )}
              >

                <span className="text-xs">{LAN_MAP[l].flag}</span>
                {!isCollapsed && (
                  <span className="text-[8px] font-black uppercase ml-2">
                    {l}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 pb-8 space-y-1">
        <SectionHeader
          label="CORE INTEL"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/dashboard")}
          active={location.pathname === "/dashboard"}
          icon={<LayoutDashboard />}
          label="Dashboard"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/ai-intelligence")}
          active={location.pathname === "/ai-intelligence"}
          icon={<Brain />}
          label="AI Neural"
          collapsed={isCollapsed}
          isRtl={isRtl}
          badge="AI"
        />
        <NavButton
          onClick={() => goTo("/financial-intelligence")}
          active={location.pathname === "/financial-intelligence"}
          icon={<BarChart3 />}
          label="Fiscal Intel"
          collapsed={isCollapsed}
          isRtl={isRtl}
          accent="emerald"
        />

        <SectionHeader
          label="OPERATIONS"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/inventory")}
          active={location.pathname === "/inventory"}
          icon={<Package />}
          label="Inventory"
          collapsed={isCollapsed}
          isRtl={isRtl}
          accent="emerald"
        />
        <NavButton
          onClick={() => goTo("/sales")}
          active={location.pathname === "/sales"}
          icon={<Zap />}
          label="Sales Flux"
          collapsed={isCollapsed}
          isRtl={isRtl}
          accent="emerald"
        />
        <NavButton
          onClick={() => goTo("/stock-ledger")}
          active={location.pathname === "/stock-ledger"}
          icon={<ScrollText />}
          label="Orders"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/purchases")}
          active={location.pathname === "/purchases"}
          icon={<Wallet />}
          label="Purchases"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/production/hub")}
          active={location.pathname === "/production/hub"}
          icon={<Factory />}
          label="Production"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/ops/flow")}
          active={location.pathname === "/ops/flow"}
          icon={<Trello />}
          label="Ops Flow"
          collapsed={isCollapsed}
          isRtl={isRtl}
          accent="sky"
        />
        <NavButton
          onClick={() => goTo("/ops/quality")}
          active={location.pathname === "/ops/quality"}
          icon={<QualityIcon />}
          label="Quality Zenith"
          collapsed={isCollapsed}
          isRtl={isRtl}
          accent="rose"
        />

        <SectionHeader
          label="LOGISTICS"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/logistics/fleet")}
          active={location.pathname === "/logistics/fleet"}
          icon={<Truck />}
          label="Fleet"
          collapsed={isCollapsed}
          isRtl={isRtl}
          accent="sky"
        />
        <NavButton
          onClick={() => goTo("/warehouse-map")}
          active={location.pathname === "/warehouse-map"}
          icon={<Map />}
          label="Grid Map"
          collapsed={isCollapsed}
          isRtl={isRtl}
          accent="sky"
        />
        <NavButton
          onClick={() => goTo("/logistics/returns")}
          active={location.pathname === "/logistics/returns"}
          icon={<RotateCcw />}
          label="Returns"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/optical-scanner")}
          active={location.pathname === "/optical-scanner"}
          icon={<Scan />}
          label="Scanner"
          collapsed={isCollapsed}
          isRtl={isRtl}
          badge="PRO"
        />
        <NavButton
          onClick={() => goTo("/neural-restock")}
          active={location.pathname === "/neural-restock"}
          icon={<RefreshCw />}
          label="Restock"
          collapsed={isCollapsed}
          isRtl={isRtl}
          badge="AI"
        />

        <SectionHeader
          label="COMMERCIAL"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/clients")}
          active={location.pathname === "/clients"}
          icon={<Users />}
          label="Clients"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/suppliers")}
          active={location.pathname === "/suppliers"}
          icon={<Truck />}
          label="Suppliers"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/invoices")}
          active={location.pathname === "/invoices"}
          icon={<Receipt />}
          label="Invoices"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/finance/expenses")}
          active={location.pathname === "/finance/expenses"}
          icon={<CircleDollarSign />}
          label="Expenses"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/legal/contracts")}
          active={location.pathname === "/legal/contracts"}
          icon={<FileText />}
          label="Contracts"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/legal/consultant")}
          active={location.pathname === "/legal/consultant"}
          icon={<Scale />}
          label="Legal AI"
          collapsed={isCollapsed}
          isRtl={isRtl}
          badge="AI"
        />

        <SectionHeader label="NETWORK" collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton
          onClick={() => goTo("/community")}
          active={location.pathname === "/community"}
          icon={<Globe />}
          label="Community"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/reels")}
          active={location.pathname === "/reels"}
          icon={<PlaySquare />}
          label="Reels"
          collapsed={isCollapsed}
          isRtl={isRtl}
          badge="NEW"
        />
        <NavButton
          onClick={() => goTo("/messages")}
          active={location.pathname === "/messages"}
          icon={<MessageCircle />}
          label="Messages"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/team")}
          active={location.pathname === "/team"}
          icon={<TeamIcon />}
          label="Team"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/hr/pulse")}
          active={location.pathname === "/hr/pulse"}
          icon={<HeartPulse />}
          label="HR Pulse"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/marketing")}
          active={location.pathname === "/marketing"}
          icon={<Megaphone />}
          label="Marketing"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />

        <SectionHeader label="SYSTEM" collapsed={isCollapsed} isRtl={isRtl} />
        <NavButton
          onClick={() => goTo("/system-status")}
          active={location.pathname === "/system-status"}
          icon={<Activity />}
          label="Status"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/settings")}
          active={location.pathname === "/settings"}
          icon={<Settings />}
          label="Settings"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/integrations")}
          active={location.pathname === "/integrations"}
          icon={<Puzzle />}
          label="Links"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/docs/archives")}
          active={location.pathname === "/docs/archives"}
          icon={<BookOpen />}
          label="Docs"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />
        <NavButton
          onClick={() => goTo("/subscriptions/plans")}
          active={location.pathname === "/subscriptions/plans"}
          icon={<CreditCard />}
          label="Plans"
          collapsed={isCollapsed}
          isRtl={isRtl}
        />

        {isAdmin && (
          <>
            <SectionHeader
              label="ADMIN"
              collapsed={isCollapsed}
              isRtl={isRtl}
            />
            <NavButton
              onClick={() => goTo("/admin/console")}
              active={location.pathname === "/admin/console"}
              icon={<Terminal />}
              label="Console"
              collapsed={isCollapsed}
              isRtl={isRtl}
            />
            {isSuperAdmin && (
              <NavButton
                onClick={() => goTo("/admin/tenants")}
                active={location.pathname === "/admin/tenants"}
                icon={<Server />}
                label="Registry"
                collapsed={isCollapsed}
                isRtl={isRtl}
              />
            )}
            <NavButton
              onClick={() => goTo("/audit")}
              active={location.pathname === "/audit"}
              icon={<Fingerprint />}
              label="Audit"
              collapsed={isCollapsed}
              isRtl={isRtl}
            />
            <NavButton
              onClick={() => goTo("/jobs")}
              active={location.pathname === "/jobs"}
              icon={<RefreshCw />}
              label="Jobs"
              collapsed={isCollapsed}
              isRtl={isRtl}
            />
          </>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5 shrink-0">
        {!isCollapsed && (
          <div
            onClick={() => goTo("/profile")}
            className="p-4 mb-4 bg-[color:var(--text)] dark:bg-[color:var(--card)] rounded-[1.5rem] relative overflow-hidden group/card cursor-pointer shadow-2xl"
          >
            <div
              className={cn(
                "flex items-center gap-4 relative z-10",
                isRtl && "flex-row-reverse",
              )}
            >
              <div className="w-11 h-11 rounded-xl bg-[color:var(--primary-color)] flex items-center justify-center text-white font-black text-base shadow-xl group-hover/card:rotate-6 transition-all duration-700 overflow-hidden border border-white/20">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    className="w-full h-full object-cover"
                    alt="P"
                  />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-white dark:text-black uppercase italic truncate mb-1.5">
                  {user?.name}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    AUTHORIZED_AGENT
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (window.confirm(t("common.confirmLogout"))) logout();
          }}
          className="w-full flex items-center gap-4 px-4 py-5 rounded-[2rem] transition-all font-black uppercase text-[10px] tracking-[0.4em] italic group relative overflow-hidden bg-[color:var(--surface)]/50 dark:bg-white/5 border-none text-[color:var(--primary-color)]"
        >
          <Unplug
            size={20}
            className="text-rose-500 group-hover:scale-110 transition-all"
          />
          {!isCollapsed && (
            <span className="text-rose-500/60">{t("common.logout")}</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div
      key={theme}
      className={cn(
        "min-h-screen selection:bg-indigo-500/30 transition-colors duration-500",
        isRtl && "rtl",
      )}
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] theme-card px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-xl shrink-0">
            {tenant?.logo ? (
              <img
                src={tenant.logo}
                className="w-full h-full object-contain p-1 transition-all"
                alt="L"
              />
            ) : (
              <Zap
                size={20}
                fill="currentColor"
                className="text-white dark:text-black"
              />
            )}
          </div>
          <span className="text-sm font-black tracking-tighter uppercase italic text-slate-900 dark:text-white truncate max-w-[150px]">
            {tenant?.name || "StockMaster"}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-indigo-600 text-white rounded-xl border-none shadow-lg shadow-indigo-500/20"
        >
          <Menu size={22} />
        </button>
      </div>


      <aside
        className={cn(
          "hidden lg:block fixed top-0 bottom-0 z-[90] theme-sidebar transition-all duration-700",
          isCollapsed ? "w-20" : "w-64",
          isRtl ? "right-0" : "left-0",
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-4xl z-[100] border-none",
            isRtl ? "-left-4" : "-right-4",
          )}
        >

          <ChevronLeft
            size={18}
            className={cn("transition-transform", isCollapsed && "rotate-180")}
          />
        </button>
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-3xl lg:hidden"
            />
            <motion.aside
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              className="fixed top-0 bottom-0 z-[120] w-64 theme-sidebar lg:hidden overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "transition-all duration-700 pt-20 lg:pt-0",
          !isCollapsed ? "lg:pl-64" : "lg:pl-20",
          isRtl && (!isCollapsed ? "lg:pr-64 lg:pl-0" : "lg:pr-20 lg:pl-0"),
        )}
      >
        <main className="min-h-screen p-4 md:p-8 lg:p-12 relative z-10">
          <div className="reveal-effect max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>

      <NeuralChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-[80] w-14 h-14 bg-[color:var(--text)] dark:bg-[color:var(--card)] text-white dark:text-black rounded-[1.5rem] flex items-center justify-center shadow-4xl border-none group overflow-hidden"
      >
        <div className="absolute inset-0 bg-[color:var(--primary-color)] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <MessageCircle size={28} className="relative z-10" />
      </button>
    </div>
  );
};
