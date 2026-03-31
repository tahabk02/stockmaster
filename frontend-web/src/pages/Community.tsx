import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  MessageCircle, Share2, Image as ImageIcon, Video, 
  Smile, MoreHorizontal, Send, ThumbsUp, Users, Hash, 
  TrendingUp, Award, Search, Loader2, Plus, X, Bookmark,
  ShieldCheck, Globe, Play, Heart, MessageSquare, UserPlus,
  UserCheck, ExternalLink, Zap, BarChart3, Paperclip, MoreVertical,
  Camera, Film, Compass, Command, Reply, Vote, CheckCircle2,
  Sparkles, Megaphone, Terminal, Cpu, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { useAuth } from "../store/auth.slice";
import { toast } from "react-hot-toast";
import { cn, formatSignalTime } from "../lib/utils";
import { NodeCard } from "../components/community/NodeCard";
import { ShareModal } from "../components/community/ShareModal";
import { GroupProtocolModal } from "../components/chat/GroupProtocolModal";
import { UnifiedCreator } from "../components/community/UnifiedCreator";
import { MediaViewer } from "../components/ui/MediaViewer";
import { StoryViewer } from "../components/community/StoryViewer";
import { InteractionSuite } from "../components/community/InteractionSuite";
import { Store as StoreIcon, Package as PackageIcon, ShoppingCart, ArrowRight, ArrowUpRight } from "lucide-react";

const getID = (obj: any): string | null => {
  if (!obj) return null;
  if (typeof obj === "string") return obj;
  return (obj._id || obj.id || obj).toString();
};

// --- HARD_SYSTEM_COMPONENTS ---

const SovereignMedia = ({ url, type, isReel, onMediaClick }: any) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const isVideo = type === "VIDEO" || isReel;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative rounded-[3rem] overflow-hidden bg-slate-950 border-4 border-white/10 shadow-4xl transition-all duration-700 group/media",
        isReel ? "aspect-[9/16] max-h-[750px] w-fit mx-auto border-indigo-500/20" : "w-full aspect-video"
      )}
    >
       {isVideo ? (
         <>
           <video 
             ref={videoRef}
             src={url} 
             className="w-full h-full object-cover opacity-80 group-hover/media:opacity-100 transition-opacity duration-700" 
             muted={isMuted}
             loop
             playsInline
             onTimeUpdate={handleTimeUpdate}
             onClick={() => {
               if (videoRef.current?.paused) videoRef.current.play();
               else videoRef.current?.pause();
               setIsPlaying(!videoRef.current?.paused);
             }}
           />
           
           {/* INDUSTRIAL_CONTROLS */}
           <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
              <div className="flex justify-between items-start opacity-0 group-hover/media:opacity-100 transition-opacity duration-500">
                 <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest italic">Live_Stream_v9.4</span>
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                   className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-white pointer-events-auto hover:bg-indigo-600 transition-all"
                 >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                 </button>
              </div>

              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 bg-indigo-600/20 backdrop-blur-md rounded-full flex items-center justify-center border border-indigo-500/30">
                      <Play size={32} fill="white" className="text-white ml-1" />
                   </div>
                </div>
              )}

              <div className="space-y-4">
                 <div className="flex justify-between items-end opacity-0 group-hover/media:opacity-100 transition-all translate-y-4 group-hover/media:translate-y-0 duration-500">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
                          <Activity size={12} className="text-indigo-500 animate-pulse" />
                          <span className="text-[7px] font-black text-white/60 uppercase tracking-[0.4em]">Bitrate: 4.2Mbps</span>
                       </div>
                    </div>
                 </div>
                 {/* PROGRESS_PROTOCOL */}
                 <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden pointer-events-auto cursor-pointer relative group/prog">
                    <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover/prog:opacity-100 transition-opacity" />
                    <motion.div 
                      className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" 
                      style={{ width: `${progress}%` }} 
                    />
                 </div>
              </div>
           </div>
         </>
       ) : (
         <img 
           src={url} 
           onClick={() => onMediaClick(url, "IMAGE")}
           className="w-full h-auto object-contain opacity-90 group-hover/media:opacity-100 transition-all duration-700 cursor-zoom-in" 
           alt="Payload" 
         />
       )}

       {/* REEL_SIDEBAR_OVERLAY */}
       {isReel && (
         <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
            <ReelAction icon={<Heart size={22} />} label="Pulse" color="text-rose-500" />
            <ReelAction icon={<MessageCircle size={22} />} label="Signal" color="text-indigo-500" />
            <ReelAction icon={<Share2 size={22} />} label="Relay" color="text-emerald-500" />
         </div>
       )}

       <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-none mix-blend-overlay" />
    </div>
  );
};

