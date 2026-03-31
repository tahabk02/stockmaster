import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  User as UserIcon, Mail, ShieldCheck, Activity, LogOut, History as HistoryIcon, Globe, Settings as SettingsIcon,
  Edit, Camera, X, Check, Phone, Briefcase, UserPlus, UserCheck, MessageSquare, PhoneCall,
  ArrowLeft, Zap, Target, Sparkles, Cpu, Clock, ExternalLink, Grid, Film, Bookmark, Play, Heart, MessageCircle,
  Download
} from "lucide-react";
import { useAuth } from "../store/auth.slice";
import { useTenant } from "../store/tenant.slice";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { cn } from "../lib/utils";
import { MediaViewer } from "../components/ui/MediaViewer";

export const Profile = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("POSTS");
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);
  
  const isOwnProfile = !id || id === (currentUser?.id || currentUser?._id);

  const [formData, setFormData] = useState({
    name: "", phone: "", bio: "", jobTitle: "", avatar: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const targetId = id || (currentUser?.id || currentUser?._id);
      
      // 1. Fetch User Profile
      const res = await api.get(`/users/profile/${targetId}`);
      const userData = res.data.data;
      setProfileUser(userData);
      setIsFollowing(userData.isFollowing);
      
      if (isOwnProfile) {
        setFormData({
          name: userData.name,
          phone: userData.phone || "",
          bio: userData.bio || "",
          jobTitle: userData.jobTitle || "",
          avatar: ""
        });
      }

      // 2. Fetch User Posts
      const postsRes = await api.get(`/community/user/${targetId}`);
      setPosts(postsRes.data.data || postsRes.data || []);

    } catch (e) {
      toast.error(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }, [id, currentUser, isOwnProfile, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${profileUser._id}/follow`);
      setIsFollowing(res.data.isFollowing);
      setProfileUser({
        ...profileUser,
        followersCount: res.data.isFollowing ? (profileUser.followersCount + 1) : (profileUser.followersCount - 1)
      });
      toast.success(res.data.isFollowing ? "Node Coupled" : "Signal Decoupled");
    } catch (e) { toast.error("Handshake Failed"); }
  };

  const handleMessage = async () => {
    try {
      const res = await api.post("/chat/conversations", { participantId: profileUser._id });
      navigate(`/messages?conv=${res.data._id}`);
    } catch (e) { toast.error("Channel Error"); }
  };

  const handleSave = async () => {
    try {
      const payload: any = { ...formData };
      if (!formData.avatar) delete payload.avatar;
      const res = await api.put("/auth/profile", payload);
      const updated = res.data.data;
      setCurrentUser({ ...currentUser, ...updated });
      setProfileUser({ ...profileUser, ...updated });
      toast.success(t('common.success'));
      setIsEditing(false);
    } catch (error: any) { toast.error(t('errors.serverError')); }
  };

  const isRtl = i18n.language === 'ar';

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center bg-transparent">
       <Cpu size={60} className="text-indigo-600 animate-spin mb-6" />
       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 animate-pulse">{t('common.loading')}</p>
    </div>
  );

  return (
    <div className={cn("w-full space-y-12 pb-32 px-4 transition-all duration-500 font-sans", isRtl ? 'text-right' : 'text-left')}>
      
      {/* 1. CINEMATIC IDENTITY CARD */}
      <header className="relative bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 border border-slate-100 dark:border-white/5 shadow-3xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] -mr-80 -mt-80" />
        
        <div className={cn("relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20", isRtl && "md:flex-row-reverse")}>
          {/* Avatar Block */}
          <div className="relative shrink-0">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-[3rem] p-[3px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-700">
               <div className="w-full h-full rounded-[2.8rem] bg-white dark:bg-slate-900 p-1 overflow-hidden">
                  <img src={profileUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser?._id}`} className="w-full h-full object-cover rounded-[2.6rem]" alt="Identity" />
               </div>
            </div>
            <div className={cn("absolute -bottom-2 bg-emerald-500 p-4 rounded-[1.5rem] shadow-2xl border-4 border-white dark:border-slate-900", isRtl ? "-left-2" : "-right-2")}>
              <ShieldCheck size={24} className="text-white" />
            </div>
          </div>

          <div className={cn("flex-1 space-y-8 text-center md:text-left", isRtl && "md:text-right")}>
            <div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none mb-4">{profileUser?.name}</h1>
               <div className={cn("flex flex-wrap justify-center md:justify-start gap-3 items-center", isRtl && "md:justify-end flex-row-reverse")}>
                  <span className="px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-xl uppercase tracking-widest">{profileUser?.role}</span>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] italic">{profileUser?.jobTitle || "Active Node"}</p>
               </div>
            </div>

            <div className={cn("flex justify-center md:justify-start gap-12 text-slate-400 border-y border-slate-50 dark:border-white/5 py-8", isRtl && "md:justify-end flex-row-reverse")}>
               <div className={cn("text-center md:text-left", isRtl && "md:text-right")}>
                  <p className="text-2xl font-black italic text-slate-900 dark:text-white leading-none">{posts.length}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500 mt-1">Signals</p>
               </div>
               <div className={cn("text-center md:text-left", isRtl && "md:text-right")}>
                  <p className="text-2xl font-black italic text-slate-900 dark:text-white leading-none">{profileUser?.followersCount || 0}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500 mt-1">Network</p>
               </div>
               <div className={cn("text-center md:text-left", isRtl && "md:text-right")}>
                  <p className="text-2xl font-black italic text-slate-900 dark:text-white leading-none">{profileUser?.followingCount || 0}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500 mt-1">Coupled</p>
               </div>
            </div>

            <div className={cn("flex flex-wrap justify-center md:justify-start gap-4", isRtl && "md:justify-end flex-row-reverse")}>
               {isOwnProfile ? (
                 <>
                   <button onClick={() => setIsEditing(true)} className="px-10 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-3">{t('common.edit')}</button>
                   <button onClick={() => navigate("/settings")} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><SettingsIcon size={20}/></button>
                 </>
               ) : (
                 <>
                   <button onClick={handleFollow} className={cn("px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl", isFollowing ? 'bg-slate-50 dark:bg-white/5 text-slate-400 border border-slate-100 dark:border-white/5' : 'bg-indigo-600 text-white shadow-indigo-500/20')}>
                      {isFollowing ? <><UserCheck size={16}/> Node Linked</> : <><UserPlus size={16}/> Link Node</>}
                   </button>
                   <button onClick={handleMessage} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 border border-white/5">Comms</button>
                   <button className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"><PhoneCall size={20}/></button>
                 </>
               )}
            </div>
          </div>
        </div>

        <div className={cn("mt-12 md:pl-[300px]", isRtl && "md:pl-0 md:pr-[300px]")}>
           <p className={cn("text-sm font-bold text-slate-600 dark:text-slate-300 italic uppercase tracking-tight opacity-80 leading-relaxed max-w-2xl bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border-indigo-600", isRtl ? "border-r-4 text-right" : "border-l-4")}>
              "{profileUser?.bio || "Operational frequency active. No bio-metric data available."}"
           </p>
        </div>
      </header>

      {/* 2. GRID HUB */}
      <div className="space-y-8">
         <div className={cn("flex items-center justify-center gap-12 border-t border-slate-50 dark:border-white/5 pt-4", isRtl && "flex-row-reverse")}>
            <TabBtn active={activeTab === "POSTS"} onClick={() => setActiveTab("POSTS")} icon={<Grid size={16}/>} label="Signals" />
            <TabBtn active={activeTab === "REELS"} onClick={() => setActiveTab("REELS")} icon={<Film size={16}/>} label="Reels" />
            {isOwnProfile && <TabBtn active={activeTab === "SAVED"} onClick={() => setActiveTab("SAVED")} icon={<Bookmark size={16}/>} label="Vault" />}
         </div>

         {activeTab === "POSTS" && (
           <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
              {posts.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-30">
                   <Zap size={48} className="mx-auto mb-4" />
                   <p className="font-black uppercase text-xs tracking-widest">{t('common.noData')}</p>
                </div>
              ) : posts.map((post) => (
                <motion.div 
                  key={post._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden relative group cursor-pointer"
                  onClick={() => post.mediaUrl && setViewerMedia({ url: post.mediaUrl, type: (post.mediaType === 'VIDEO' || post.postType === 'REEL') ? "VIDEO" : "IMAGE" })}
                >
                   {post.mediaUrl ? (
                     <>
                       { (post.mediaType === 'VIDEO' || post.postType === 'REEL') ? (
                         <video src={post.mediaUrl || undefined} className="w-full h-full object-cover" />
                       ) : (
                         <img src={post.mediaUrl || undefined} className="w-full h-full object-cover" />
                       )}
                       <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white backdrop-blur-sm">
                          <div className="flex items-center gap-2 font-black"><Heart size={20} fill="white" /> {post.likesCount}</div>
                          <div className="flex items-center gap-2 font-black"><MessageCircle size={20} fill="white" /> {post.commentsCount}</div>
                       </div>
                       {post.postType === "REEL" && <Film size={20} className="absolute top-4 right-4 text-white drop-shadow-lg" />}
                     </>
                   ) : (
                     <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                        <p className="text-xs font-bold italic line-clamp-4 uppercase">"{post.content}"</p>
                        <div className="flex justify-between items-center opacity-60">
                           <span className="text-[8px] font-black uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</span>
                           <Activity size={14} />
                        </div>
                     </div>
                   )}
                </motion.div>
              ))}
           </div>
         )}
      </div>

      <MediaViewer url={viewerMedia?.url || null} type={viewerMedia?.type || null} onClose={() => setViewerMedia(null)} />

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
              <div className={cn("p-10 border-b border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white font-black italic uppercase tracking-tighter", isRtl && "flex-row-reverse")}>
                <h2 className={cn("text-2xl flex items-center gap-4", isRtl && "flex-row-reverse")}><Edit className="text-indigo-600" /> {t('common.edit')}</h2>
                <button onClick={() => setIsEditing(false)} className="p-4 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-lg"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => (document.getElementById('avatar-input') as any).click()}>
                    <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-indigo-600 shadow-2xl">
                       <img src={formData.avatar || profileUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser?._id}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"><Camera className="text-white" size={40} /></div>
                    <input id="avatar-input" type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({...formData, avatar: reader.result as string}); reader.readAsDataURL(file); } }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput label={t('products.fields.name')} value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} isRtl={isRtl} />
                  <FormInput label="Job Title" value={formData.jobTitle} onChange={(e:any) => setFormData({...formData, jobTitle: e.target.value})} isRtl={isRtl} />
                  <div className="md:col-span-2">
                    <label className={cn("text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block italic", isRtl && "text-right")}>Bio</label>
                    <textarea value={formData.bio} onChange={(e:any) => setFormData({...formData, bio: e.target.value})} className={cn("w-full p-6 bg-slate-50 dark:bg-slate-950 border border-white/5 rounded-3xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] shadow-inner", isRtl && "text-right")} placeholder="..." />
                  </div>
                </div>
              </div>
              <div className={cn("p-8 bg-slate-50 dark:bg-slate-950 border-t border-white/5 flex justify-end gap-4", isRtl && "flex-row-reverse")}>
                 <button onClick={() => setIsEditing(false)} className="px-8 py-4 rounded-xl font-black uppercase text-[10px] text-slate-500 hover:text-slate-900 transition-colors">{t('common.cancel')}</button>
                 <button onClick={handleSave} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-500 transition-all">{t('common.submit')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={cn("flex items-center gap-3 pb-4 px-2 border-b-2 transition-all", active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600")}>
     {icon} <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

const FormInput = ({ label, isRtl, ...props }: any) => (
  <div className="space-y-2">
     <label className={cn("text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 block italic", isRtl && "text-right")}>{label}</label>
     <input {...props} className={cn("w-full p-5 bg-slate-50 dark:bg-slate-950 border border-white/5 rounded-2xl font-bold text-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner", isRtl && "text-right")} />
  </div>
);

export default Profile;
