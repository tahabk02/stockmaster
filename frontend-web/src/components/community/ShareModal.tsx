import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Copy, Check, Users, Send, Link, 
  Twitter, Facebook, Linkedin, Mail 
} from "lucide-react";
import api from "../../api/client";
import { toast } from "react-hot-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

export const ShareModal = ({ isOpen, onClose, post }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [squads, setSquads] = useState<any[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get("/chat/conversations").then(res => {
        // Filter for groups or active chats
        setSquads(res.data.filter((c: any) => c.isGroup || c.lastMessage));
      });
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Coordinates Copied");
  };

  const handleForward = async () => {
    if (!selectedSquad) return;
    setSending(true);
    try {
      await api.post("/chat/messages", {
        conversationId: selectedSquad,
        content: `Forwarded Signal: ${post.content.substring(0, 50)}...`,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType === "VIDEO" || post.postType === "REEL" ? "VIDEO" : "IMAGE"
      });
      toast.success("Signal Relayed to Squad");
      onClose();
    } catch (e) {
      toast.error("Relay Failed");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-3xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Broadcast <span className="text-indigo-600">Signal.</span></h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Quick Copy Link */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-300 truncate border border-slate-100 dark:border-white/5">
                {`${window.location.origin}/post/${post._id}`}
              </div>
              <button onClick={handleCopy} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 transition-all active:scale-95">
                {copied ? <Check size={18}/> : <Copy size={18}/>}
              </button>
            </div>
          </div>

          {/* Internal Forwarding */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relay to Squad</label>
            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {squads.map(squad => (
                <div 
                  key={squad._id} 
                  onClick={() => setSelectedSquad(squad._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selectedSquad === squad._id ? 'bg-indigo-600/10 border-indigo-600' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:border-indigo-500/30'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                    {squad.isGroup ? <Users size={14}/> : (squad.name || "U").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black uppercase italic truncate ${selectedSquad === squad._id ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>
                      {squad.name || squad.otherParticipant?.name || "Unknown Unit"}
                    </p>
                  </div>
                  {selectedSquad === squad._id && <Check size={14} className="text-indigo-600"/>}
                </div>
              ))}
            </div>
            <button 
              disabled={!selectedSquad || sending}
              onClick={handleForward}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? "Relaying..." : <><Send size={14}/> Confirm Relay</>}
            </button>
          </div>

          {/* External Socials */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
             <SocialBtn icon={<Twitter size={18}/>} label="X-Net" />
             <SocialBtn icon={<Facebook size={18}/>} label="Meta" />
             <SocialBtn icon={<Linkedin size={18}/>} label="Pro" />
             <SocialBtn icon={<Mail size={18}/>} label="Mail" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SocialBtn = ({ icon, label }: any) => (
  <button className="flex flex-col items-center gap-2 group">
    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
      {icon}
    </div>
    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
  </button>
);
