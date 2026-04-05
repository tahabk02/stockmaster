import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Send, Sparkles, Activity, ShieldCheck, 
  Cpu, Zap, BrainCircuit, Terminal, RefreshCw, 
  ChevronRight, Box, TrendingUp, AlertTriangle 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import api from "../api/client";
import { toast } from "react-hot-toast";

export const AIIntelligence = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([
    { role: "bot", content: "Neural Link established. Standby for query execution...", timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("STABLE");
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: "user", content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);
    setStatus("PROCESSING");

    try {
      const res = await api.post("/ai/chat", { query });
      const botMsg = { role: "bot", content: res.data.data.response, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setStatus("STABLE");
    } catch (error) {
      toast.error("Neural Signal Interrupted");
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. NEURAL CORE HUD */}
      <header className="theme-card p-10 relative overflow-hidden accent-sky">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
              <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 rotate-3 transition-transform hover:rotate-0 text-white">
                <BrainCircuit size={32} className="text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900 dark:text-white">
                  Neural <span className="text-indigo-600">Core.</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-3 italic leading-none">Cognitive_Intelligence_v9.4</p>
              </div>
            </div>
          </div>

          <div className={cn("flex gap-4", isRtl && "flex-row-reverse")}>
            <StatNode label="Status" val={status} color={status === 'ERROR' ? 'rose' : status === 'PROCESSING' ? 'amber' : 'emerald'} pulse />
            <StatNode label="Model" val="Gemini 1.5 Pro" color="sky" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* 2. NEURAL INTERFACE (CHAT) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="theme-card h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
            
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex justify-between items-center relative z-10">
               <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure_Command_Terminal</span>
               </div>
               <ShieldCheck size={16} className="text-emerald-500" />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0", 
                      msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-white/10 text-indigo-600")}>
                      {msg.role === 'user' ? <Cpu size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={cn("max-w-[80%] p-5 rounded-2xl border transition-all", 
                      msg.role === 'user' 
                        ? "bg-indigo-600 text-white border-transparent" 
                        : "theme-card bg-white dark:bg-white/5 border-slate-100 dark:border-white/10")}>
                      <p className="text-sm font-medium leading-relaxed font-sans">{msg.content}</p>
                      <p className={cn("text-[8px] font-black uppercase mt-3 opacity-40 italic", msg.role === 'user' ? "text-white" : "text-slate-500")}>
                        {new Date(msg.timestamp).toLocaleTimeString()} // ID: {Math.random().toString(36).substr(7).toUpperCase()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center animate-pulse">
                    <Bot size={18} className="text-indigo-600" />
                  </div>
                  <div className="theme-card p-5 rounded-2xl bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 flex items-center gap-3">
                    <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 relative z-10">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="TRANSMIT_NEURAL_QUERY..." 
                  className="pro-input w-full pr-16 bg-white dark:bg-black/20"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all border-none">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. SIDEBAR INSIGHTS */}
        <div className="xl:col-span-4 space-y-8">
           <InsightCard 
              title="Supply Chain Node" 
              icon={TrendingUp} 
              color="emerald" 
              desc="Neural forecasting suggests +14% velocity in current logistics lattice." 
           />
           <InsightCard 
              title="Inventory Risk" 
              icon={AlertTriangle} 
              color="rose" 
              desc="3 Nodes detected at critical threshold. Immediate replenishment required." 
           />
           <div className="theme-card p-8 bg-indigo-600 text-white relative overflow-hidden group">
              <Zap size={140} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 relative z-10">Logic Forge</h3>
              <p className="text-[10px] font-bold opacity-80 leading-relaxed italic relative z-10 mb-6">Execute complex inventory simulations and risk assessments via terminal commands.</p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all active:scale-95 border-none shadow-xl">
                 Open Simulations ↗
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatNode = ({ label, val, color, pulse }: any) => (
  <div className="theme-card p-4 px-6 bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 flex items-center gap-4">
    <div className={cn("w-2 h-2 rounded-full", `bg-${color}-500`, pulse && "animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]")} />
    <div>
      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
      <p className={cn("text-xs font-black uppercase italic tracking-tighter", `text-${color}-600 dark:text-${color}-400`)}>{val}</p>
    </div>
  </div>
);

const InsightCard = ({ title, icon: Icon, color, desc }: any) => (
  <div className="theme-card p-6 border-l-4" style={{ borderLeftColor: color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#0ea5e9' }}>
    <div className="flex items-center gap-3 mb-4">
      <div className={cn("p-2 rounded-lg", `bg-${color}-500/10 text-${color}-600`)}>
        <Icon size={18} />
      </div>
      <h4 className="text-[11px] font-black uppercase italic tracking-widest text-slate-900 dark:text-white">{title}</h4>
    </div>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{desc}</p>
  </div>
);
