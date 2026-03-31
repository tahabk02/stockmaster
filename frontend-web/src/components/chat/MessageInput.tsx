import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Mic, Send, StopCircle, X, Terminal, Activity, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import type { MessageData } from "./ConversationList";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (s: string) => void;
  onSendMessage: () => void;
  onFileSelect: () => void;
  isRecording: boolean;
  recordingDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  replyingTo: MessageData | null;
  setReplyingTo: (m: MessageData | null) => void;
  isRtl: boolean;
}

const LatticeFluxHUD = () => {
  const [freq, setFreq] = useState(2400.00);
  useEffect(() => {
    const interval = setInterval(() => {
      setFreq(2400 + Math.random() * 5);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 opacity-40">
       <Activity size={10} className="text-indigo-500 animate-pulse" />
       <span className="text-[7px] font-mono text-white tracking-widest">{freq.toFixed(2)} MHz</span>
    </div>
  );
};

export const MessageInput = (props: MessageInputProps) => {
  const { 
    newMessage, setNewMessage, onSendMessage, onFileSelect, 
    isRecording, recordingDuration, onStartRecording, onStopRecording, 
    onCancelRecording, replyingTo, setReplyingTo, isRtl 
  } = props;

  return (
    <div className="p-6 md:p-8 bg-slate-900/80 dark:bg-[#111b21]/90 backdrop-blur-3xl border-t border-white/5 z-20 relative">
       <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
       
       {replyingTo && (
         <div className="absolute bottom-full left-0 right-0 p-4 bg-indigo-600/10 backdrop-blur-3xl border-t border-indigo-500/20 flex justify-between items-center animate-reveal">
            <div className="flex items-center gap-3">
               <div className="w-1 h-8 bg-indigo-600 rounded-full shadow-[0_0_10px_#6366f1]" />
               <div><p className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">Interception Reply</p><p className="text-xs font-bold text-white truncate max-w-[300px] italic">"{replyingTo.content}"</p></div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-2 text-slate-500 hover:text-rose-500 transition-all border-none bg-transparent active:scale-90"><X size={16}/></button>
         </div>
       )}
       
       <AnimatePresence>
          {isRecording && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute inset-0 z-30 bg-indigo-600 flex items-center justify-between px-10 rounded-t-[2rem]">
               <div className="flex items-center gap-6">
                  <div className="relative">
                     <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                     <div className="absolute inset-0 w-4 h-4 bg-white rounded-full" />
                  </div>
                  <span className="text-2xl font-black text-white italic tracking-tighter uppercase">Signal Interception: {recordingDuration}s</span>
               </div>
               <div className="flex gap-4">
                  <button onClick={onCancelRecording} className="px-6 py-3 bg-white/10 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all border-none">Abort</button>
                  <button onClick={onStopRecording} className="p-5 bg-white text-indigo-600 rounded-2xl shadow-2xl active:scale-90 hover:scale-105 transition-all border-none"><StopCircle size={24}/></button>
               </div>
            </motion.div>
          )}
       </AnimatePresence>

       <div className={cn("flex items-center gap-5 relative z-10", isRtl && "flex-row-reverse")}>
          <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
             <button onClick={onFileSelect} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-indigo-400 transition-all border-none bg-transparent active:scale-90 hover:bg-white/10"><Paperclip size={22}/></button>
             <button onClick={onStartRecording} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-rose-500 transition-all border-none bg-transparent active:scale-90 hover:bg-white/10"><Mic size={22}/></button>
          </div>
          
          <div className="flex-1 relative group/input">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/40 group-focus-within/input:text-indigo-500 transition-colors">
                <Terminal size={16} />
             </div>
             <input 
               value={newMessage} 
               onChange={e => setNewMessage(e.target.value)} 
               onKeyDown={e => e.key === 'Enter' && onSendMessage()} 
               placeholder="INITIALIZE_SIGNAL_SEQUENCE..." 
               className={cn(
                 "w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-24 py-5 text-sm font-mono font-bold uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner placeholder:text-slate-800",
                 isRtl && "text-right pr-12 pl-24"
               )} 
             />
             <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center gap-4", isRtl ? "left-4" : "right-4")}>
                <LatticeFluxHUD />
             </div>
          </div>

          <button 
            onClick={onSendMessage} 
            className="p-5 bg-indigo-600 text-white rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all border-none group overflow-hidden relative"
          >
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
             <Send size={24} fill="currentColor" className={cn("relative z-10 transition-transform", isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
          </button>
       </div>
    </div>
  );
};
