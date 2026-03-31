import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MediaViewerProps {
  url: string | null;
  type: "IMAGE" | "VIDEO" | null;
  onClose: () => void;
}

export const MediaViewer = ({ url, type, onClose }: MediaViewerProps) => {
  if (!url || !type) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-10"
      >
        {/* Cinematic HUD Header */}
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <Maximize2 size={20} className="text-white" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Media Protocol</p>
                 <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">High-Bandwidth Stream</p>
              </div>
           </div>
           <div className="flex gap-3">
              <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"><Download size={20}/></button>
              <button onClick={onClose} className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl transition-all shadow-xl shadow-rose-500/20"><X size={20}/></button>
           </div>
        </div>

        {/* Media Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-6xl w-full aspect-video md:aspect-auto md:max-h-[80vh] flex items-center justify-center overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
        >
           {type === "VIDEO" ? (
             <video src={url} className="w-full h-full object-contain" controls autoPlay />
           ) : (
             <img src={url} className="w-full h-full object-contain" alt="High Res Output" />
           )}
        </motion.div>

        {/* Media Controls HUD */}
        <div className="absolute bottom-12 flex gap-4 bg-white/5 backdrop-blur-3xl px-10 py-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
           <button className="p-3 text-white/40 hover:text-white transition-all"><ZoomIn size={20}/></button>
           <button className="p-3 text-white/40 hover:text-white transition-all"><ZoomOut size={20}/></button>
           <button className="p-3 text-white/40 hover:text-white transition-all"><RotateCcw size={20}/></button>
           <div className="w-px h-8 bg-white/10 mx-2" />
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center">Encrypted Buffer</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
