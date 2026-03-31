import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { 
  Mail, Lock, Loader2, LogIn, AlertCircle, LayoutDashboard, ArrowLeft, CheckCircle,
  Sun, Moon, ShieldCheck, Store
} from "lucide-react";
import { useAuth } from "../store/auth.slice";
import { useTenant } from "../store/tenant.slice";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { toast } from "react-hot-toast";

export const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { fetchTenant } = useTenant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const loadId = toast.loading("Authenticating Neural Signature...");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email: email.trim().toLowerCase(), password: password.trim() });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user, data.token);

      // Pre-fetch tenant data if vendor
      if (data.user.role === "VENDOR" || data.user.role === "ADMIN") {
        await fetchTenant();
      }

      toast.success("Authorization Granted.", { id: loadId });
      
      // Smart Redirection: Always go to private area if logged in
      navigate("/dashboard");
      
    } catch (err: any) {
      const msg = err.response?.data?.message || t('errors.unauthorized');
      setError(msg);
      toast.error(msg, { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("min-h-screen flex bg-[rgb(var(--background-rgb))] font-sans transition-colors duration-500 relative", isRtl ? "flex-row-reverse" : "flex-row")}>
      {/* Theme Toggle */}
      <div className={cn("absolute top-6 z-20", isRtl ? "left-6" : "right-6")}>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 dark:text-amber-400 hover:text-indigo-600 transition-all shadow-xl active:scale-95"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Link to="/home" className={cn("inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white mb-8 transition-colors group", isRtl && "flex-row-reverse")}>
            <ArrowLeft size={18} className={cn("transition-transform", isRtl ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1")} />
            <span className="text-sm font-bold uppercase tracking-widest">{t('common.back')}</span>
          </Link>

          <div className={cn("mb-10", isRtl ? "text-right" : "text-left")}>
            <div className={cn("bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl", isRtl && "ml-auto mr-0")}>
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 transition-colors uppercase">
              Terminal <span className="text-indigo-500">Access.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">Secure entry into the commerce cluster.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold">
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className={cn("text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>Operational Email</label>
              <div className="relative">
                <Mail className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-4" : "left-4")} size={18} />
                <input type="email" placeholder="oracle@enterprise.com" className={cn("w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl ? "pr-12 pl-4 text-right" : "pl-12 pr-4")} value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
              </div>
            </div>

            <div className="space-y-2">
              <div className={cn("flex justify-between items-end px-1", isRtl && "flex-row-reverse")}>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Cipher</label>
                <Link to="/forgot-password" size={10} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Recover ?</Link>
              </div>
              <div className="relative">
                <Lock className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-4" : "left-4")} size={18} />
                <input type="password" placeholder="••••••••••••" className={cn("w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl ? "pr-12 pl-4 text-right" : "pl-12 pr-4")} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <> <LogIn size={20} /> <span className="uppercase">Initiate Session</span> </>}
              </button>
            </div>

            <p className={cn("text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4", isRtl && "text-right")}>
              New to the cluster? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline italic font-black">Register Node</Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Side Decorative Section */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-indigo-900">
        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 dark:from-black via-transparent transition-colors duration-500" />
        <div className="relative mt-auto p-16 w-full">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
            <div className={cn("flex items-center gap-4 mb-8", isRtl && "flex-row-reverse")}>
              <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/20"><Store size={28} className="text-white" /></div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter">Vendor Hub</h3>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Multi-Store Orchestration</p>
              </div>
            </div>
            <div className={cn("grid grid-cols-2 gap-8", isRtl && "rtl")}>
              <div><p className="text-slate-300 text-[10px] font-black uppercase mb-2 tracking-widest opacity-60">Registry Health</p><p className="text-white text-3xl font-black italic tracking-tighter">NOMINAL</p></div>
              <div><p className="text-slate-300 text-[10px] font-black uppercase mb-2 tracking-widest opacity-60">Lattice Sync</p><p className="text-white text-3xl font-black italic tracking-tighter">100%</p></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
