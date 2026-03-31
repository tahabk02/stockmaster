import React from "react";
import { Search, Users, Bot, Activity, ShieldCheck } from "lucide-react";
import { cn, formatSignalTime } from "../../lib/utils";
import { motion } from "framer-motion";
import { PulseNode } from "../team/TeamUI";

export interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  avatar?: string;
  jobTitle?: string;
  role: string;
  email?: string;
  tenantId?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface MessageData {
  _id: string;
  conversationId: string;
  sender: UserProfile | string;
  content: string;
  mediaUrl?: string;
  mediaType: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "AUDIO" | "CALL";
  replyTo?: MessageData;
  readBy: string[];
  reactions: { userId: string; emoji: string }[];
  createdAt: string;
}

export interface ConversationData {
  _id: string;
  participants: UserProfile[];
  lastMessage?: MessageData;
  updatedAt: string;
  unreadCount: number;
  otherParticipant?: UserProfile;
  isGroup?: boolean;
  name?: string;
  avatar?: string;
  description?: string;
}

interface ConversationListProps {
  conversations: ConversationData[];
  activeConversation: ConversationData | null;
  setActiveConversation: (c: ConversationData) => void;
  onlineUsers: Set<string>;
  activeTab: string;
  setActiveTab: (t: "MESSAGES" | "CORE" | "SQUAD") => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onOpenGroup: () => void;
  onStartLiya: () => void;
  getID: (obj: any) => string | null;
  getOther: (conv: ConversationData) => UserProfile | null;
  LIYA_ID: string;
  isRtl: boolean;
}

export const ConversationList = (props: ConversationListProps) => {
  const { 
    conversations, activeConversation, setActiveConversation, onlineUsers,
    activeTab, setActiveTab, searchTerm, setSearchTerm, onOpenGroup, 
    onStartLiya, getID, getOther, LIYA_ID, isRtl 
  } = props;

  return (
    <div className={cn(
      "w-full md:w-[380px] xl:w-[420px] flex flex-col border-r border-white/5 transition-all shrink-0 bg-slate-950/20 backdrop-blur-3xl",
      activeConversation ? 'hidden lg:flex' : 'flex'
    )}>
       {/* COMMAND HEADER */}
       <div className="p-8 bg-slate-900/40 border-b border-white/5 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="flex justify-between items-center mb-8 relative z-10">
             <div className="flex items-center gap-3">
                <PulseNode color="indigo" />
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural <span className="text-indigo-500">Comms.</span></h2>
             </div>
             <div className="flex gap-2">
                <button onClick={onOpenGroup} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-indigo-500 transition-all border-none bg-transparent hover:bg-white/10 shadow-xl"><Users size={18}/></button>
                <button onClick={onStartLiya} className="p-3 bg-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white hover:bg-indigo-500 transition-all flex items-center gap-2 border-none active:scale-95">
                  <Bot size={18}/> <span className="text-[8px] font-black uppercase tracking-widest">AI_SYNC</span>
                </button>
             </div>
          </div>

          <div className="relative group mb-6 z-10">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-all" size={16} />
             <input 
               placeholder="DECODE NODE IDENTITY..." 
               className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[9px] font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner placeholder:text-slate-700" 
               value={searchTerm} 
               onChange={e => setSearchTerm(e.target.value)} 
             />
          </div>

          <div className="flex gap-2 z-10 relative">
             {(["MESSAGES", "CORE", "SQUAD"] as const).map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)} 
                 className={cn(
                   "flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border border-white/5 relative overflow-hidden",
                   activeTab === tab ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" : "bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
                 )}
               >
                 {tab}
                 {activeTab === tab && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
               </button>
             ))}
          </div>
       </div>

       {/* CONVERSATION STREAM */}
       <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
          {conversations.map((conv, idx) => {
            const other = getOther(conv);
            const isActive = activeConversation?._id === conv._id;
            const online = other ? onlineUsers.has(getID(other)!) : false;
            const isLiya = other ? getID(other) === LIYA_ID : false;

            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={conv._id} 
                onClick={() => setActiveConversation(conv)} 
                className={cn(
                  "p-6 cursor-pointer flex items-center gap-5 transition-all relative border-b border-white/5 group",
                  isActive ? "bg-indigo-600/20 border-l-4 border-l-indigo-500 z-10" : "hover:bg-white/5"
                )}
              >
                 <div className="relative shrink-0">
                    <div className={cn("absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity", (online || isLiya) ? "bg-emerald-500/20" : "bg-indigo-500/20")} />
                    {conv.isGroup ? (
                      <div className="w-16 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-2xl relative z-10">
                         <Users size={24} className="text-indigo-400" />
                      </div>
                    ) : isLiya ? (
                      <div className="w-16 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden group-hover:rotate-3 transition-transform">
                         <Bot size={28} color="white" className="animate-pulse" />
                         <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                      </div>
                    ) : (
                      <img 
                        src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getID(other)}`} 
                        className="w-16 h-14 rounded-2xl object-cover shadow-2xl relative z-10 border border-white/10 group-hover:scale-105 transition-transform" 
                        alt="" 
                      />
                    )}
                    {!conv.isGroup && (
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#020617] z-20 transition-all",
                        (online || isLiya) ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-slate-600"
                      )}>
                         {(online || isLiya) && <div className="w-full h-full rounded-full animate-ping bg-emerald-400 opacity-40" />}
                      </div>
                    )}
                 </div>

                 <div className="flex-1 min-w-0 relative z-10">
                    <div className={cn("flex justify-between items-center mb-1.5", isRtl && "flex-row-reverse")}>
                       <div className="flex items-center gap-2 overflow-hidden">
                          <h4 className="font-black text-xs uppercase italic truncate leading-none text-white group-hover:text-indigo-400 transition-colors tracking-tighter">
                            {conv.isGroup ? conv.name : other?.name}
                          </h4>
                          {!conv.isGroup && other && (
                            <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[6px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline-block">
                               AUTH_{other.role.slice(0,3)}
                            </span>
                          )}
                       </div>
                       <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest shrink-0">{conv.lastMessage ? formatSignalTime(conv.lastMessage.createdAt) : ''}</span>
                    </div>
                    <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
                       {conv.lastMessage?.sender === 'ai' && <Activity size={10} className="text-indigo-500 shrink-0" />}
                       <p className="text-[10px] font-bold truncate uppercase tracking-tight italic text-slate-400 group-hover:text-slate-300 transition-colors opacity-60">
                         {conv.lastMessage?.content || 'Awaiting Signal Handshake...'}
                       </p>
                    </div>
                 </div>

                 {conv.unreadCount > 0 && !isActive && (
                   <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-indigo-500 blur-md animate-pulse" />
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-black text-white relative z-10 shadow-lg">{conv.unreadCount}</div>
                   </div>
                 )}
              </motion.div>
            )
          })}
       </div>
    </div>
  );
};
