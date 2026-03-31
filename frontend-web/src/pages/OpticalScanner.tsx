import React, { useState, useEffect } from "react";
import { 
  Scan, Printer, QrCode, Smartphone, 
  CheckCircle2, AlertTriangle, Zap, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

export const OpticalScanner = () => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<"SCAN" | "GENERATE">("SCAN");
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("SM-PRO-8842X");

  // Simulated Scan Effect
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        setScanning(false);
        toast.success("Asset Identified: HYPER-DRIVE-V4", {
          style: { background: "#10b981", color: "#fff", fontWeight: "bold" },
          icon: "📦"
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 max-w-7xl mx-auto font-sans", isRtl ? "text-right" : "text-left")}>
      
      {/* LEFT: OPTICAL SCANNER */}
      <div className="bg-slate-950 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 group">
         {/* HUD Elements */}
         <div className={cn("absolute top-8 flex items-center gap-3 z-20", isRtl ? "right-8" : "left-8")}>
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Live Feed</span>
         </div>
         <div className={cn("absolute top-8 z-20", isRtl ? "left-8" : "right-8")}>
            <Smartphone className="text-white/40" />
         </div>

         {/* Viewport */}
         <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-3xl">
            {/* Simulated Camera Feed */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-purple-900/20" />
            
            {/* Scan Reticle */}
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-64 h-64 border-2 border-indigo-500/50 rounded-3xl relative"
               >
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1" />
                  
                  {scanning && (
                    <motion.div 
                      initial={{ top: 0 }} 
                      animate={{ top: "100%" }} 
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1]" 
                    />
                  )}
               </motion.div>
            </div>

            {/* Status Overlay */}
            <div className="absolute bottom-8 left-0 w-full text-center">
               <p className="text-xs font-mono text-indigo-400">{scanning ? "ACQUIRING TARGET..." : "SYSTEM READY"}</p>
            </div>
         </div>

         <button 
           onClick={() => setScanning(!scanning)}
           className={cn(
             "mt-8 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-2xl active:scale-95",
             scanning ? "bg-rose-600 text-white shadow-rose-600/30" : "bg-indigo-600 text-white shadow-indigo-600/30"
           )}
         >
           {scanning ? "Abort Scan" : "Initialize Scan"}
         </button>
      </div>

      {/* RIGHT: LABEL GENERATOR */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl p-10 flex flex-col transition-colors">
         <h2 className={cn("text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3", isRtl && "flex-row-reverse")}>
            <Printer className="text-indigo-600" /> Label Foundry
         </h2>

         <div className="flex-1 flex flex-col justify-center items-center gap-8">
            {/* The Label Preview */}
            <div className="w-full max-w-sm aspect-[3/2] bg-white border-2 border-slate-200 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
               <div className={cn("absolute top-4", isRtl ? "left-4" : "right-4")}><QrCode size={64} className="text-black" /></div>
               <div className={isRtl ? "text-right" : "text-left"}>
                  <h3 className="text-3xl font-black text-black tracking-tighter uppercase">SM-PRO</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">High-Val Asset</p>
               </div>
               <div className={isRtl ? "text-right" : "text-left"}>
                  <p className="text-4xl font-mono font-black text-black tracking-tighter">{generatedCode}</p>
                  <div className="w-full h-8 bg-black mt-2" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }} />
               </div>
            </div>

            <div className="w-full space-y-4">
               <div className="space-y-2">
                  <label className={cn("text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1", isRtl && "text-right block mr-1")}>Asset ID Sequence</label>
                  <div className={cn("flex gap-2", isRtl && "flex-row-reverse")}>
                     <input 
                       value={generatedCode} 
                       onChange={(e) => setGeneratedCode(e.target.value.toUpperCase())}
                       className={cn("flex-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white", isRtl && "text-right")}
                     />
                     <button className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl hover:text-indigo-600 transition-all text-slate-400"><Zap size={20}/></button>
                  </div>
               </div>
               
               <button onClick={() => toast.success(t('common.success'))} className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95">
                  <Download size={18} /> {t('common.export')} Vector
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};
