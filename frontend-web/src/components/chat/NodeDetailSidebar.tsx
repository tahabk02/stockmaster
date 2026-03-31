import React from "react";
import { motion } from "framer-motion";
import { X, Target, Mail, ExternalLink, Users, Shield, Cpu, Activity, Fingerprint } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ConversationData, UserProfile } from "./ConversationList";

interface NodeDetailSidebarProps {
  activeConversation: ConversationData;
  activeOther: UserProfile | null;
  onClose: () => void;
  onNavigateProfile: (id: string) => void;
  getID: (obj: any) => string | null;
  isRtl: boolean;
}

const BiometricNode = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-black/40 rounded-lg text-indigo-500 group-hover:rotate-12 transition-transform"><Icon size={14} /></div>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     </div>
     <span className="text-[10px] font-black text-white italic">{value || "---"}</span>
  </div>
);

export const NodeDetailSidebar = ({ activeConversation, activeOther, onClose, onNavigateProfile, getID, isRtl }: NodeDetailSidebarProps) => (
  <motion.div 
    initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} 
    className="w-[350px] bg-slate-900/90 backdrop-blur-3xl border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0 absolute lg:relative right-0 top-0 h-full z-[100] shadow-4xl"
  >
     <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
     <div className="scanline opacity-10" />

     <div className={cn("p-8 border-b border-white/5 flex justify-between items-center relative z-10", isRtl && "flex-row-reverse")}>
        <div className="flex items-center gap-3">
           <Fingerprint size={18} className="text-indigo-500" />
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">Agent_DeepScan</h3>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-lg transition-all border-none bg-transparent active:scale-90 shadow-xl"><X size={18}/></button>
     </div>

     <div className="p-10 flex flex-col items-center text-center relative z-10">
        <div className="relative mb-8">
           <div className="w-36 h-36 rounded-[3rem] p-1 bg-gradient-to-tr from-indigo-600 via-indigo-400 to-rose-600 shrink-0 shadow-[0_0_40px_rgba(79,70,229,0.3)]">
              <div className="w-full h-full rounded-[2.8rem] bg-slate-950 p-1 relative overflow-hidden">
                 {activeConversation.isGroup ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900"><Users size={56} color="white" className="opacity-20" /></div>
                 ) : (
                    <img src={activeOther?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getID(activeOther)}`} className="w-full h-full object-cover rounded-[2.6rem]" alt="" />
                 )}
                 <div className="absolute inset-0 border-[10px] border-indigo-500/10 animate-pulse pointer-events-none" />
              </div>
           </div>
           <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-2xl shadow-2xl border-4 border-slate-900"><Shield size={20} className="text-white" /></div>
        </div>

        <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">{activeConversation.isGroup ? activeConversation.name : activeOther?.name}</h4>
        <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-10">AUTH_LEVEL_0{activeOther?.role === 'ADMIN' ? '4' : '2'}</p>
        
        <div className="w-full space-y-8 text-left">
           <div className="space-y-4">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3"><Activity size={12} className="text-indigo-500" /> Biometric Telemetry</p>
              <div className="space-y-2">
                 <BiometricNode label="Logic State" value="PRIME" icon={Shield} />
                 <BiometricNode label="Neural Sync" value="99.4%" icon={Cpu} />
                 <BiometricNode label="Lattice Node" value={getID(activeOther)?.slice(-8).toUpperCase()} icon={Target} />
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3"><Mail size={12} className="text-indigo-500" /> Secure Registry</p>
              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner">
                 <p className="text-[11px] font-bold text-slate-400 italic leading-relaxed">
                    "{activeConversation.isGroup ? activeConversation.description || "Project Squad Unit" : activeOther?.bio || "Node signal active in the current lattice."}"
                 </p>
              </div>
           </div>
           
           {!activeConversation.isGroup && (
             <button onClick={() => onNavigateProfile(getID(activeOther)!)} className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 group border-none">
                Execute Full Scan <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
           )}
        </div>
     </div>

     <footer className="mt-auto p-8 border-t border-white/5 opacity-20">
        <p className="text-[6px] font-black uppercase tracking-[0.5em] text-center">Neural Profile Encryption: AES-256_LOCKED</p>
     </footer>
  </motion.div>
);