const ReelAction = ({ icon, label, color }: any) => (
  <div className="flex flex-col items-center gap-1 group/action cursor-pointer">
     <div className={cn("p-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-white dark:hover:bg-white/10", color)}>
        {icon}
     </div>
     <span className="text-[7px] font-black text-white uppercase tracking-widest drop-shadow-lg opacity-0 group-hover/action:opacity-100 transition-opacity">{label}</span>
  </div>
);

const NavBtn = ({ active, onClick, icon, label, highlight, count }: any) => (
  <button 
    onClick={onClick} 
    className={cn(
      "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden",
      active 
        ? "bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)] scale-[1.02] border border-white/20" 
        : "text-slate-500 dark:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/5"
    )}
  >
     {active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
     <div className="flex items-center gap-5 relative z-10">
        <div className={cn(
          "transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
          active ? "text-white" : highlight ? "text-rose-500" : "text-indigo-500"
        )}>
           {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{label}</span>
     </div>
     {count !== undefined && (
       <span className={cn(
         "text-[8px] font-black px-2 py-0.5 rounded-md border relative z-10",
         active ? "bg-white/20 border-white/20 text-white" : "bg-slate-100 dark:bg-white/5 border-white/5 text-slate-500"
       )}>{count}</span>
     )}
  </button>
);

const TelemetryWidget = ({ label, value, color = "indigo" }: { label: string, value: string | number, color?: string }) => (
  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-2 group hover:border-indigo-500/30 transition-all">
     <div className="flex justify-between items-center">
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <div className={cn("w-1 h-1 rounded-full animate-pulse", `bg-${color}-500 shadow-[0_0_8px_currentColor]`)} />
     </div>
     <div className="flex items-baseline gap-2">
        <span className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">{value}</span>
        <span className="text-[6px] font-black text-slate-500 uppercase">SYS_OK</span>
     </div>
  </div>
);

export const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("FEED");
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any>({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  
  const [creatorType, setCreatorType] = useState<any>("IMAGE");
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [discussionPostId, setDiscussionPostId] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<any>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);

  const handleCreated = (data: any) => {
    if (data.expiresAt) {
      setStories(prev => [data, ...prev]);
    } else {
      setPosts(prev => [data, ...prev]);
    }
    setIsCreatorOpen(false);
  };

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/community?tab=${activeTab}`);
      setPosts(res.data.feed || []);
      setStories(res.data.stories || []);
      const usersRes = await api.get("/users?global=true"); 
      setMembers(usersRes.data.data || usersRes.data);
    } catch (error) { toast.error(t('errors.networkError')); }
    finally { setLoading(false); }
  }, [activeTab, t]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/community/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (e) {} finally { setIsSearching(false); }
      } else setSearchResults({ users: [], posts: [] });
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const updatePostInStream = (updatedPost: any) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? { ...p, ...updatedPost } : p));
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn(
      "w-full flex flex-col lg:flex-row gap-10 pb-32 px-4 md:px-10 transition-all duration-700 font-sans min-h-screen bg-[#f8fafc] dark:bg-[#020205] relative overflow-hidden",
      isRtl ? 'rtl' : 'ltr'
    )}>
      {/* TECHNICAL UNDERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 grid-pattern opacity-[0.03] dark:opacity-[0.08]" />
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>
      
      {/* 1. LEFT COMMAND SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 gap-8 sticky top-24 h-fit z-10">
         
         {/* NODE_IDENTITY_PLATE */}
         <div className="glass-card p-10 relative overflow-hidden group border-white/10 dark:bg-slate-950/40 rounded-[3.5rem] shadow-4xl backdrop-blur-3xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 animate-pulse" />
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-8">
                  <div className="w-24 h-24 relative">
                     <div onClick={() => navigate('/profile')} className="w-full h-full rounded-[2.5rem] bg-slate-900 flex items-center justify-center font-black text-4xl text-white italic uppercase shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-105 transition-all duration-700 overflow-hidden border-2 border-white/20 group-hover:rotate-3">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Me" /> : (user?.name || "U").charAt(0)}
                     </div>
                     <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-slate-950 shadow-2xl animate-bounce"><ShieldCheck size={16} color="white" /></div>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1">Rank_Alpha</p>
                     <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white italic uppercase tracking-widest">OS_v9.4</div>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{user?.name}</h3>
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                     <p className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em]">{user?.role} // NEURAL_AXIS</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mt-10">
                  <TelemetryWidget label="Signal_Resonance" value={`${(user?.followers?.length || 0) * 12}`} color="indigo" />
                  <TelemetryWidget label="Lattice_Nodes" value={user?.following?.length || 0} color="emerald" />
               </div>
            </div>
         </div>

         {/* NAVIGATION_PROTOCOL */}
         <div className="glass-card p-4 space-y-2 bg-white/80 dark:bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-4xl">
            <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 mb-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Command_Set</span>
               <Terminal size={14} className="text-slate-600" />
            </div>
            <NavBtn active={activeTab === "FEED"} onClick={() => setActiveTab("FEED")} icon={<Globe size={20}/>} label="Signal Stream" count={posts.length} />
            <NavBtn active={activeTab === "POPULAR"} onClick={() => setActiveTab("POPULAR")} icon={<TrendingUp size={20}/>} label="Registry_Top" count={14} />
            <NavBtn active={false} onClick={() => navigate("/reels")} icon={<Film size={20} className="text-rose-500"/>} label="Immersive_Reels" highlight />
            <NavBtn active={activeTab === "SAVED"} onClick={() => setActiveTab("SAVED")} icon={<Bookmark size={20}/>} label="Forensic_Vault" />
            
            <div className="pt-4 border-t border-white/5 mt-4">
               <button onClick={() => setIsGroupModalOpen(true)} className="w-full group relative flex items-center justify-between px-8 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all bg-indigo-600 text-white shadow-2xl hover:scale-105 active:scale-95 overflow-hidden border-none italic">
                  <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center gap-4">Initialize Squad <Plus size={18} strokeWidth={3}/></span>
               </button>
            </div>
         </div>
      </aside>

      {/* 2. MAIN SIGNAL FEED */}
      <main className="flex-1 max-w-3xl space-y-10 animate-reveal z-10">
         
         {/* BROADCAST_CONTROL */}
         <div className="glass-card p-4 rounded-full border-white/10 dark:bg-slate-950/40 flex items-center gap-4 shadow-pro backdrop-blur-3xl">
            <div className="relative group flex-1">
               <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all" size={20}/>
               <input 
                 value={searchQuery} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
                 placeholder="Search_Lattice_Signals..." 
                 className="w-full bg-slate-100 dark:bg-black/40 border border-transparent dark:border-white/5 rounded-full py-5 pl-16 pr-8 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all italic" 
               />
            </div>
            <button 
               onClick={() => { setCreatorType("IMAGE"); setIsCreatorOpen(true); }} 
               className="group relative px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-4xl hover:scale-105 transition-all active:scale-95 border-none italic overflow-hidden"
            >
               <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
               <span className="relative z-10 flex items-center gap-4">Broadcast <Megaphone size={18} /></span>
            </button>
         </div>

         {/* Story Rail Protocol */}
         <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar min-h-[160px] items-start relative px-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCreatorType("STORY"); setIsCreatorOpen(true); }} 
              className="flex flex-col items-center gap-4 shrink-0 group cursor-pointer"
            >
               <div className="w-24 h-24 rounded-[2.8rem] border-2 border-dashed border-indigo-400 dark:border-indigo-900/50 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/10 transition-all group-hover:border-indigo-600 relative overflow-hidden shadow-pro">
                  <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="relative z-10 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl group-hover:rotate-90 transition-transform duration-700">
                     <Plus size={32} className="text-indigo-600" strokeWidth={3} />
                  </div>
               </div>
               <span className="text-[10px] font-black text-slate-500 dark:text-indigo-400 uppercase tracking-[0.3em] italic">Temporal_+</span>
            </motion.div>
            
            <AnimatePresence>
              {stories.map((story, i) => {
                const sKey = getID(story) || `story-${i}`;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 30, scale: 0.9 }} 
                    animate={{ opacity: 1, x: 0, scale: 1 }} 
                    key={sKey} 
                    onClick={() => setActiveStoryIndex(i)} 
                    className="flex flex-col items-center gap-4 shrink-0 group cursor-pointer"
                  >
                     <div className="w-24 h-24 rounded-[2.8rem] p-[4px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 group-hover:rotate-6 group-hover:scale-110 transition-all duration-700 shadow-4xl relative">
                        <div className="w-full h-full rounded-[2.5rem] bg-white dark:bg-[#020205] p-1 overflow-hidden relative border-2 border-white/10">
                           <img src={story.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getID(story.author) || i}`} className="w-full h-full object-cover rounded-[2.2rem] group-hover:scale-110 transition-transform duration-1000" alt="Node" />
                           <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </div>
                        {story.mediaType === 'VIDEO' && (
                          <div className="absolute -top-1 -right-1 bg-rose-600 p-2 rounded-xl border-4 border-slate-950 shadow-2xl animate-pulse">
                             <Film size={10} color="white" fill="white" />
                          </div>
                        )}
                     </div>
                     <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest truncate w-24 text-center italic">{story.author?.name?.split(' ')[0] || "Node"}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
         </div>

         <div className="space-y-12">
            {loading ? (
              <div className="p-40 text-center space-y-8">
                 <div className="relative inline-block">
                    <div className="w-24 h-24 border-4 border-dashed border-indigo-500/20 rounded-full animate-spin-slow" />
                    <Cpu size={40} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-500 animate-pulse italic">Syncing_Signal_Registry...</p>
              </div>
            ) : posts.map((post, idx) => (
              <PostCard 
                key={getID(post) || `post-${idx}`} 
                post={post} idx={idx} 
                onDiscussion={() => setDiscussionPostId(getID(post))} 
                onShare={() => setSharingPost(post)} 
                onMediaClick={(url: string, type: any) => setViewerMedia({url, type})}
                onUpdate={updatePostInStream}
                t={t}
              />
            ))}
         </div>
      </main>

      {/* 3. RIGHT REGISTRY SIDEBAR */}
      <aside className="hidden xl:flex flex-col w-96 shrink-0 gap-8 sticky top-24 h-fit z-10">
         
         {/* STATUS_BOARD */}
         <div className="glass-card p-10 bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-4xl relative overflow-hidden">
            <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
            <h3 className="font-black text-[11px] text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic">
               <div className="w-10 h-[1px] bg-indigo-500" /> Member Registry
            </h3>
            
            <div className="space-y-8">
               {members.slice(0, 6).map((member, i) => (
                 <div key={getID(member) || `member-${i}`} className={cn("flex items-center justify-between group", isRtl && "flex-row-reverse")}>
                    <div onClick={() => navigate(`/profile/${getID(member)}`)} className={cn("flex items-center gap-5 cursor-pointer relative group/item", isRtl && "flex-row-reverse")}>
                       <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-rose-600 rounded-2xl blur opacity-0 group-hover/item:opacity-60 transition duration-500" />
                          <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getID(member) || i}`} className="relative w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-2xl group-hover/item:scale-105 transition-transform duration-500" alt="Node" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-white uppercase italic tracking-tighter group-hover/item:text-indigo-400 transition-colors">{member.name}</p>
                          <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">{member.role} // ACTIVE</p>
                       </div>
                    </div>
                    <button onClick={() => navigate(`/profile/${getID(member)}`)} className="p-3 bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90 border border-white/5">
                       <ArrowUpRight size={16}/>
                    </button>
                 </div>
               ))}
            </div>

            <button className="w-full mt-12 py-5 bg-white/5 border border-white/5 hover:border-indigo-500/30 text-slate-500 hover:text-white rounded-[2rem] text-[9px] font-black uppercase tracking-[0.4em] transition-all italic">Access_Full_Registry</button>
         </div>

         {/* TRENDING_PROTOCOLS */}
         <div className="glass-card p-10 bg-white/80 dark:bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-4xl">
            <h3 className="font-black text-[11px] text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic">
               <div className="w-10 h-[1px] bg-rose-500" /> Hot_Signals
            </h3>
            <div className="space-y-6">
               {["#FINANCE_SYNC", "#PROD_LATTICE", "#GLOBAL_FLEET", "#LEGAL_SHIELD"].map((tag, i) => (
                 <div key={i} className="flex justify-between items-center group cursor-pointer">
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-indigo-500 transition-colors tracking-widest italic">{tag}</span>
                    <span className="text-[8px] font-black text-slate-400 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-transparent dark:border-white/5">{120 + (i*42)} Signals</span>
                 </div>
               ))}
            </div>
         </div>
      </aside>

      {/* SYSTEM OVERLAYS */}
      <AnimatePresence>
         {isCreatorOpen && (
           <div className="fixed inset-0 z-[400] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-4xl relative"
              >
                 <button onClick={() => setIsCreatorOpen(false)} className="absolute -top-20 right-0 p-5 bg-white/5 text-white rounded-[2rem] hover:bg-rose-600 transition-all z-50 border-none shadow-4xl group">
                    <X size={28} className="group-hover:rotate-90 transition-transform" />
                 </button>
                 <UnifiedCreator 
                    initialType={creatorType}
                    onCreated={handleCreated} 
                    onClose={() => setIsCreatorOpen(false)}
                 />
              </motion.div>
           </div>
         )}
         {discussionPostId && <DiscussionTerminal postId={discussionPostId} onClose={() => setDiscussionPostId(null)} t={t} />}
         {sharingPost && <ShareModal isOpen={!!sharingPost} onClose={() => setSharingPost(null)} post={sharingPost} />}
         {activeStoryIndex !== null && <StoryViewer stories={stories} initialIndex={activeStoryIndex} onClose={() => setActiveStoryIndex(null)} />}
         <GroupProtocolModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onCreated={() => { setIsGroupModalOpen(false); fetchFeed(); }} />
         <MediaViewer url={viewerMedia?.url || null} type={viewerMedia?.type || null} onClose={() => setViewerMedia(null)} />
      </AnimatePresence>
    </div>
  );
};

const PostCard = ({ post, idx, onDiscussion, onShare, onMediaClick, onUpdate, t }: any) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [showNodeCard, setShowNodeCard] = useState(false);

  const handleVote = async (optionIndex: number) => {
    try {
      const res = await api.post(`/community/${post._id}/vote`, { optionIndex });
      onUpdate({ ...post, poll: res.data });
      toast.success("Consensus_Recorded");
    } catch (e) { toast.error("Signal_Error"); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }} 
      transition={{ delay: idx * 0.05, duration: 0.8 }} 
      className="bg-white dark:bg-slate-950/40 rounded-[3.5rem] border border-white/10 shadow-pro overflow-hidden group transition-all duration-700 relative backdrop-blur-3xl hover:border-indigo-500/30"
    >
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
       
       <div className="p-10 pb-8 flex justify-between items-start relative">
          <div className="flex gap-6">
             <div className="relative" onMouseEnter={() => setShowNodeCard(true)} onMouseLeave={() => setShowNodeCard(false)}>
                <div onClick={() => navigate(`/profile/${getID(post.author)}`)} className="w-16 h-16 rounded-[1.8rem] bg-slate-900 overflow-hidden shadow-2xl border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                   <img src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getID(post.author)}`} className="w-full h-full object-cover" alt="Avatar" />
                </div>
                <NodeCard user={post.author} isVisible={showNodeCard} onClose={() => setShowNodeCard(false)} />
             </div>
             <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                   <h4 onClick={() => navigate(`/profile/${getID(post.author)}`)} className="font-black text-xl text-slate-900 dark:text-white uppercase italic tracking-tighter cursor-pointer hover:text-indigo-600 transition-colors leading-none">{post.author?.name}</h4>
                   <div className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[6px] font-black uppercase tracking-widest mt-0.5">VERIFIED_NODE</div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{formatSignalTime(post.createdAt)} // SIGNAL_LOCKED</p>
                </div>
             </div>
          </div>
          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all shadow-xl"><MoreVertical size={24}/></button>
       </div>

       <div className="px-10 pb-8 text-lg font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-tight italic opacity-90 border-l-4 border-indigo-600/30 ml-10">
          {post.postType === "ASSET_ALERT" && (
            <div className="mb-6 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] flex items-center gap-6 relative overflow-hidden group/alert">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/alert:translate-x-full transition-transform duration-1000" />
               <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] relative z-10"><PackageIcon size={24} /></div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] leading-none mb-2 italic">Enterprise_Telemetry</p>
                  <p className="text-sm font-black text-white uppercase italic tracking-widest">Inventory_Provisioning_Detected</p>
               </div>
            </div>
          )}
          {post.content}
       </div>

       {post.mediaUrl && (
         <div className="px-6 pb-10">
            <div onClick={() => onMediaClick(post.mediaUrl, (post.mediaType === 'VIDEO' || post.postType === 'REEL') ? "VIDEO" : "IMAGE")} className={cn(
              "relative rounded-[3rem] overflow-hidden bg-slate-950 border-4 border-white/10 shadow-4xl transition-all duration-700 cursor-none group/media",
              post.postType === "REEL" ? "aspect-[9/16] max-h-[700px] w-fit mx-auto border-rose-500/20" : ""
            )}>
               {post.mediaType === "VIDEO" || post.postType === "REEL" ? <video src={post.mediaUrl || undefined} className="w-full h-full object-cover opacity-80 group-hover/media:opacity-100 transition-opacity duration-700" controls playsInline /> : <img src={post.mediaUrl || undefined} className="w-full h-auto object-contain opacity-90 group-hover/media:opacity-100 transition-opacity duration-700" alt="Payload" />}
               
               <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-none" />
               <div className="absolute bottom-10 left-10 opacity-0 group-hover/media:opacity-100 transition-all translate-y-4 group-hover/media:translate-y-0 duration-500">
                  <div className="px-6 py-3 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.4em] italic flex items-center gap-4 shadow-4xl">
                     <Activity size={14} className="text-indigo-500 animate-pulse" /> Signal_Immersive_v9.0
                  </div>
               </div>

               {post.author?.role === 'VENDOR' && (
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={(e) => { e.stopPropagation(); navigate(`/community/store/${post.tenantId}`); }}
                   className="absolute bottom-10 right-10 px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-4xl flex items-center gap-4 border-none italic group/store"
                 >
                    <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/store:translate-y-0 transition-transform duration-500" />
                    <StoreIcon size={20} className="relative z-10 group-hover/store:text-white transition-colors" /> 
                    <span className="relative z-10 group-hover/store:text-white transition-colors">Access_Store</span>
                 </motion.button>
               )}
            </div>
         </div>
       )}

       {post.poll && (
         <div className="px-10 pb-10">
            <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6 shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 scanline opacity-5 pointer-events-none" />
               <div className="flex items-center gap-4 mb-2">
                  <Vote size={20} className="text-indigo-500" />
                  <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-widest">{post.poll.question}</h5>
               </div>
               <div className="space-y-4">
                  {post.poll.options.map((opt: any, i: number) => {
                    const totalVotes = post.poll.options.reduce((a: any, b: any) => a + (b.votes?.length || 0), 0);
                    const percent = totalVotes === 0 ? 0 : Math.round(((opt.votes?.length || 0) / totalVotes) * 100);
                    const voted = opt.votes?.some((uid: any) => uid.toString() === currentUser?._id?.toString());
                    
                    return (
                      <button 
                        key={i} 
                        onClick={() => handleVote(i)}
                        className={cn(
                          "w-full p-5 rounded-2xl relative overflow-hidden transition-all group/opt border",
                          voted ? "bg-indigo-600 border-white/20" : "bg-white dark:bg-white/5 border-transparent hover:border-white/10"
                        )}
                      >
                         <div className="absolute inset-y-0 left-0 bg-indigo-500/20 transition-all duration-1000" style={{ width: `${percent}%` }} />
                         <div className="relative z-10 flex justify-between items-center">
                            <span className={cn("text-[10px] font-black uppercase italic tracking-widest", voted ? "text-white" : "text-slate-700 dark:text-slate-300")}>{opt.text}</span>
                            <span className={cn("text-[10px] font-black italic", voted ? "text-white" : "text-indigo-500")}>{percent}%</span>
                         </div>
                      </button>
                    );
                  })}
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{post.poll.options.reduce((a: any, b: any) => a + (b.votes?.length || 0), 0)} Total_Signals</span>
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic">Ends: 0x_TEMPORAL</span>
               </div>
            </div>
         </div>
       )}

       <div className="px-10 pb-10">
          <div className="pt-8 border-t border-white/5">
             <InteractionSuite 
               post={post} 
               onUpdate={onUpdate} 
               onDiscussion={onDiscussion} 
               onShare={onShare} 
             />
          </div>
       </div>
    </motion.div>
  );
};

