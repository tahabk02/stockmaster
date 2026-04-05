import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Send,
  MessageSquare,
  Scale,
  AlertTriangle,
  Zap,
  Cpu,
  Landmark,
  Shield,
  Gavel,
  User,
  Briefcase,
  RefreshCcw,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";

interface Message {
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  isProtocol?: boolean;
}

const Typewriter = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 15); // Fast typing speed
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayText}</span>;
};

const FormattedBotResponse = ({ content }: { content: string }) => {
  // Check if it's a StockMaster Protocol message
  const isProtocol =
    content.includes("// STOCKMASTER LEGAL PROTOCOL //") ||
    content.includes("// STOCKMASTER GLOBAL DIRECTIVE //");

  if (!isProtocol) {
    return <Typewriter text={content} />;
  }

  // Split content for protocol formatting
  const lines = content.split("\n");

  return (
    <div className="font-mono text-xs md:text-sm leading-relaxed space-y-2">
      {lines.map((line, i) => {
        if (line.includes("// STOCKMASTER") || line.includes(">> SUBJECT")) {
          return (
            <div
              key={i}
              className="text-amber-500 font-black uppercase tracking-widest border-b border-amber-500/20 pb-1 mb-2"
            >
              {line}
            </div>
          );
        }
        if (line.includes("[SYSTEM ADVICE]") || line.includes("[SYSTEM]")) {
          return (
            <div
              key={i}
              className="text-emerald-500 font-bold italic mt-4 bg-emerald-500/10 p-2 rounded border-l-2 border-emerald-500"
            >
              {line}
            </div>
          );
        }
        if (line.trim().startsWith("-") || line.trim().startsWith("1.")) {
          return (
            <div
              key={i}
              className="pl-4 text-slate-700 dark:text-slate-300 font-semibold"
            >
              {line}
            </div>
          );
        }
        return (
          <div key={i} className={cn(line === "" ? "h-2" : "")}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

const initialBotMessage: Message = {
  role: "bot",
  content:
    "AS-SALAMU ALAYKUM. Ana StockMaster Legal Overlord, l'assistant IA dyalk f-L-meghrib. S'oul liya ay su2al 3la TVA, IS, CNSS, facture, SARL, cash, ou création d'entreprise.",
  timestamp: new Date(),
  isProtocol: false,
};

const LegalConsultant = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [legalHealth, setLegalHealth] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRtl = i18n.language === "ar";

  const handleClearChat = () => {
    setMessages([initialBotMessage]);
    setQuery("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  useEffect(() => {
    fetchLegalHealth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [query]);

  const fetchLegalHealth = async () => {
    try {
      const res = await api.get("/legal/health");
      setLegalHealth(res.data);
    } catch (e) {
      console.error("Legal Health Node Offline");
      // Fallback mock data if backend fails
      setLegalHealth({
        score: 85,
        status: "SECURE",
        alerts: [],
      });
    }
  };

  const handleAsk = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery || query;
    if (!finalQuery.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: finalQuery,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    if (textareaRef.current) textareaRef.current.style.height = "auto"; // Reset height
    setLoading(true);

    try {
      const res = await api.post("/legal/ask", { query: finalQuery });
      const botMsg: Message = {
        role: "bot",
        content: res.data.response,
        timestamp: new Date(),
        isProtocol: res.data.response.includes("// STOCKMASTER"),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      toast.error("Neural Link Failure");
      // Fallback UI error message
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "CRITICAL ERROR: Neural Uplink Failed. Please verify your connection.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col min-h-[calc(100vh-120px)] h-full min-w-0 w-full max-w-full gap-6 p-4 md:p-6",
        isRtl ? "rtl" : "ltr",
      )}
    >
      {/* 1. LEGAL HEADER & HEALTH HUD */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#0b141a] text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5 shrink-0 min-w-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row gap-8 w-full">
          <div className="flex items-center gap-6 max-w-3xl">
            <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-lg shadow-amber-500/20 rotate-3 transition-transform hover:rotate-0">
              <Scale size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">
                LEGAL <span className="text-amber-500">OVERLORD.</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <ShieldCheck size={12} className="text-amber-500/60" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  HARD_COMPLIANCE: MOROCCO_v2026
                </span>
              </div>
              <p className="mt-3 text-[11px] text-slate-300 max-w-xl leading-6">
                Pose ta question librement en français, darija ou anglais.
                L’assistant utilise un moteur IA juridique et fiscal marocain
                pour te répondre avec un protocole clair et des étapes d’action.
              </p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between w-full xl:w-auto">
            {legalHealth && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[1.5rem] flex items-center gap-5 shadow-lg w-full xl:w-auto hover:bg-white/10 transition-colors cursor-default">
                <div className="relative shrink-0">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={150}
                      strokeDashoffset={150 - (150 * legalHealth.score) / 100}
                      className={cn(
                        legalHealth.score > 80
                          ? "text-emerald-500"
                          : legalHealth.score > 50
                            ? "text-amber-500"
                            : "text-rose-500",
                      )}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                    {legalHealth.score}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">
                    Global_Status
                  </p>
                  <p
                    className={cn(
                      "text-lg font-black italic uppercase leading-none",
                      legalHealth.score > 80
                        ? "text-emerald-400"
                        : legalHealth.score > 50
                          ? "text-amber-400"
                          : "text-rose-400",
                    )}
                  >
                    {legalHealth.status}
                  </p>
                </div>
                <div className="hidden xl:flex flex-col items-end">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">
                    Active_Alerts
                  </p>
                  <p className="text-lg font-black text-white leading-none">
                    {legalHealth.alerts?.length || 0}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleClearChat}
              className="hidden xl:inline-flex items-center gap-2 rounded-3xl bg-white/10 border border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.35em] font-black text-slate-100 hover:bg-white/15 transition-all"
            >
              <RefreshCcw size={14} /> CLEAR CHAT
            </button>
          </div>
        </div>
      </header>

      {/* 2. CHAT & ALERT GRID */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 overflow-hidden min-h-0 min-w-0">
        {/* Chat Interface */}
        <div className="flex-1 min-w-0 bg-white dark:bg-[#0f172a] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden relative group">
          {/* Messages Node */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6 relative z-10 scroll-smooth"
          >
            {messages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={i}
                className={cn(
                  "flex gap-4 max-w-[95%] lg:max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                    msg.role === "bot"
                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                      : "bg-slate-900 dark:bg-slate-800 text-white",
                  )}
                >
                  {msg.role === "bot" ? (
                    <Gavel size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>

                <div
                  className={cn(
                    "p-4 md:p-6 rounded-[2rem] text-sm shadow-md transition-all",
                    msg.role === "bot"
                      ? "bg-slate-50 dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
                      : "bg-indigo-600 text-white rounded-tr-none",
                  )}
                >
                  {msg.role === "bot" ? (
                    <FormattedBotResponse content={msg.content} />
                  ) : (
                    <p className="font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}

                  <div
                    className={cn(
                      "mt-3 flex items-center gap-2 opacity-40 text-[9px] font-black uppercase tracking-widest",
                      msg.role === "bot"
                        ? "justify-start"
                        : "justify-end text-white/60",
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.role === "bot" && (
                      <Shield size={8} className="text-amber-500" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Cpu size={18} className="text-amber-600 animate-spin-slow" />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#1e293b] rounded-[2rem] rounded-tl-none border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    Consulting_Neural_Lattice...
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Node */}
          <div className="p-4 md:p-6 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800 relative z-20">
            <div className="relative flex items-end gap-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-[1.5rem] p-2 shadow-sm focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/50 transition-all">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about TVA, CNSS, Creation, Invoices... (Darija/FR/EN)"
                className="w-full bg-transparent border-none text-sm font-medium px-4 py-3 min-h-[50px] max-h-[150px] resize-none focus:ring-0 custom-scrollbar dark:text-white placeholder:text-slate-400"
                rows={1}
              />
              <button
                onClick={() => handleAsk()}
                disabled={loading || !query.trim()}
                className="mb-1 mr-1 p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-lg hover:shadow-amber-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all shrink-0"
              >
                <Send size={18} fill="currentColor" />
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                AI can make mistakes. Verify with a certified accountant.
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                Use keywords: TVA, IS, CNSS, facture, SARL, chèque, cash.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets - Ultra Pro Command Center */}
        <div className="w-full max-w-full lg:max-w-[360px] xl:w-96 flex flex-col gap-6 shrink h-full overflow-hidden min-w-0">
          {/* Alerts Panel - Forensic Terminal Look */}
          <div className="bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(244,63,94,0.15)] flex flex-col relative overflow-hidden max-h-[45%] shrink-0 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[80px] group-hover:bg-rose-500/10 transition-colors pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/5 blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 italic flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </div>
                FORENSIC_MONITOR
              </h3>
              <div className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[8px] font-black text-rose-400 uppercase tracking-widest">
                Live_Scan
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4 flex-1">
              {legalHealth?.alerts && legalHealth.alerts.length > 0 ? (
                legalHealth.alerts.map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-5 rounded-3xl border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative overflow-hidden",
                      alert.type === "CRITICAL"
                        ? "bg-rose-500/5 border-rose-500/20"
                        : "bg-amber-500/5 border-amber-500/20",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-xl shrink-0 shadow-sm",
                          alert.type === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-amber-500/20 text-amber-400",
                        )}
                      >
                        <AlertTriangle size={14} />
                      </div>
                      <div className="space-y-1">
                        <h4
                          className={cn(
                            "text-[9px] font-black uppercase tracking-wider",
                            alert.type === "CRITICAL"
                              ? "text-rose-400"
                              : "text-amber-400",
                          )}
                        >
                          {alert.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 opacity-20 group-hover:opacity-40 transition-opacity min-h-[120px]">
                  <div className="relative">
                    <ShieldCheck size={48} className="text-emerald-500 mb-2" />
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center mt-2 italic text-emerald-400">
                    Neural_Lattice_Secure
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - Command Node */}
          <div className="flex-1 bg-white/5 dark:bg-slate-900/20 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-8 shrink-0">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 italic flex items-center gap-2">
                <Zap size={12} fill="currentColor" /> DIRECT_UPLINK
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent mx-4" />
            </div>

            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-8 flex-1">
              {/* Category: Startup */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pl-3">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                    Phase_Alpha: Creation
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() =>
                      handleAsk(
                        undefined,
                        "Kifach n-dir la creation d'une SARL?",
                      )
                    }
                    className="group relative overflow-hidden text-left p-4 bg-slate-900/5 dark:bg-white/5 hover:bg-indigo-600 transition-all rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-400"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider dark:text-slate-200 group-hover:text-white">
                        Creation SARL Protocol
                      </span>
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <Landmark size={12} />
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleAsk(
                        undefined,
                        "Chnou houwa statut auto-entrepreneur?",
                      )
                    }
                    className="group relative overflow-hidden text-left p-4 bg-slate-900/5 dark:bg-white/5 hover:bg-indigo-600 transition-all rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-400"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider dark:text-slate-200 group-hover:text-white">
                        Auto-Entrepreneur Status
                      </span>
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <Briefcase size={12} />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category: Fiscality */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pl-3">
                  <div className="w-1 h-3 bg-amber-500 rounded-full" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                    Phase_Beta: Fiscality
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() =>
                      handleAsk(undefined, "Chno hiya l-TVA f-L-meghrib?")
                    }
                    className="group relative overflow-hidden text-left p-4 bg-slate-900/5 dark:bg-white/5 hover:bg-amber-600 transition-all rounded-2xl border border-slate-100 dark:border-white/5 hover:border-amber-400"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider dark:text-slate-200 group-hover:text-white">
                        TVA Matrix v2026
                      </span>
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <Scale size={12} />
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleAsk(undefined, "Kifach n-calcule l-IS?")
                    }
                    className="group relative overflow-hidden text-left p-4 bg-slate-900/5 dark:bg-white/5 hover:bg-amber-600 transition-all rounded-2xl border border-slate-100 dark:border-white/5 hover:border-amber-400"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider dark:text-slate-200 group-hover:text-white">
                        IS Progressive Scale
                      </span>
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <Cpu size={12} />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category: Compliance */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pl-3">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                    Phase_Gamma: Compliance
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleAsk(
                      undefined,
                      "Chno houma l-mentions obligatoires f-facture?",
                    )
                  }
                  className="group relative overflow-hidden w-full text-left p-4 bg-slate-900/5 dark:bg-white/5 hover:bg-emerald-600 transition-all rounded-2xl border border-slate-100 dark:border-white/5 hover:border-emerald-400"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider dark:text-slate-200 group-hover:text-white">
                      Invoicing Mandates
                    </span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                      <FileText size={12} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalConsultant;
