import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Bot, Info, RefreshCcw, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../store/auth.slice";
import { socketService } from "../services/socket.service";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

// --- Modular Components ---
import { ConversationList } from "../components/chat/ConversationList";
import { MessageStream } from "../components/chat/MessageStream";
import { MessageInput } from "../components/chat/MessageInput";
import { NodeDetailSidebar } from "../components/chat/NodeDetailSidebar";
import { GroupProtocolModal } from "../components/chat/GroupProtocolModal";
import { MediaViewer } from "../components/ui/MediaViewer";
import type { ConversationData, MessageData, UserProfile } from "../components/chat/ConversationList";

const LIYA_ID = "000000000000000000000000";

const getID = (obj: any): string | null => {
  if (!obj) return null;
  if (typeof obj === "string") return obj;
  return (obj._id || obj.id || obj).toString();
};

export const Messages = () => {
  const { user, token } = useAuth();
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"MESSAGES" | "CORE" | "SQUAD">("MESSAGES");
  const [activeConversation, setActiveConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState<MessageData | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ url: string; type: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "IMAGE" | "VIDEO" } | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations"); setConversations(res.data);
      const convId = searchParams.get("conv");
      if (convId && !activeConversation) { const target = res.data.find((c: any) => c._id === convId); if (target) setActiveConversation(target); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [searchParams, activeConversation]);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const res = await api.get(`/chat/messages/${id}`); setMessages(res.data);
      setTimeout(scrollToBottom, 50); await api.post(`/chat/mark-as-read/${id}`); fetchConversations();
    } catch (e) { console.error(e); }
  }, [scrollToBottom, fetchConversations]);

  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }
    fetchConversations();
    socketService.on("newMessage", (msg: any) => {
      if (getID(activeConversation) === getID(msg.conversationId)) { setMessages(prev => [...prev, msg]); setTimeout(scrollToBottom, 100); api.post(`/chat/mark-as-read/${msg.conversationId}`); }
      fetchConversations();
    });
    socketService.on("userStatus", ({ userId, status }:any) => { setOnlineUsers(prev => { const next = new Set(prev); if (status === "ONLINE") next.add(userId); else next.delete(userId); return next; }); });
    return () => { socketService.off("newMessage"); socketService.off("userStatus"); };
  }, [token, user, activeConversation, fetchConversations, scrollToBottom]);

  useEffect(() => { if (activeConversation) fetchMessages(activeConversation._id); }, [activeConversation, fetchMessages]);

  const getOther = (conv: ConversationData): UserProfile | null => conv.isGroup ? null : (conv.otherParticipant || conv.participants.find((p:UserProfile) => getID(p) !== getID(user)) || null);

  const sendMessage = async (overriddenPayload?: any) => {
    if (!newMessage.trim() && !selectedFile && !overriddenPayload) return;
    try {
      const payload = overriddenPayload || { conversationId: activeConversation?._id, content: newMessage, file: selectedFile?.url, type: selectedFile?.type === 'image' ? 'IMAGE' : selectedFile?.type === 'video' ? 'VIDEO' : selectedFile?.type === 'audio' ? 'AUDIO' : 'TEXT', replyTo: replyingTo?._id };
      const res = await api.post("/chat/messages", payload);
      setMessages(prev => [...prev, res.data]); setNewMessage(""); setSelectedFile(null); setReplyingTo(null);
      const other = getOther(activeConversation!); if (other && getID(other) !== LIYA_ID && !activeConversation?.isGroup) socketService.emit("sendMessage", { to: getID(other), message: res.data });
      setTimeout(scrollToBottom, 50); if (getID(other) === LIYA_ID) setTimeout(() => fetchMessages(activeConversation!._id), 2000);
    } catch (e) { toast.error("Failed"); }
  };

  const isRtl = i18n.language === 'ar';

  if (loading) return <div className="h-screen flex items-center justify-center opacity-20"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-[#020617] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 relative group/lattice">
      <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
      <div className="scanline opacity-20" />

      <ConversationList 
 conversations={conversations} activeConversation={activeConversation} setActiveConversation={setActiveConversation} onlineUsers={onlineUsers} activeTab={activeTab} setActiveTab={setActiveTab} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onOpenGroup={()=>setIsGroupModalOpen(true)} onStartLiya={async ()=>{ try { const res = await api.post("/chat/conversations", { participantId: LIYA_ID }); setActiveConversation(res.data); setActiveTab("MESSAGES"); } catch (e) { toast.error("AI Link Failed"); } }} getID={getID} getOther={getOther} LIYA_ID={LIYA_ID} isRtl={isRtl} />

      <div className={cn("flex-1 flex flex-col bg-slate-50 dark:bg-[#0b141a] relative transition-all", !activeConversation ? 'hidden md:flex' : 'flex')}>
         {activeConversation ? (
           <>
             <header className="p-6 md:p-10 bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-2xl border-b border-white/5 flex justify-between items-center z-20 shadow-2xl">
                <div className="flex items-center gap-6">
                   <button onClick={() => setActiveConversation(null)} className="lg:hidden p-3 bg-slate-100 dark:bg-[#111b21] rounded-2xl text-slate-400 border-none bg-transparent active:scale-90"><ChevronLeft size={24}/></button>
                   <div className="min-w-0" onClick={() => setShowDetails(!showDetails)}>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">{activeConversation.isGroup ? activeConversation.name : getOther(activeConversation)?.name}</h3>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {activeConversation.isGroup ? `${activeConversation.participants.length} Active Nodes` : "Active Protocol"}</div>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => activeConversation && fetchMessages(activeConversation._id)} className="p-4 bg-slate-50 dark:bg-[#111b21] text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border-none bg-transparent active:scale-90 shadow-sm group/refresh">
                      <RefreshCcw size={20} className={cn("transition-transform duration-700 group-hover/refresh:rotate-180", loading && "animate-spin")} />
                   </button>
                   <button onClick={() => setShowDetails(!showDetails)} className={cn("p-4 rounded-2xl transition-all border-none bg-transparent active:scale-90", showDetails ? "bg-indigo-600 text-white shadow-xl" : "bg-slate-50 dark:bg-[#111b21] text-slate-400")}><Info size={20}/></button>
                </div>
             </header>
             <MessageStream messages={messages} user={user} getID={getID} onReply={setReplyingTo} onReaction={setShowReactionPicker} onMediaView={(url, type)=>setViewerMedia({url, type})} toggleReaction={async (id, emoji)=>{ try { const res = await api.patch(`/chat/messages/${id}/reaction`, { emoji }); setMessages(prev => prev.map(m => m._id === id ? { ...m, reactions: res.data } : m)); setShowReactionPicker(null); } catch (e) { toast.error("Failed"); } }} showReactionPicker={showReactionPicker} messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>} />
             <MessageInput newMessage={newMessage} setNewMessage={setNewMessage} onSendMessage={sendMessage} onFileSelect={()=>fileInputRef.current?.click()} isRecording={isRecording} recordingDuration={recordingDuration} onStartRecording={async ()=>{ try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const mr = new MediaRecorder(stream); mediaRecorderRef.current = mr; audioChunksRef.current = []; mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); }; mr.onstop = async () => { const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); const reader = new FileReader(); reader.readAsDataURL(blob); reader.onloadend = async () => { sendMessage({ conversationId: activeConversation?._id, file: reader.result as string, type: "AUDIO" }); }; stream.getTracks().forEach(track => track.stop()); }; mr.start(); setIsRecording(true); setRecordingDuration(0); timerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000); } catch (err) { toast.error("Denied"); } }} onStopRecording={()=>{ if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(timerRef.current); } }} onCancelRecording={()=>{ setIsRecording(false); clearInterval(timerRef.current); if (mediaRecorderRef.current) mediaRecorderRef.current.stop(); }} replyingTo={replyingTo} setReplyingTo={setReplyingTo} isRtl={isRtl} />
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-30 relative z-10">
              <div className="p-16 bg-white dark:bg-slate-900 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col items-center">
                 <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center mb-10 shadow-3xl rotate-3"><Bot size={64} color="white" /></div>
                 <h2 className="text-3xl font-black uppercase italic tracking-[0.5em] text-slate-950 dark:text-white mb-4">Secure Link.</h2>
                 <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 text-center max-w-sm">Awaiting node handshake.</p>
              </div>
           </div>
         )}
      </div>

      <AnimatePresence>{showDetails && activeConversation && <NodeDetailSidebar activeConversation={activeConversation} activeOther={getOther(activeConversation)} onClose={()=>setShowDetails(false)} onNavigateProfile={(id)=>navigate(`/profile/${id}`)} getID={getID} isRtl={isRtl} />}</AnimatePresence>
      <GroupProtocolModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onCreated={() => { setIsGroupModalOpen(false); fetchConversations(); }} />
      <MediaViewer url={viewerMedia?.url || null} type={viewerMedia?.type || null} onClose={() => setViewerMedia(null)} />
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setSelectedFile({ url: reader.result as string, type: file.type.split('/')[0] }); reader.readAsDataURL(file); } }} />
    </div>
  );
};

export default Messages;
