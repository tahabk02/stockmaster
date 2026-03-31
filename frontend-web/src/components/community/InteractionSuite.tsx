import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, Bookmark, 
  Send, Link, Copy, Check, Users, Globe,
  MoreHorizontal, Zap, ShieldCheck
} from "lucide-react";
import { cn } from "../../lib/utils";
import api from "../../api/client";
import { toast } from "react-hot-toast";

const REACTION_FREQUENCIES = [
  { id: "LIKE", label: "Pulse", emoji: "👍", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "LOVE", label: "Resonance", emoji: "❤️", color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "HAHA", label: "Signal", emoji: "😂", color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "WOW", label: "Flux", emoji: "😮", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { id: "SAD", label: "Latency", emoji: "😢", color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "ANGRY", label: "Conflict", emoji: "😡", color: "text-orange-500", bg: "bg-orange-500/10" }
];

interface InteractionSuiteProps {
  post: any;
  onUpdate: (updatedPost: any) => void;
  onDiscussion: () => void;
  onShare: () => void;
}

export const InteractionSuite = ({ post, onUpdate, onDiscussion, onShare }: InteractionSuiteProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isVaulting, setIsVaulting] = useState(false);

  const handleReaction = async (type: string) => {
    try {
      const res = await api.post(`/community/${post._id}/like`, { type });
      onUpdate({ 
        ...post, 
        isLiked: res.data.liked, 
        likesCount: res.data.likesCount,
        reactionType: res.data.reactionType,
        reactionSummary: res.data.reactionSummary
      });
      setShowReactions(false);
      if (res.data.liked) toast.success(`${type} Signal Coupled`, { icon: REACTION_FREQUENCIES.find(r => r.id === type)?.emoji });
    } catch (e) { toast.error("Coupling Failure"); }
  };

  const handleVault = async () => {
    setIsVaulting(true);
    try {
      const res = await api.post(`/community/${post._id}/save`);
      onUpdate({ ...post, isSaved: res.data.saved });
      toast.success(res.data.saved ? "Node Vaulted" : "Node Released", { 
        icon: res.data.saved ? "🔐" : "🔓",
        style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
    } catch (e) { toast.error("Vault Access Denied"); }
    finally { setIsVaulting(false); }
  };

  const currentFreq = REACTION_FREQUENCIES.find(r => r.id === post.reactionType) || REACTION_FREQUENCIES[0];

  return (
    <div className="space-y-6">
      {/* 1. Resonance Indicators */}
      <div className="flex justify-between items-center px-2">
         <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
               {(post.reactionSummary || []).slice(0, 3).map((r: any, i: number) => (
                 <div key={i} className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] shadow-lg z-[5]">
                    {REACTION_FREQUENCIES.find(rf => rf.id === r.type)?.emoji || "👍"}
                 </div>
               ))}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {post.likesCount > 0 ? `${post.likesCount} Operational Signals` : "Zero Resonance"}
            </span>
         </div>
         <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <button onClick={onDiscussion} className="hover:text-indigo-500 transition-colors flex items-center gap-2">
               <MessageCircle size={14}/> {post.commentsCount} Exchange
            </button>
            <button onClick={onShare} className="hover:text-indigo-500 transition-colors flex items-center gap-2">
               <Share2 size={14}/> {post.sharesCount} Relay
            </button>
         </div>
      </div>

      {/* 2. Interaction HUD */}
      <div className="grid grid-cols-4 gap-3">
         <div className="relative" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
            <button 
              onClick={() => handleReaction(post.reactionType || "LIKE")}
              className={cn(
                "w-full flex flex-col items-center gap-2 p-4 rounded-[1.8rem] transition-all duration-500 group relative overflow-hidden",
                post.isLiked ? cn(currentFreq.bg, currentFreq.color) : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              )}
            >
               {post.isLiked ? <Zap size={20} className="animate-pulse" /> : <Heart size={20} className="group-hover:scale-110 transition-transform" />}
               <span className="text-[7px] font-black uppercase tracking-[0.2em]">{post.isLiked ? currentFreq.label : "Pulse"}</span>
               
               {post.isLiked && <motion.div layoutId="activePulse" className="absolute inset-0 border-2 border-current rounded-[1.8rem] opacity-20" />}
            </button>

            <AnimatePresence>
               {showReactions && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10, scale: 0.8 }} 
                   animate={{ opacity: 1, y: 0, scale: 1 }} 
                   exit={{ opacity: 0, y: 10, scale: 0.8 }}
                   className="absolute bottom-full left-0 mb-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex gap-2 z-[60]"
                 >
                    {REACTION_FREQUENCIES.map(freq => (
                      <button 
                        key={freq.id} 
                        onClick={() => handleReaction(freq.id)}
                        className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all hover:scale-125 hover:-translate-y-2 group relative"
                      >
                         <span className="text-2xl">{freq.emoji}</span>
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[7px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
                            {freq.label}
                         </div>
                      </button>
                    ))}
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         <HUDButton icon={<MessageCircle size={20}/>} label="Exchange" onClick={onDiscussion} />
         <HUDButton icon={<Share2 size={20}/>} label="Relay" onClick={onShare} />
         <HUDButton 
           icon={<Bookmark size={20} fill={post.isSaved ? "currentColor" : "none"} />} 
           label={post.isSaved ? "Vaulted" : "Vault"} 
           onClick={handleVault}
           active={post.isSaved}
           loading={isVaulting}
           color="indigo"
         />
      </div>
    </div>
  );
};

const HUDButton = ({ icon, label, onClick, active, color = "indigo", loading }: any) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-[1.8rem] w-full transition-all duration-300 active:scale-90 group",
      active 
        ? `bg-${color}-50 dark:bg-${color}-500/10 text-${color}-600 border border-${color}-500/20 shadow-lg shadow-${color}-500/10` 
        : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent"
    )}
  >
    {loading ? <Zap size={20} className="animate-spin" /> : icon}
    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);
