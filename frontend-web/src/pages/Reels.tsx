import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, MessageCircle, Share2, Music, 
  Volume2, VolumeX, ShieldCheck, 
  ArrowLeft, Bookmark, Loader2, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { VideoPlayer } from "../components/ui/VideoPlayer";

export const Reels = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const navigate = useNavigate();

  const fetchReels = async () => {
    try {
      const res = await api.get("/community/reels");
      setReels(res.data);
    } catch (e) { toast.error("Buffer Failure"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReels(); }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const index = Math.round(e.currentTarget.scrollTop / window.innerHeight);
    if (index !== activeIndex) setActiveIndex(index);
  };

  if (loading) return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
       <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
       <p className="font-black text-[10px] uppercase tracking-[0.5em] text-white/40">Loading Neural Stream...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative font-sans">
      
      {/* 1. TOP HUD */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
         <button onClick={() => navigate(-1)} className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all pointer-events-auto">
            <ArrowLeft size={24}/>
         </button>
         <h2 className="text-xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">Neural <span className="text-indigo-500">Reels.</span></h2>
         <button onClick={() => setMuted(!muted)} className="p-4 bg-white/10 rounded-full text-white backdrop-blur-md pointer-events-auto">
            {muted ? <VolumeX size={24}/> : <Volume2 size={24}/>}
         </button>
      </div>

      {/* 2. VIDEO FEED ENGINE */}
      <div 
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory custom-scrollbar no-scrollbar"
        onScroll={handleScroll}
      >
         {reels.map((reel, i) => (
           <ReelNode 
             key={reel._id} reel={reel} 
             isActive={i === activeIndex} 
             muted={muted} 
             onToggleMute={() => setMuted(!muted)}
           />
         ))}
      </div>

    </div>
  );
};

const ReelNode = ({ reel, isActive, muted, onToggleMute }: any) => {
  const [liked, setLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [showHeart, setShowHeart] = useState(false);
  const navigate = useNavigate();
  const lastTapRef = useRef(0);

  const handleLike = async () => {
    try {
      const res = await api.post(`/community/${reel._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (e) {}
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    } else {
        // Toggle play handled by VideoPlayer internally or via prop if needed, 
        // but double tap is priority here. Single tap could toggle mute or play.
        // For now, let VideoPlayer handle single click play/pause.
    }
    lastTapRef.current = now;
  };

  return (
    <div className="h-screen w-full snap-start relative flex items-center justify-center bg-zinc-950" onDoubleClick={handleDoubleTap}>
       
       <VideoPlayer 
         src={reel.mediaUrl} 
         isActive={isActive} 
         muted={muted} 
         onToggleMute={onToggleMute}
       />

       {/* Double Tap Heart Animation */}
       <AnimatePresence>
         {showHeart && (
           <motion.div 
             initial={{ scale: 0, opacity: 0 }} 
             animate={{ scale: 1.5, opacity: 1 }} 
             exit={{ scale: 0, opacity: 0 }}
             className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
           >
             <Heart size={120} className="text-white fill-rose-500 drop-shadow-2xl" />
           </motion.div>
         )}
       </AnimatePresence>

       {/* INTERACTION OVERLAY */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

       <div className="absolute right-4 bottom-24 flex flex-col gap-6 pointer-events-auto items-center z-30">
          <InteractionItem 
            icon={<Heart size={32} fill={liked ? "#f43f5e" : "white"} className={cn("transition-colors", liked ? "text-rose-500" : "text-white/80")} />} 
            label={likesCount} onClick={handleLike} 
          />
          <InteractionItem icon={<MessageCircle size={32} className="text-white/80" />} label={reel.commentsCount || 0} />
          <InteractionItem icon={<Share2 size={32} className="text-white/80" />} label="Link" />
          <InteractionItem icon={<Bookmark size={32} className="text-white/80" />} label="Vault" />
          <button onClick={() => navigate(`/profile/${reel.author?._id}`)} className="p-0.5 rounded-full border-2 border-white/50 shadow-xl mt-4 overflow-hidden w-12 h-12 bg-indigo-600 transition-transform active:scale-90">
             <img src={reel.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.author?._id}`} className="w-full h-full object-cover" />
          </button>
       </div>

       <div className="absolute left-6 bottom-10 max-w-[75%] pointer-events-auto space-y-4 z-30">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/profile/${reel.author?._id}`)}>
             <div className="w-10 h-10 rounded-xl border border-white/20 overflow-hidden"><img src={reel.author?.avatar} className="w-full h-full object-cover" /></div>
             <div>
                <h4 className="font-black text-sm text-white uppercase italic tracking-tighter flex items-center gap-2 shadow-black drop-shadow-md">{reel.author?.name} <ShieldCheck size={14} className="text-indigo-400" /></h4>
                <p className="text-[8px] text-white/70 font-black uppercase tracking-widest">{reel.author?.jobTitle || "Creator"}</p>
             </div>
             <button className="ml-2 px-4 py-1.5 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-md transition-all border border-white/10">Follow</button>
          </div>
          
          <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2 drop-shadow-md">{reel.content}</p>
          
          <div className="flex items-center gap-3 text-white/60">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/5">
                <Music size={12} className="animate-spin-slow" />
                <p className="text-[8px] font-black uppercase tracking-widest">Original Audio • {reel.author?.name}</p>
             </div>
          </div>
       </div>

    </div>
  );
};

const InteractionItem = ({ icon, label, onClick }: any) => (
  <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onClick}>
     <div className="p-3 bg-black/20 backdrop-blur-sm rounded-full transition-all group-active:scale-90 hover:bg-black/40">{icon}</div>
     <span className="text-[9px] font-black text-white uppercase tracking-widest drop-shadow-md">{label}</span>
  </div>
);

export default Reels;
