import React from "react";
import { motion } from "framer-motion";
import { CheckCheck, Reply, Smile, PhoneCall } from "lucide-react";
import { cn } from "../../lib/utils";
import { NeuralAudioPlayer } from "../ui/NeuralAudioPlayer";
import type { MessageData } from "./ConversationList";

interface MessageStreamProps {
  messages: MessageData[];
  user: any;
  getID: (obj: any) => string | null;
  onReply: (msg: MessageData) => void;
  onReaction: (id: string) => void;
  onMediaView: (url: string, type: "IMAGE" | "VIDEO") => void;
  toggleReaction: (id: string, emoji: string) => void;
  showReactionPicker: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ReactionPicker = ({ onSelect }: { onSelect: (e: string) => void }) => (
  <motion.div initial={{ scale: 0.8, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="absolute bottom-full mb-2 flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-3xl border border-white/10 z-[110]">
     {['👍', '❤️', '🔥', '😂', '😮', '😢'].map(emoji => (
       <button key={emoji} onClick={() => onSelect(emoji)} className="text-xl hover:scale-125 transition-transform p-1 border-none bg-transparent">{emoji}</button>
     ))}
  </motion.div>
);

export const MessageStream = (props: MessageStreamProps) => {
  const { 
    messages, user, getID, onReply, onReaction, onMediaView, 
    toggleReaction, showReactionPicker, messagesEndRef 
  } = props;

  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar relative z-10">
       {messages.map((msg, i) => {
         const isMe = getID(msg.sender) === getID(user);
         const isAudio = msg.mediaType === "AUDIO";
         const isCall = msg.mediaType === "CALL";
         return (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg._id || i} className={cn("flex group/msg", isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                "max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-[2rem] shadow-2xl relative transition-all border",
                isMe 
                  ? "bg-indigo-600 text-white border-indigo-400/30 rounded-tr-none" 
                  : "bg-white/5 dark:bg-[#202c33] dark:text-white border-white/5 rounded-tl-none",
                isCall && "bg-slate-900 border-indigo-500/30 text-white"
              )}>
                 <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none" />
                 
                 {!isCall && (
                   <div className={cn("absolute top-0 opacity-0 group-hover/msg:opacity-100 transition-all flex gap-1 z-20", isMe ? "right-full mr-4" : "left-full ml-4")}>
                      <button onClick={() => onReply(msg)} className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl shadow-xl border-none"><Reply size={14}/></button>
                      <div className="relative">
                         <button onClick={() => onReaction(msg._id)} className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl shadow-xl border-none"><Smile size={14}/></button>
                         {showReactionPicker === msg._id && <ReactionPicker onSelect={(emoji: string) => toggleReaction(msg._id, emoji)} />}
                      </div>
                   </div>
                 )}

                 <div className={cn("flex items-center gap-2 mb-2 opacity-40", isMe ? "justify-end" : "justify-start")}>
                    <span className="text-[6px] font-black uppercase tracking-[0.2em]">{isMe ? 'Local_Node' : 'Remote_Signal'}</span>
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    <span className="text-[6px] font-black uppercase tracking-[0.2em]">SIG_ID_{msg._id?.slice(-6).toUpperCase()}</span>
                 </div>

                 {msg.replyTo && (
                   <div className="mb-3 p-3 rounded-xl bg-black/20 border-l-4 border-indigo-500 backdrop-blur-md">
                      <p className="text-[9px] font-bold italic line-clamp-1 opacity-60">RE: "{msg.replyTo.content}"</p>
                   </div>
                 )}

                 {msg.mediaUrl && !isAudio && (
                   <div className="mb-3 rounded-2xl overflow-hidden shadow-2xl bg-black/20 cursor-pointer border border-white/10" onClick={() => onMediaView(msg.mediaUrl!, msg.mediaType as any)}>
                      {msg.mediaType === "VIDEO" ? <video src={msg.mediaUrl} className="w-full max-h-[300px]" /> : <img src={msg.mediaUrl} className="w-full max-h-[300px] object-contain" alt="" />}
                   </div>
                 )}

                 {isAudio && <NeuralAudioPlayer url={msg.mediaUrl!} isMe={isMe} />}
                 {isCall && (
                    <div className="flex items-center gap-4 py-2"><div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400"><PhoneCall size={20}/></div><p className="text-xs font-black uppercase tracking-widest">{msg.content}</p></div>
                 )}
                 {msg.content && !isCall && <p className="text-[13px] font-medium leading-relaxed italic tracking-tight relative z-10">"{msg.content}"</p>}
                 
                 {msg.reactions?.length > 0 && (
                   <div className={cn("flex flex-wrap gap-1 mt-4", isMe ? "justify-end" : "justify-start")}>
                      {Array.from(new Set(msg.reactions.map((r:any) => r.emoji))).map((emoji:any) => (
                        <button key={emoji} onClick={() => toggleReaction(msg._id, emoji)} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] flex items-center gap-1.5 hover:bg-white/10 transition-colors border-none">{emoji} <span className="text-[8px] font-black opacity-40">{msg.reactions.filter((r:any) => r.emoji === emoji).length}</span></button>
                      ))}
                   </div>
                 )}

                 <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-white/5 opacity-30">
                    <span className="text-[6px] font-black uppercase tracking-[0.3em]">Status: Verified</span>
                    <div className="flex items-center gap-2">
                       <p className="text-[7px] font-black uppercase tracking-[0.2em]">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                       {isMe && <CheckCheck size={10} className="text-emerald-400" />}
                    </div>
                 </div>
              </div>
           </motion.div>
         )
       })}
       <div ref={messagesEndRef} />
    </div>
  );
};
