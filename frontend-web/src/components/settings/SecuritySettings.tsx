import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Fingerprint, Smartphone, History, Zap, ShieldAlert, KeyRound, Monitor, Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";

const SecurityNode = ({ label, value, icon: Icon, isRtl, actionLabel, onAction }: any) => (
  <div className={cn("flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group", isRtl && "flex-row-reverse")}>
    <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-inner group-hover:scale-110 transition-transform text-indigo-500">
        <Icon size={20} />
      </div>
      <div className={isRtl ? "text-right" : "text-left"}>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{value}</p>
      </div>
    </div>
    {actionLabel && (
      <button onClick={onAction} className="px-4 py-2 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border-none">
        {actionLabel}
      </button>
    )}
  </div>
);

export const SecuritySettings = ({ t, isRtl }: any) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm) {
      return toast.error("Logic Mismatch: Passwords do not align.");
    }
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Re-encrypting Lattice...',
        success: 'Logic Hardened Successfully',
        error: 'Encryption Failure'
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-10"
    >
      {/* 1. STATUS HUD */}
      <div className={cn("p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group border border-white/5 shadow-2xl", isRtl && "text-right")}>
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className={cn("relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8", isRtl && "flex-row-reverse")}>
          <div className="flex items-center gap-6">
            <div className="p-5 bg-indigo-600 rounded-2xl shadow-2xl rotate-3 relative group-hover:rotate-12 transition-transform duration-700">
              <ShieldCheck size={32} color="white" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-40" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Lattice <span className="text-indigo-500 text-4xl">Shield.</span></h3>
              <p className="text-indigo-300 font-bold uppercase text-[8px] tracking-[0.4em] mt-2 opacity-60">Forensic Security Protocol v4.0</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Status: OPTIMAL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 2. AUTHENTICATION MODULE */}
        <div className="space-y-6">
          <div className={cn("flex items-center gap-3 mb-2", isRtl && "flex-row-reverse")}>
            <KeyRound size={18} className="text-indigo-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] italic">Authentication Logic</h4>
          </div>
          
          <div className="p-8 bg-slate-50 dark:bg-slate-950/30 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 shadow-inner">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"}
                  placeholder="CURRENT_PROTOCOL_PHRASE"
                  className={cn("w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-5 text-xs font-mono font-bold tracking-widest text-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm", isRtl && "text-right")}
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
                <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-500 transition-all border-none bg-transparent">
                  {showCurrent ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showNew ? "text" : "password"}
                  placeholder="NEW_SIGNAL_ENCRYPTION"
                  className={cn("w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-5 text-xs font-mono font-bold tracking-widest text-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm", isRtl && "text-right")}
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-500 transition-all border-none bg-transparent">
                  {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              <input 
                type="password"
                placeholder="CONFIRM_SEQUENCE"
                className={cn("w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-5 text-xs font-mono font-bold tracking-widest text-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm", isRtl && "text-right")}
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              />
            </div>
            
            <button 
              onClick={handleUpdatePassword}
              className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 border-none group"
            >
              <Zap size={16} className="group-hover:rotate-12 transition-transform" /> Re-encrypt Sequence
            </button>
          </div>
        </div>

        {/* 3. MULTI-FACTOR & SESSIONS */}
        <div className="space-y-6">
          <div className={cn("flex items-center gap-3 mb-2", isRtl && "flex-row-reverse")}>
            <Smartphone size={18} className="text-indigo-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] italic">Identity Hardening</h4>
          </div>
          
          <div className="space-y-3">
            <SecurityNode label="2FA Protocol" value="DEACTIVATED" icon={Smartphone} isRtl={isRtl} actionLabel="ACTIVATE" onAction={() => toast.success("Node Provisioning Sequence Initiated")} />
            <SecurityNode label="Biometric Access" value="ENABLED" icon={Fingerprint} isRtl={isRtl} actionLabel="MANAGE" />
            
            <div className="pt-6">
              <div className={cn("flex items-center gap-3 mb-4", isRtl && "flex-row-reverse")}>
                <Monitor size={18} className="text-indigo-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Interceptions</h4>
              </div>
              <div className="space-y-2">
                <div className={cn("p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10 flex items-center justify-between", isRtl && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Monitor size={18}/></div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">Chrome on MacOS (This Device)</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Signal from: 192.168.1.1</p>
                    </div>
                  </div>
                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Active_Signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRIVACY REGISTRY */}
      <div className="pt-6 border-t border-slate-100 dark:border-white/5">
        <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-rose-500/5 rounded-[2.5rem] border border-rose-500/10", isRtl && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
            <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl shadow-inner"><ShieldAlert size={24} /></div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <h4 className="text-lg font-black text-rose-600 dark:text-rose-400 uppercase italic tracking-tighter">Node Termination</h4>
              <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest mt-1">Permanently remove agent from lattice</p>
            </div>
          </div>
          <button className="px-8 py-4 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-rose-700 transition-all active:scale-95 border-none">Deauthenticate Permanently</button>
        </div>
      </div>
    </motion.div>
  );
};
