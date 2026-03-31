import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, MessageSquare, UserPlus, Globe, Zap, Store, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import api from "../../api/client";
import { useAuth } from "../../store/auth.slice";
import { toast } from "react-hot-toast";

interface NodeCardProps {
  user: any;
  isVisible: boolean;
  onClose: () => void;
}

export const NodeCard = ({ user, isVisible, onClose }: NodeCardProps) => {
  const navigate = useNavigate();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const isFollowing = currentUser?.following?.includes(user._id);
  const isMe = currentUser?._id === user._id;

  const handleFollow = async () => {
    if (isMe) return;
    setLoading(true);
    try {
      const res = await api.post(`/community/user/${user._id}/follow`);
      const coupled = res.data.coupled;
      
      // Update local auth state
      const updatedFollowing = coupled 
        ? [...(currentUser.following || []), user._id]
        : (currentUser.following || []).filter((id: string) => id !== user._id);
      
      setCurrentUser({ ...currentUser, following: updatedFollowing });
      toast.success(coupled ? "Node Coupled" : "Node Decoupled");
    } catch (e) {
      toast.error("Frequency Interference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute z-[200] w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-3xl overflow-hidden pointer-events-auto"
          onMouseLeave={onClose}
        >
          {/* Cover Pulse */}
          <div className="h-24 bg-indigo-600 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700" />
             <div className="absolute top-0 right-0 p-4 opacity-20"><Zap size={60} /></div>
          </div>

          <div className="px-8 pb-8 -mt-12 relative z-10">
             <div className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-900 overflow-hidden shadow-2xl bg-indigo-600 mb-4">
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`} className="w-full h-full object-cover" />
             </div>

             <div className="space-y-1 mb-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <h4 className="font-black text-xl text-slate-950 dark:text-white uppercase italic tracking-tighter truncate">{user.name}</h4>
                      <ShieldCheck size={16} className="text-indigo-500" />
                   </div>
                   {!isMe && (
                     <button 
                       disabled={loading}
                       onClick={handleFollow}
                       className={cn(
                         "p-2 rounded-xl transition-all active:scale-90",
                         isFollowing ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                       )}
                     >
                        {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                     </button>
                   )}
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">{user.role} • Node Identity</p>
             </div>

             <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic mb-8 line-clamp-2">
                "{user.bio || "Operational frequency active. Awaiting synchronization."}"
             </p>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                   <p className="text-lg font-black italic text-slate-950 dark:text-white">{user.followers?.length || 0}</p>
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Network</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                   <p className="text-lg font-black italic text-slate-950 dark:text-white">{user.role === 'VENDOR' ? 'STORE' : 'NODE'}</p>
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                </div>
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
                >
                   Registry
                </button>
                {user.role === 'VENDOR' && (
                  <button 
                    onClick={() => navigate(`/community/store/${user.tenantId}`)}
                    className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Store size={14} /> Store
                  </button>
                )}
                <button className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                   <MessageSquare size={18} />
                </button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

