import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Eye, Play, Pause, Radio } from "lucide-react";
import api from "../../api/client";
import { cn } from "../../lib/utils";

interface StoryViewerProps {
  stories: any[];
  initialIndex?: number;
  onClose: () => void;
}

export const StoryViewer = ({ stories, initialIndex = 0, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);
  const currentStory = stories[currentIndex];

  const duration = currentStory?.mediaType === 'VIDEO' ? 15000 : 5000; // 15s for video, 5s for img

  useEffect(() => {
    if (!currentStory) return;
    api.post(`/community/stories/${currentStory._id}/view`).catch(() => {});
    setProgress(0);
    setIsPaused(false);
  }, [currentIndex, currentStory]);

  useEffect(() => {
    if (isPaused) {
      if (videoRef.current) videoRef.current.pause();
      return;
    }
    if (videoRef.current) videoRef.current.play().catch(() => {});

    const interval = 50; 
    const step = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused, duration]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020205] flex items-center justify-center font-sans">
       {/* Background Blur Lattice */}
       <div className="absolute inset-0 opacity-40 blur-[120px] pointer-events-none overflow-hidden">
          <motion.img 
            key={currentStory.mediaUrl}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            src={currentStory.mediaUrl} 
            className="w-full h-full object-cover" 
          />
       </div>

       <div className="relative w-full max-w-lg h-full md:h-[92vh] bg-black md:rounded-[3.5rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10">
          <div className="absolute inset-0 scanline opacity-10 pointer-events-none z-10" />

          {/* Progress Bars Protocol */}
          <div className="absolute top-0 left-0 w-full p-6 flex gap-2 z-30">
             {stories.map((_, i) => (
               <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-100 ease-linear shadow-[0_0_10px_#6366f1]"
                    style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }}
                  />
               </div>
             ))}
          </div>

          {/* Sovereign Header */}
          <div className="absolute top-10 left-0 w-full px-8 flex justify-between items-center z-30">
             <div className="flex items-center gap-4">
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-rose-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500" />
                   <img src={currentStory.author?.avatar} className="relative w-12 h-12 rounded-2xl object-cover border-2 border-white/20" alt="Author" />
                </div>
                <div>
                   <p className="text-sm font-black text-white uppercase italic tracking-tighter shadow-black drop-shadow-lg">{currentStory.author?.name}</p>
                   <div className="flex items-center gap-2">
                      <Radio size={10} className="text-indigo-500 animate-pulse" />
                      <p className="text-[8px] text-white/60 font-black uppercase tracking-widest">{new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} // TEMPORAL_SIGNAL</p>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => setIsPaused(!isPaused)} className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl text-white hover:bg-white/10 transition-all border border-white/10">
                   {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                </button>
                <button onClick={onClose} className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl text-white hover:bg-rose-600 transition-all border border-white/10">
                   <X size={18}/>
                </button>
             </div>
          </div>

          {/* Media Core */}
          <div 
            className="flex-1 relative bg-[#020205] flex items-center justify-center cursor-none group/media"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
             {currentStory.mediaType === 'VIDEO' ? (
               <video 
                 ref={videoRef}
                 src={currentStory.mediaUrl} 
                 className="w-full h-full object-cover" 
                 autoPlay 
                 muted 
                 playsInline 
                 onEnded={handleNext}
               />
             ) : (
               <img src={currentStory.mediaUrl} className="w-full h-full object-cover" alt="Story" />
             )}
             
             {/* Tap Command Zones */}
             <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
             <div className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
             
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity duration-500">
                <Eye size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{currentStory.viewsCount || 0} Nodes_Viewing</span>
             </div>
          </div>
       </div>
    </div>
  );
};

