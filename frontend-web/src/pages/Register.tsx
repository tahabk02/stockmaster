import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import {
  User, Mail, Lock, Loader2, UserPlus, AlertCircle, ArrowLeft, CheckCircle2, Briefcase, UserCircle,
  Sun, Moon
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { toast } from "react-hot-toast";

export const Register: React.FC = () => {
  const { t, i18n } = useTranslation(["auth", "common"]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "USER", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const loadId = toast.loading(t("register.registering"));
    setLoading(true);
    try {
      await api.post("/auth/register", { ...formData, email: formData.email.trim().toLowerCase() });
      toast.success(t("register.success"), { id: loadId });
      navigate("/login");
    } catch (err: any) {
      const msg = err.response?.data?.message || t('errors:serverError');
      console.error("Registration failed:", err.response?.data);
      setError(msg);
      toast.error(msg, { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div 
      className={cn("min-h-screen flex transition-colors duration-500 relative", isRtl ? "flex-row-reverse" : "flex-row")}
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className={cn("absolute top-6 z-20", isRtl ? "left-6" : "right-6")}>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-slate-500 dark:text-amber-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div initial={{ opacity: 0, x: isRtl ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link to="/home" className={cn("inline-flex items-center gap-2 text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white mb-8 transition-colors group", isRtl && "flex-row-reverse")}>
            <ArrowLeft size={18} className={cn("transition-transform", isRtl ? "group-hover:translate-x-1 rotate-180" : "group-hover:-translate-x-1")} />
            <span className="text-sm font-bold uppercase tracking-widest">{t('common:back')}</span>
          </Link>

          <div className={cn("mb-10", isRtl ? "text-right" : "text-left")}>
            <div className={cn("bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl", isRtl && "ml-auto mr-0")}>
              <UserPlus className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 transition-colors uppercase">{t("register.title")}<span className="text-indigo-500">.</span></h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium italic">{t("register.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold">
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className={cn("text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>{t("register.accountType")}</label>
              <div className={cn("flex gap-3 p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl", isRtl && "flex-row-reverse")}>
                <button type="button" onClick={() => setFormData({ ...formData, role: "USER" })} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${formData.role === "USER" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400"}`}><UserCircle size={16} /> {t("register.client")}</button>
                <button type="button" onClick={() => setFormData({ ...formData, role: "VENDOR" })} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${formData.role === "VENDOR" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400"}`}><Briefcase size={16} /> {t("register.vendor")}</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className={cn("text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>{t("register.nameLabel")}</label>
              <input type="text" placeholder={t("register.namePlaceholder")} className={cn("w-full p-4 pro-input outline-none", isRtl && "text-right")} value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <label className={cn("text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>{t("register.emailLabel")}</label>
              <input type="email" placeholder={t("register.emailPlaceholder")} className={cn("w-full p-4 pro-input outline-none", isRtl && "text-right")} value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} required />
            </div>

            <div className="space-y-2">
              <label className={cn("text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>{t("login.signalFrequency")}</label>
              <input type="tel" placeholder="+212 600 000 000" className={cn("w-full p-4 pro-input outline-none", isRtl && "text-right")} value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className={cn("text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>{t("register.passwordLabel")}</label>
              <input type="password" placeholder={t("register.passwordPlaceholder")} className={cn("w-full p-4 pro-input outline-none", isRtl && "text-right")} value={formData.password} onChange={(e)=>setFormData({...formData, password: e.target.value})} required />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-md active:scale-95 disabled:opacity-50 border-none">
                {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : t("register.submit")}
              </button>
            </div>

            <p className={cn("text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-4", isRtl && "text-right")}>
              {t("register.haveAccount")} <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">{t("register.loginLink")}</Link>
            </p>
          </form>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-indigo-900">
        <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 dark:from-black via-transparent transition-colors duration-500" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative mt-auto p-16 w-full">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-white text-3xl font-black tracking-tighter mb-8 uppercase italic">{t("common:system_name")} SCM</h3>
            <div className="space-y-6">
              {[ t("login.multiStore"), t("nav:ai"), t("nav:scanner") ].map((text, i) => (
                <div key={i} className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                  <div className="bg-indigo-500 p-1.5 rounded-lg"><CheckCircle2 className="text-white" size={18} /></div>
                  <p className="text-white font-bold">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
