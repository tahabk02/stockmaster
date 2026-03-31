import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Mismatch");
    }
    if (newPassword.length < 6) {
      return toast.error("Minimum 6 characters");
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("min-h-screen bg-[rgb(var(--background-rgb))] flex items-center justify-center p-4 font-sans", isRtl ? "rtl" : "ltr")}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10"
      >
        {!success ? (
          <>
            <div className={cn("mb-10", isRtl ? "text-right" : "text-left")}>
              <div className={cn("w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-6 -rotate-3", isRtl && "ml-auto mr-0")}>
                <Lock size={32} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-4">Secure <span className="text-emerald-500 text-4xl">Reset.</span></h1>
              <p className="text-slate-500 font-bold text-sm leading-relaxed uppercase tracking-tight">Choisissez un nouveau mot de passe fort pour protéger votre accès.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={cn("text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>{t('team.table.password') || 'New Password'}</label>
                  <div className="relative group">
                    <Lock className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors", isRtl ? "right-4" : "left-4")} size={18} />
                    <input 
                      required
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className={cn("w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl py-4 pr-12 font-bold text-sm outline-none transition-all shadow-inner text-slate-900 dark:text-white", isRtl ? "pr-12 pl-12 text-right" : "pl-12")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors", isRtl ? "left-4" : "right-4")}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={cn("text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block", isRtl && "text-right mr-1")}>{t('common.confirm')} {t('team.table.password')}</label>
                  <div className="relative">
                    <Lock className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-4" : "left-4")} size={18} />
                    <input 
                      required
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className={cn("w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl py-4 pr-4 font-bold text-sm outline-none transition-all shadow-inner text-slate-900 dark:text-white", isRtl ? "pr-12 pl-4 text-right" : "pl-12")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>{t('common.update')} <ArrowRight size={16} className={isRtl ? "rotate-180" : ""}/></>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-4">Accès Rétabli !</h2>
            <p className="text-slate-500 font-bold text-sm uppercase leading-relaxed tracking-tight mb-10 px-4">
              Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Link to="/login" className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-950 transition-all shadow-lg block text-center">
              {t('nav.auth') || 'Login'}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};
