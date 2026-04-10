import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, Send, X, Paperclip, Radio, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../store/auth.slice";
import api from "../../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const NeuralChat = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) fetchMessages();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/chat/global");
      setMessages(data.data || []);
    } catch (e) {
      toast.error("Signal Drop: Communication Interrupted");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent, file?: string) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !file) return;

    try {
      const msg = {
        content: newMessage,
        mediaUrl: file,
        mediaType: file ? "IMAGE" : "TEXT",
        sender: user,
        createdAt: new Date().toISOString()
      };
      setMessages([...messages, msg]);
      setNewMessage("");
      await api.post("/chat/global", { content: newMessage, file, type: file ? "IMAGE" : "TEXT" });
    } catch (e) {
      toast.error("Signal Transmission Failure");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await toBase64(e.target.files[0]);
      handleSend(null as any, base64);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: "100%" }} 
          animate={{ x: 0 }} 
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-slate-900/90 backdrop-blur-2xl z-[80] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          
          <header className="p-6 md:p-8 bg-white/5 border-b border-white/10 flex justify-between items-center relative z-10">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 rotate-3">
                   <Radio size={24} className="text-white animate-pulse" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Neural <span className="text-indigo-500 text-2xl">Chat.</span></h2>
                   <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Active Protocol: ZENITH-SIGNAL</p>
                </div>
             </div>
             <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg border-none bg-transparent">
                <X size={20} />
             </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                   <Terminal size={40} className="text-indigo-500 animate-pulse mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Stream...</p>
                </div>
             ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                   <MessageCircle size={80} strokeWidth={1} />
                   <p className="text-xs font-black uppercase tracking-[0.3em] mt-6">Void registry</p>
                </div>
             ) : messages.map((msg, i) => {
                const isMe = (msg.sender?._id || msg.sender?.id) === (user?.id || user?._id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                  >
                     <div className={cn(
                        "max-w-[85%] p-4 rounded-3xl text-sm font-medium relative group shadow-xl",
                        isMe 
                          ? "bg-indigo-600 text-white rounded-tr-sm border border-indigo-400/30" 
                          : "bg-white/10 text-slate-200 backdrop-blur-md rounded-tl-sm border border-white/10"
                      )}>
                         {msg.mediaUrl && (
                           <div className="mb-3 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                              <img src={msg.mediaUrl} className="max-w-full h-auto object-cover" alt="Signal Media" />
                           </div>
                         )}
                         {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                         <span className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-3 block">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2 ml-1 mr-1">{msg.sender?.name}</span>
                  </motion.div>
                );
             })}
          </div>

          <footer className="p-6 md:p-8 bg-white/5 border-t border-white/10 relative z-10">
             <form onSubmit={handleSend} className="relative flex items-center gap-3">
                <div className="flex-1 relative group">
                   <input 
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                     placeholder="TRANSMIT SIGNAL..." 
                     className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 rounded-2xl py-4 pl-6 pr-12 text-[11px] font-black uppercase tracking-widest text-white outline-none transition-all shadow-inner"
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <label htmlFor="chat-file" className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer">
                         <Paperclip size={16} />
                      </label>
                      <input id="chat-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                   </div>
                </div>
                <button type="submit" className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all border-none">
                   <Send size={20} />
                </button>
             </form>
             <div className="mt-6 flex items-center justify-center gap-6 opacity-30">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[7px] font-black text-white uppercase">Encrypted</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /><span className="text-[7px] font-black text-white uppercase">P2P Node</span></div>
             </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuralChat;
