import React, { useState, useEffect } from "react";
import { Cpu, Sparkles, Zap, Activity, TrendingUp, Target, Lightbulb, Camera, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Simplified Components ---
import { MatrixTerminal } from "../components/ai/MatrixTerminal";
import { AILabs } from "../components/ai/AILabs";
import { NeuralChatHUD } from "../components/ai/NeuralChatHUD";
import { InsightsFeed } from "../components/ai/InsightsFeed";

export const AIIntelligence = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [supplyData, setSupplyData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"DIAGNOSTIC" | "VISION" | "SUPPLY">("DIAGNOSTIC");
  const [mobileView, setMobileView] = useState<"FEED" | "LABS" | "CHAT">("LABS");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([{ role: 'ai', text: 'Neural Interface v5.0 active. How can I assist your strategy today?' }]);
  const [isListening, setIsListening] = useState(false);
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<any>(null);
  const [terminalSignal, setTerminalSignal] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);

  const radarData = [
    { subject: 'Velocity', A: 120 }, { subject: 'Margin', A: 98 }, { subject: 'Accuracy', A: 86 }, 
    { subject: 'Lattice', A: 99 }, { subject: 'Liquidity', A: 85 },
  ];

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [prodRes, insightRes, supplyRes] = await Promise.all([
        api.get("/products"), 
        api.get("/ai/insights"), 
        api.get("/ai/supply")
      ]);
      setProducts(prodRes.data.data || []); 
      setInsights(insightRes.data.insights || []); 
      setSupplyData(supplyRes.data);
      setTerminalSignal("SYSTEM_READY: LATTICE SYNCHRONIZED");
    } catch (e) { 
      toast.error(t('errors.networkError')); 
      setTerminalSignal("CRITICAL: LATTICE SYNC FAILURE");
    } finally { 
      setLoading(false); 
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsThinking(true);
    setTerminalSignal(`PROCESSING_QUERY: ${userMsg.slice(0, 15).toUpperCase()}...`);
    
    try {
      const res = await api.post("/ai/chat", { query: userMsg }, {
        headers: { 'Accept-Language': i18n.language }
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response }]);
      setTerminalSignal("RESPONSE_GENERATED: SENT TO HUD");
    } catch (e) { 
      toast.error(t('errors.serverError'));
      setTerminalSignal("ERROR: NLP MODULE FAILURE");
    } finally { 
      setIsThinking(false); 
    }
  };

  const handleVisionAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setVisionImage(base64Image);
      setAnalyzing(true);
      setTerminalSignal("INIT_OPTICAL_FORENSICS_SEQUENCE");
      
      try {
        const res = await api.post("/ai/vision", { image: base64Image });
        setVisionResult(res.data);
        setTerminalSignal(`NODE_IDENTIFIED: CONFIDENCE_${res.data.confidence}%`);
      } catch (e) {
        toast.error("Vision Analysis Failed");
        setTerminalSignal("ERROR: OPTICAL FEED INTERRUPTED");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async () => {
    if (!selectedProduct) return;
    setAnalyzing(true);
    setTerminalSignal(`DIAGNOSTIC_LINK: NODE_${selectedProduct.slice(-4).toUpperCase()}`);
    
    try {
      const res = await api.post("/ai/diagnose", { productId: selectedProduct }, {
        headers: { 'Accept-Language': i18n.language }
      });
      setDiagnosis(res.data);
      setTerminalSignal("DIAGNOSTIC_SUCCESS: INSIGHTS READY");
      toast.success(t('common.success'), { icon: "🧠" });
    } catch (e) { 
      setTerminalSignal("LINK_FAILURE: RETRYING...");
      toast.error(t('errors.serverError')); 
    } finally { 
      setAnalyzing(false); 
    }
  };

  const isRtl = i18n.language === 'ar';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020205]">
       <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-t-2 border-indigo-500 rounded-full" />
          <Cpu className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={32} />
       </div>
       <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 animate-pulse">Initializing Neural Lattice...</p>
    </div>
  );

  return (
    <div className={cn("max-w-[1600px] mx-auto space-y-10 pb-32 px-4 md:px-10 animate-reveal relative", isRtl ? "font-ar text-right" : "font-sans text-left")}>
      
      {/* --- CLASSY MINIMAL HEADER --- */}
      <header className="flex flex-col items-center text-center space-y-6 pt-10">
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] rotate-3">
            <Sparkles size={32} strokeWidth={2.5} />
         </motion.div>
         <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
               Intelligence <span className="text-indigo-600">Hub.</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
               <div className="px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Neural_Engine_v5.4_Active</span>
               </div>
            </div>
         </div>
      </header>

      {/* --- MOBILE NAVIGATION CONTROL --- */}
      <div className="xl:hidden flex justify-center p-2 bg-slate-100 dark:bg-white/5 rounded-full border border-white/10 w-fit mx-auto shadow-inner">
         {[
           { id: "FEED", label: "Registry", icon: Activity },
           { id: "LABS", label: "Labs", icon: Cpu },
           { id: "CHAT", label: "Neural Chat", icon: MessageSquare }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setMobileView(tab.id as any)}
             className={cn(
               "px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 border-none flex items-center gap-3",
               mobileView === tab.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl scale-105' : 'text-slate-500 hover:text-white'
             )}
           >
              <tab.icon size={14} /> {tab.label}
           </button>
         ))}
      </div>

      {/* --- CREATIVE THREE-COLUMN FOCUS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start relative z-10">
         
         {/* LEFT: System Feed (Matrix Terminal + Insights) */}
         <div className={cn("xl:col-span-3 space-y-8", mobileView !== "FEED" && "hidden xl:block")}>
            <MatrixTerminal externalSignal={terminalSignal} />
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-4xl relative overflow-hidden group border border-indigo-400/20">
               <Zap className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000" />
               <div className="relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-60 mb-3 italic">Priority_Deployment</p>
                  <p className="text-xl font-black italic uppercase leading-none tracking-tighter">Maximize Supply Chain <br /> Recovery Signals</p>
               </div>
            </div>
            <InsightsFeed insights={insights} isRtl={isRtl} />
         </div>

         {/* CENTER: Main Lab (AI Labs) */}
         <div className={cn("xl:col-span-6 space-y-8", mobileView !== "LABS" && "hidden xl:block")}>
            <AILabs 
               activeTab={activeTab} setActiveTab={setActiveTab} 
               selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
               products={products} analyzing={analyzing} diagnosis={diagnosis}
               handleDiagnose={handleDiagnose} visionImage={visionImage}
               setVisionImage={setVisionImage} visionResult={visionResult}
               setVisionResult={setVisionResult} handleVisionAnalyze={handleVisionAnalyze}
               supplyData={supplyData} radarData={radarData} isRtl={isRtl} t={t}
            />
         </div>

         {/* RIGHT: Interaction (Neural Chat) */}
         <div className={cn("xl:col-span-3 h-full", mobileView !== "CHAT" && "hidden xl:block")}>
            <NeuralChatHUD 
               messages={messages} chatInput={chatInput} setChatInput={setChatInput}
               handleChat={handleChat} isListening={isListening} setIsListening={setIsListening}
               onPurge={() => setMessages([])} isRtl={isRtl} isThinking={isThinking}
            />
         </div>

      </div>

    </div>
  );
};

export default AIIntelligence;
