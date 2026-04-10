import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth.slice";
import { useTenant } from "../../store/tenant.slice";
import {
  ChevronLeft,
  Menu,
  Zap,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import NeuralChat from "./NeuralChat";
import { SidebarContent } from "./sidebar/SidebarContent";
import { useThemeStore } from "../../store/theme.slice";

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
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      key={theme}
      className={cn(
        "min-h-screen selection:bg-indigo-500/30 transition-colors duration-500 bg-slate-50 dark:bg-[color:var(--bg)]",
        isRtl && "rtl",
      )}
      style={{ color: "var(--text)" }}
    >
      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[50] theme-card px-6 py-4 flex justify-between items-center shadow-2xl border-b border-slate-200/60 dark:border-white/5 bg-white dark:bg-[color:var(--sidebar-bg)]">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate("/")}
            className="w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-xl shrink-0 cursor-pointer"
          >
            {tenant?.logo ? (
              <img src={tenant.logo} className="w-full h-full object-contain p-1 dark:invert" alt="L" />
            ) : (
              <Zap size={20} fill="currentColor" className="text-white dark:text-black" />
            )}
          </div>
          <span className="text-sm font-black tracking-tighter uppercase italic text-slate-900 dark:text-white truncate max-w-[150px]">
            {tenant?.name || "StockMaster"}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-indigo-600 text-white rounded-xl border-none shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block fixed top-0 bottom-0 z-[40] transition-all duration-700 bg-white dark:bg-[color:var(--sidebar-bg)] border-r border-slate-200/60 dark:border-white/5",
          isCollapsed ? "w-20" : "w-64",
          isRtl ? "right-0" : "left-0",
        )}
      >
        <SidebarContent 
          isCollapsed={isCollapsed}
          isRtl={isRtl}
          theme={theme}
          toggleTheme={toggleTheme}
          tenant={tenant}
          user={user}
          logout={logout}
        />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-4xl z-[41] border-none hover:scale-110 transition-transform",
            isRtl ? "-left-4" : "-right-4",
          )}
        >
          <ChevronLeft
            size={18}
            className={cn("transition-transform", isCollapsed && "rotate-180")}
          />
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md lg:hidden"
            />
            <motion.aside
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              className="fixed top-0 bottom-0 z-[70] w-72 bg-white dark:bg-[color:var(--sidebar-bg)] lg:hidden overflow-hidden shadow-2xl"
            >
              <SidebarContent 
                isCollapsed={false}
                isRtl={isRtl}
                theme={theme}
                toggleTheme={toggleTheme}
                tenant={tenant}
                user={user}
                logout={logout}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-700 pt-20 lg:pt-0 min-h-screen",
          !isCollapsed ? "lg:pl-64" : "lg:pl-20",
          isRtl && (!isCollapsed ? "lg:pr-64 lg:pl-0" : "lg:pr-20 lg:pl-0"),
        )}
      >
        <main className="p-4 md:p-8 lg:p-12 relative z-0">
          <div className="reveal-effect max-w-[1600px] mx-auto min-h-[calc(100vh-160px)]">
            {children}
          </div>
        </main>
      </div>

      <NeuralChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Neural Chat Toggle */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-[45] w-14 h-14 bg-[color:var(--text)] dark:bg-[color:var(--card)] text-white dark:text-black rounded-[1.5rem] flex items-center justify-center shadow-4xl border-none group overflow-hidden active:scale-95 transition-transform"
      >
        <div className="absolute inset-0 bg-[color:var(--primary-color)] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <MessageCircle size={28} className="relative z-10" />
      </button>
    </div>
  );
};
