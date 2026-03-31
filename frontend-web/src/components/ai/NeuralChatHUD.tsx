import React from "react";
import { motion } from "framer-motion";
import { Radio, X, Mic, Send } from "lucide-react";
import { cn } from "../../lib/utils";

interface NeuralChatHUDProps {
  messages: any[];
  chatInput: string;
  setChatInput: (val: string) => void;
  handleChat: () => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  onPurge: () => void;
  isRtl: boolean;
  isThinking?: boolean;
}

export const NeuralChatHUD = ({ 
  messages, chatInput, setChatInput, handleChat, 
  isListening, setIsListening, onPurge, isRtl, isThinking 
}: NeuralChatHUDProps) => (
  <div className="bg-slate-950 rounded-[2.2rem] p-6 md:p-8 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col h-[450px] md:h-[500px]">
     <div className="absolute inset-0 bg-indigo-600/[0.03] pointer-events-none" />
     <div className={cn("flex items-center justify-between mb-6 relative z-10 border-b border-white/5 pb-4", isRtl && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse border border-white/10 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Radio size={16} className="text-white" />
           </div>
           <div className={isRtl ? "text-right" : "text-left"}>
              <h2 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest leading-none italic">Neural Deck</h2>
              <p className="text-[6px] md:text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1.5">Active: QUANTUM-OS</p>
           </div>
        </div>
        <button onClick={onPurge} className="p-2 bg-white/5 hover:bg-rose-500 text-slate-500 hover:text-white rounded-lg transition-all border-none bg-transparent shadow-lg active:scale-90"><X size={14}/></button>
     </div>

     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 md:space-y-6 mb-6 relative z-10 px-1 pr-3">
        {messages.map((msg, i) => (
          <motion.div initial={{ opacity: 0, x: msg.role === 'ai' ? -15 : 15 }} animate={{ opacity: 1, x: 0 }} key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
             <div className={cn(
               "max-w-[85%] p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] text-[10px] md:text-[11px] font-medium leading-relaxed shadow-2xl relative group",
               msg.role === 'ai' ? 'bg-white/5 text-indigo-200 border border-white/5 rounded-tl-sm' : 'bg-indigo-600 text-white rounded-tr-sm border border-indigo-400/30'
             )}>
                {msg.text}
                <div className={cn("mt-3 flex items-center justify-between opacity-30 text-[6px] font-black uppercase tracking-widest", isRtl && "flex-row-reverse")}>
                   <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   <span>{msg.role === 'ai' ? 'NODE_OS' : 'AGENT_DECK'}</span>
                </div>
             </div>
          </motion.div>
        ))}
        {isThinking && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-2xl flex gap-1.5">
                 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>
           </motion.div>
        )}
     </div>

     <div className="relative z-10 mt-auto">
        <div className={cn("flex gap-2 p-1.5 bg-white/5 rounded-[1.5rem] border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-inner backdrop-blur-xl", isRtl && "flex-row-reverse")}>
           <button 
             onClick={() => {
               const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
               recognition.lang = 'fr-FR';
               recognition.onstart = () => setIsListening(true);
               recognition.onresult = (e: any) => { setChatInput(e.results[0][0].transcript); setIsListening(false); };
               recognition.onerror = () => setIsListening(false);
               recognition.start();
             }}
             className={cn("p-3.5 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-xl border-none bg-transparent", isListening ? "bg-rose-600 text-white animate-pulse" : "bg-white/5 text-slate-400 hover:text-white")}
           >
              <Mic size={16} />
           </button>
           <input type="text" placeholder="TRANSMIT..." className={cn("flex-1 bg-transparent border-none outline-none text-[9px] md:text-[10px] font-black text-white placeholder:text-slate-800 px-2 md:px-3 uppercase tracking-widest", isRtl && "text-right")} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} />
           <button onClick={handleChat} className="p-3.5 md:p-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl hover:bg-slate-900 transition-all shadow-2xl active:scale-95 group border-none"><Send size={16} className={cn("transition-transform", isRtl ? "rotate-180 group-hover:-translate-x-1 group-hover:-translate-y-1" : "group-hover:translate-x-1 group-hover:-translate-y-1")} /></button>
        </div>
     </div>
  </div>
);
