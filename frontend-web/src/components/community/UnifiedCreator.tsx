import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Film, Vote, Image as ImageIcon, X, 
  ChevronRight, Sparkles, Zap, ShieldCheck, 
  Loader2, Send, Globe, Users, Hash, Video,
  Clock, AlertCircle, FileVideo, MousePointer2,
  Maximize2, Play, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

interface UnifiedCreatorProps {
  onCreated: (data: any) => void;
  onClose?: () => void;
  initialType?: "IMAGE" | "VIDEO" | "REEL" | "POLL" | "STORY";
}

export const UnifiedCreator = ({ onCreated, onClose, initialType = "IMAGE" }: UnifiedCreatorProps) => {
  const [step, setStep] = useState<"TYPE" | "CONTENT">("TYPE");
  const [type, setType] = useState<"IMAGE" | "VIDEO" | "REEL" | "POLL" | "STORY">(initialType);
  const [content, setContent] = useState("");
  const [media, setSelectedMedia] = useState<{ url: string; type: string; file: File; isVertical: boolean } | null>(null);
  const [poll, setPoll] = useState({ question: "", options: ["", ""] });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialType !== "IMAGE") setType(initialType);
  }, [initialType]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDATION_PROTOCOL
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024; // 100MB Video, 20MB Image

    if (file.size > maxSize) {
      toast.error(`PAYLOAD_TOO_HEAVY: Max ${maxSize / (1024*1024)}MB allowed.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      
      // AUTO_FORMAT_DETECTION
      if (isVideo) {
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
          const isVertical = video.videoHeight > video.videoWidth;
          if (isVertical && type === "VIDEO") setType("REEL");
          setSelectedMedia({ url, type: "VIDEO", file, isVertical });
          setStep("CONTENT");
        };
      } else {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const isVertical = img.height > img.width;
          setSelectedMedia({ url, type: "IMAGE", file, isVertical });
          setStep("CONTENT");
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploadProgress(10);
    const toastId = toast.loading(`Broadcasting ${type} Signal...`);
    
    try {
      const endpoint = type === "STORY" ? "/community/stories" : "/community";
      const payload = {
        content,
        file: media?.url,
        type: type === "REEL" || type === "STORY" ? "VIDEO" : type,
        isReel: type === "REEL",
        poll: type === "POLL" ? poll : undefined
      };
      
      // MOCK_PROGRESS_SYNC
      const progInterval = setInterval(() => {
        setUploadProgress(prev => prev < 90 ? prev + 5 : prev);
      }, 200);

      const res = await api.post(endpoint, payload);
      clearInterval(progInterval);
      setUploadProgress(100);
      
      onCreated(res.data);
      toast.success(`${type}_SYNCHRONIZED`, { id: toastId });
      if (onClose) onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "TRANSMISSION_ERROR", { id: toastId });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white dark:bg-[#020205] rounded-[3.5rem] border border-slate-100 dark:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative max-w-4xl w-full flex flex-col md:flex-row min-h-[600px]">
      <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
      
      {/* LEFT: CINEMA PREVIEW */}
      <div className={cn(
        "flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden transition-all duration-1000",
        step === "TYPE" ? "opacity-40 grayscale blur-sm" : "opacity-100"
      )}>
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-rose-600/10" />
         <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
         
         <AnimatePresence mode="wait">
            {media ? (
              <motion.div 
                key={media.url}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "relative rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-4xl group/cinema",
                  media.isVertical ? "aspect-[9/16] h-full max-h-[500px]" : "w-full aspect-video"
                )}
              >
                 {media.type === "VIDEO" ? (
                   <video src={media.url} className="w-full h-full object-cover" autoPlay muted loop />
                 ) : (
                   <img src={media.url} className="w-full h-full object-cover" />
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover/cinema:bg-transparent transition-colors duration-500" />
                 <div className="absolute top-4 right-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center gap-2">
                       <Activity size={10} className="text-indigo-500" /> RAW_DATA
                    </div>
                 </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-6 opacity-20">
                 <div className="w-24 h-24 border-2 border-dashed border-white/20 rounded-[2.5rem] flex items-center justify-center">
                    <FileVideo size={48} className="text-white" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Visual_Engine_Idle</span>
              </div>
            )}
         </AnimatePresence>
      </div>

      {/* RIGHT: CONTROL INTERFACE */}
      <div className="flex-1 p-10 md:p-16 flex flex-col justify-between relative z-10 bg-white dark:bg-[#050508] border-l border-white/5">
        <AnimatePresence mode="wait">
          {step === "TYPE" ? (
            <motion.div 
              key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Initialize <span className="text-indigo-600">Signal.</span></h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic leading-none">Select Transmission Frequency</p>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  <TypeBtn icon={<ImageIcon size={20}/>} label="Visual Asset" sub="Static_Image_Node" onClick={() => { setType("IMAGE"); fileInputRef.current?.click(); }} />
                  <TypeBtn icon={<Video size={20}/>} label="Data Stream" sub="Dynamic_Video_Sync" onClick={() => { setType("VIDEO"); fileInputRef.current?.click(); }} />
                  <TypeBtn icon={<Film size={20} className="text-rose-500"/>} label="Neural Reel" sub="Vertical_Immersion" onClick={() => { setType("REEL"); fileInputRef.current?.click(); }} />
                  <TypeBtn icon={<Clock size={20} className="text-emerald-500"/>} label="Temporal Story" sub="24h_Volatility" onClick={() => { setType("STORY"); fileInputRef.current?.click(); }} />
                  <TypeBtn icon={<Vote size={20} className="text-indigo-500"/>} label="Quantum Poll" sub="Consensus_Logic" onClick={() => { setType("POLL"); setStep("CONTENT"); }} />
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-10"
            >
               <div className="flex justify-between items-center">
                  <button onClick={() => { setStep("TYPE"); setSelectedMedia(null); }} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all group">
                     <X size={14} className="group-hover:rotate-90 transition-transform" /> TERMINATE_SOURCE
                  </button>
                  <div className="flex items-center gap-3">
                     <span className="px-4 py-1.5 bg-indigo-600/10 text-indigo-600 text-[10px] font-black rounded-xl uppercase tracking-widest italic">{type}_PROT</span>
                  </div>
               </div>

               {type === "POLL" && (
                 <div className="space-y-4 bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                    <input value={poll.question} onChange={e => setPoll({...poll, question: e.target.value})} placeholder="Logic Inquiry?" className="w-full bg-white dark:bg-black/40 rounded-2xl p-4 text-xs font-black uppercase tracking-widest border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    {poll.options.map((opt, i) => (
                      <input key={i} value={opt} onChange={e => { const o = [...poll.options]; o[i] = e.target.value; setPoll({...poll, options: o}); }} placeholder={`Logic_Gate_${i+1}`} className="w-full bg-white dark:bg-black/20 rounded-xl p-3 text-[10px] font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    ))}
                 </div>
               )}

               <div className="relative">
                  <textarea 
                    value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Enter Metadata / Forensic Tags..." 
                    className="w-full bg-slate-50 dark:bg-white/5 rounded-[2.5rem] p-8 text-sm font-bold italic outline-none border-none focus:ring-4 focus:ring-indigo-600/5 transition-all resize-none h-40 shadow-inner text-slate-900 dark:text-white"
                  />
                  <div className="absolute bottom-6 right-8 text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{content.length} / 2000</div>
               </div>

               <div className="space-y-6">
                  {loading && (
                    <div className="space-y-2">
                       <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                          <span>Synchronizing_Stream...</span>
                          <span>{uploadProgress}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                       </div>
                    </div>
                  )}

                  <button 
                    disabled={loading || (!media && type !== "POLL")} onClick={handleSubmit}
                    className="w-full group relative py-8 bg-slate-950 dark:bg-white text-white dark:text-indigo-600 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] shadow-4xl hover:bg-emerald-500 hover:text-white transition-all duration-500 active:scale-95 flex items-center justify-center gap-6 overflow-hidden border-none"
                  >
                     <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     {loading ? <Loader2 size={24} className="animate-spin relative z-10" /> : <><Send size={24} className="relative z-10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform"/> <span className="relative z-10">AUTHORIZE_BROADCAST</span></>}
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input 
        type="file" ref={fileInputRef} 
        className="hidden" 
        accept={type === 'IMAGE' ? 'image/*' : 'video/*'} 
        onChange={handleMediaSelect} 
      />
    </div>
  );
};

const TypeBtn = ({ icon, label, sub, onClick }: any) => (
  <button 
    onClick={onClick} 
    className="flex items-center gap-6 p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-indigo-500/30 hover:bg-white dark:hover:bg-white/10 transition-all group active:scale-95 text-left w-full"
  >
     <div className="p-4 bg-white dark:bg-[#020205] rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform text-indigo-600 border border-transparent dark:border-white/5">{icon}</div>
     <div>
        <p className="text-xs font-black uppercase italic text-slate-900 dark:text-white">{label}</p>
        <p className="text-[7px] font-black uppercase tracking-widest text-slate-500 mt-1 opacity-60 italic">{sub}</p>
     </div>
     <ChevronRight size={16} className="ml-auto text-slate-400 group-hover:translate-x-2 transition-transform" />
  </button>
);


