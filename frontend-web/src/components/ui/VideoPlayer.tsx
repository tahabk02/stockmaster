import React, { useRef, useEffect, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

export const VideoPlayer = ({ src, isActive, muted, onToggleMute }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        loop
        muted={muted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Play size={48} className="text-white opacity-80" fill="white" />
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div className="h-full bg-indigo-600 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Mute Indicator (Briefly visible on toggle could be added here) */}
    </div>
  );
};
