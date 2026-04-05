import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Info, Maximize2, Zap, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ImageDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  title: string;
  subtitle?: string;
  details?: string[];
  tags?: string[];
}

export const ImageDetailView: React.FC<ImageDetailViewProps> = ({
  isOpen,
  onClose,
  image,
  title,
  subtitle,
  details,
  tags
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10"
        >
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"
          />

          {/* CONTENT CONTAINER */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full max-w-7xl aspect-video md:aspect-[21/9] overflow-hidden rounded-[3rem] border border-white/10 shadow-pro",
              "bg-slate-900/40 backdrop-blur-3xl flex flex-col md:flex-row"
            )}
          >
            {/* IMAGE SECTION */}
            <div className="relative flex-1 h-1/2 md:h-full overflow-hidden group">
              <motion.img
                layoutId={`image-${image}`}
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
              
              {/* IMAGE HUD */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-3">
                 <div className="px-4 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 backdrop-blur-md flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[8px] font-black text-indigo-400 uppercase tracking-widest">SIGNAL_LOCK_ACTIVE</span>
                 </div>
                 {tags?.map((tag, i) => (
                    <div key={i} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                       <span className="font-mono text-[8px] font-black text-white/60 uppercase tracking-widest">{tag}</span>
                    </div>
                 ))}
              </div>

              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors backdrop-blur-md group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* INFO SECTION */}
            <div className="w-full md:w-[450px] p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">// DATA_SNAPSHOT</span>
                  <h2 className="font-display text-4xl text-white uppercase leading-none">{title}</h2>
                  <p className="font-mono text-[11px] text-slate-400 uppercase tracking-widest mt-4 italic">{subtitle}</p>
                </div>

                {details && (
                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-[0.3em]">Spécifications_Core</span>
                    <ul className="space-y-3">
                      {details.map((detail, i) => (
                        <li key={i} className="flex gap-4 items-start group/li">
                          <ChevronRight size={12} className="text-indigo-500 mt-0.5 group-hover/li:translate-x-1 transition-transform" />
                          <span className="text-[12px] text-slate-300 font-sans leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-6 pt-8 border-t border-white/5">
                   <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Résolution</span>
                      <span className="font-mono text-[10px] text-white">4096 x 2304</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Codec</span>
                      <span className="font-mono text-[10px] text-white">NEURAL_RAW</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Latence Sync</span>
                      <span className="font-mono text-[10px] text-emerald-500">0.003ms</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-12">
                <button className="w-full group flex items-center justify-between p-5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                   <span className="font-mono text-[11px] font-black uppercase tracking-widest italic">TÉLÉCHARGER LE SCAN</span>
                   <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                    <Share2 size={14} className="text-indigo-400" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest">PARTAGER</span>
                  </button>
                  <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                    <Info size={14} className="text-indigo-400" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest">INFO</span>
                  </button>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full p-4 rounded-2xl border border-white/5 text-slate-500 hover:text-white transition-colors font-mono text-[9px] font-black uppercase tracking-[0.5em] italic"
                >
                  [ FERMER_SESSION ]
                </button>
              </div>
            </div>

            {/* DECORATIVE CORNER */}
            <div className="absolute bottom-0 left-0 p-8 pointer-events-none opacity-20">
               <Zap size={40} className="text-indigo-500" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
