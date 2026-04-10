import React, { useState } from "react";
import { Mail, ArrowLeft, Loader2, Send, ShieldCheck, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("min-h-screen bg-slate-50 dark:bg-[color:var(--bg)] flex items-center justify-center p-4 relative font-sans", isRtl ? "rtl" : "ltr")}>
      <div className={cn("absolute top-6 z-20", isRtl ? "left-6" : "right-6")}>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-amber-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-200/60 dark:border-slate-800 relative z-10"
      >
        <Link to="/login" className={cn("inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors mb-8 group", isRtl && "flex-row-reverse")}>
          <ArrowLeft size={14} className={cn("transition-transform", isRtl ? "rotate-180 group-hover:translate-x-1" : "group-hover:-translate-x-1")} /> {t('common.back')}
        </Link>

        {!submitted ? (
          <>
            <div className={cn("mb-10", isRtl ? "text-right" : "text-left")}>
              <div className={cn("w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-6 rotate-3", isRtl && "ml-auto mr-0")}>
                <Mail size={32} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-4">Reset <span className="text-indigo-600 text-4xl">Access.</span></h1>
              <p className="text-slate-600 dark:text-slate-500 font-bold text-sm leading-relaxed uppercase tracking-tight">Saisissez votre email pour recevoir les instructions de récupération.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className={cn("text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>Adresse Email</label>
                <div className="relative group">
                  <Mail className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors", isRtl ? "right-4" : "left-4")} size={18} />
                  <input 
                    required
                    type="email" 
                    placeholder="john@example.com"
                    className={cn("w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl py-4 pr-4 font-bold text-sm outline-none transition-all shadow-inner text-slate-900 dark:text-white", isRtl ? "pr-12 pl-4 text-right" : "pl-12")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 border-none"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Envoyer les instructions <Send size={16} className={isRtl ? "rotate-180" : ""}/></>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-4">Email Envoyé !</h2>
            <p className="text-slate-600 dark:text-slate-500 font-bold text-sm uppercase leading-relaxed tracking-tight mb-10 px-4">
              Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien de réinitialisation d'ici quelques instants.
            </p>
            <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-lg">
              {t('common.close')}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};
