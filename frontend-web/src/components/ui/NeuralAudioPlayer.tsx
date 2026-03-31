import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2, Waves } from "lucide-react";
import { motion } from "framer-motion";

interface NeuralAudioPlayerProps {
  url: string;
  isMe?: boolean;
}

export const NeuralAudioPlayer = ({ url, isMe }: NeuralAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex flex-col gap-3 min-w-[240px] p-2 ${isMe ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={togglePlay}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${isMe ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex-1 space-y-2">
           <div className="flex items-end gap-[2px] h-8 opacity-60">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={isPlaying ? { height: [4, Math.random() * 24 + 4, 4] } : { height: 4 }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className={`w-[3px] rounded-full ${isMe ? 'bg-white' : 'bg-indigo-500'}`}
                />
              ))}
           </div>
           <div className="relative h-1 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className={`absolute inset-0 h-full ${isMe ? 'bg-white' : 'bg-indigo-600'}`}
                style={{ width: `${progress}%` }}
              />
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center opacity-40 text-[8px] font-black uppercase tracking-widest px-1">
         <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
         <div className="flex items-center gap-2">
            <Waves size={10} />
            <span>Encrypted Signal</span>
         </div>
         <span>{duration ? formatTime(duration) : '...'}</span>
      </div>

      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
    </div>
  );
};