const DiscussionTerminal = ({ postId, onClose, t }: any) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/community/${postId}/comments`).then(res => { setComments(res.data); setLoading(false); });
  }, [postId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post(`/community/${postId}/comments`, { content: text });
      setComments([...comments, res.data]); setText("");
    } catch (e) {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-[#020205]/98 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto">
       <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
       <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-[#050508] w-full max-w-4xl rounded-[3.5rem] shadow-[0_0_150px_rgba(79,70,229,0.15)] flex flex-col h-[85vh] border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none" />
          
          <header className="p-10 border-b border-white/5 flex justify-between items-center shrink-0 relative z-10 bg-slate-950">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl text-white rotate-3"><MessageSquare size={24} /></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">DISCUSSION_TERMINAL</h3>
                   <div className="flex items-center gap-3 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Signal_Thread_Active</span>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-5 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-[1.8rem] transition-all duration-500 border-none shadow-xl group">
                <X size={24} className="group-hover:rotate-90 transition-transform" />
             </button>
          </header>

          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10">
             {loading ? (
               <div className="h-full flex items-center justify-center opacity-20"><Cpu size={64} className="animate-spin text-indigo-600" /></div>
             ) : comments.map((c, i) => (
               <div key={i} className="flex gap-6 group">
                  <div className="relative shrink-0">
                     <img src={c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getID(c.author)}`} className="w-14 h-14 rounded-2xl shadow-2xl object-cover border-2 border-white/10" alt="Avatar" />
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] rounded-tl-none border border-white/5 shadow-inner group-hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-center mb-3">
                           <p className="text-xs font-black uppercase italic text-slate-900 dark:text-white tracking-tighter">{c.author?.name}</p>
                           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{formatSignalTime(c.createdAt)}</span>
                        </div>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight italic leading-relaxed opacity-90">"{c.content}"</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          <footer className="p-10 border-t border-white/5 bg-slate-950/50 relative z-10">
             <div className="flex gap-6 items-center">
                <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id}`} className="w-14 h-14 rounded-2xl shadow-2xl border-2 border-white/10" alt="Me" />
                <div className="flex-1 relative group">
                   <input 
                     value={text} 
                     onChange={(e) => setText(e.target.value)} 
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                     placeholder="Contribute_Insight_To_Registry..." 
                     className="w-full bg-white dark:bg-black/40 border-none rounded-[1.8rem] py-5 px-8 text-xs font-black italic uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all text-slate-900 dark:text-white shadow-inner" 
                   />
                </div>
                <button onClick={handleSend} className="p-5 bg-indigo-600 text-white rounded-[1.8rem] shadow-[0_15px_40px_rgba(79,70,229,0.4)] active:scale-90 transition-all border-none group">
                   <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
             </div>
          </footer>
       </motion.div>
    </motion.div>
  );
};
