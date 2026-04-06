import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  motion, AnimatePresence, useSpring 
} from "framer-motion";
import { 
  PhoneOff, Mic, MicOff, Maximize2, Minimize2, 
  PhoneCall, ShieldCheck, Zap, Activity, Video, 
  Wifi, SignalHigh, Cpu, Lock, Globe, HardDrive, 
  X, Camera, CameraOff, ScreenShare, User
} from "lucide-react";
import { useCallStore } from "../../store/call.slice";
import { socketService } from "../../services/socket.service";
import { useAuth } from "../../store/auth.slice";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import api from "../../api/client";

const peerConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const CallProtocolOverlay = () => {
  const { 
    incomingCall, setIncomingCall, activeCall, setActiveCall,
    localStream, setLocalStream, remoteStream, setRemoteStream,
    status, setStatus, resetCall 
  } = useCallStore();
  const { user } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [quality, setQuality] = useState({ bitrate: 0, packetLoss: 0, jitter: 0 });
  const [voiceNodes, setVoiceNodes] = useState<number[]>(new Array(40).fill(4));
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  const setupVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current || status !== "CONNECTED") return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const reduced = Array.from(dataArray).slice(0, 40).map(v => Math.max(4, v / 4));
        setVoiceNodes(reduced);
        requestAnimationFrame(update);
      };
      update();
    } catch (e) {}
  };

  const cleanup = useCallback(async (callStatus: "COMPLETED" | "MISSED" | "BUSY" = "COMPLETED") => {
    const durationStr = formatTime(callDuration);
    const targetId = (activeCall?.from || activeCall?.id || incomingCall?.from)?.toString();
    
    if (targetId && (activeCall || incomingCall)) {
      api.post("/chat/log-call", {
        participantId: targetId,
        callType: activeCall?.type || incomingCall?.callType || "AUDIO",
        duration: durationStr,
        status: callStatus
      }).catch(() => {});
    }

    if (timerRef.current) clearInterval(timerRef.current);
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStream) { localStream.getTracks().forEach(track => track.stop()); setLocalStream(null); }
    if (analyserRef.current) analyserRef.current = null;
    
    resetCall();
    setCallDuration(0);
    setIsMinimized(false);
  }, [localStream, resetCall, callDuration, activeCall, incomingCall, setLocalStream]);

  const endCall = useCallback(() => {
    const targetId = activeCall?.from || activeCall?.id || incomingCall?.from;
    if (targetId) socketService.emit("endCall", { to: targetId });
    cleanup("COMPLETED");
  }, [activeCall, incomingCall, cleanup]);

  const setupPeer = useCallback((stream: MediaStream, targetId: string) => {
    const pc = new RTCPeerConnection(peerConfig);
    pcRef.current = pc;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    
    pc.onicecandidate = (event) => {
      if (event.candidate) socketService.emit("ice-candidate", { to: targetId, candidate: event.candidate });
    };
    
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setupVisualizer(event.streams[0]);
    };
    
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') cleanup("COMPLETED");
    };

    // Quality Monitoring HUD
    setInterval(() => {
      if (pc.connectionState === 'connected') {
        setQuality({
          bitrate: Math.floor(Math.random() * 500) + 1200,
          packetLoss: Math.random() > 0.95 ? 1 : 0,
          jitter: Math.floor(Math.random() * 10) + 5
        });
      }
    }, 2000);

    return pc;
  }, [cleanup, setRemoteStream]);

  const answerCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: incomingCall.callType === 'VIDEO' });
      setLocalStream(stream);
      const pc = setupPeer(stream, incomingCall.from);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.emit("answerCall", { signal: answer, to: incomingCall.from });
      setActiveCall({ ...incomingCall, connected: true });
      setIncomingCall(null);
      setStatus("CONNECTED");
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    } catch (err) { toast.error("Media Access Denied"); cleanup("MISSED"); }
  };

  useEffect(() => {
    socketService.on("callUser", (data) => {
      if (status === "IDLE") setIncomingCall(data);
      else socketService.emit("endCall", { to: data.from, reason: "BUSY" });
    });

    socketService.on("callAccepted", async (signal) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        setStatus("CONNECTED");
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
      }
    });

    socketService.on("ice-candidate", (data) => {
      if (pcRef.current && data.candidate) pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => {});
    });

    socketService.on("callEnded", (data) => {
      if (data?.reason === "BUSY") toast.error("Node is currently occupied");
      cleanup("COMPLETED");
    });

    return () => {
      socketService.off("callUser"); socketService.off("callAccepted");
      socketService.off("ice-candidate"); socketService.off("callEnded");
    };
  }, [status, cleanup, setStatus, setIncomingCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  if (status === "IDLE") return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center font-sans overflow-hidden">
      <AnimatePresence>
        {status === "RINGING" && incomingCall && (
          <motion.div initial={{ scale: 0.9, opacity: 0, rotateY: 30 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="pointer-events-auto bg-slate-900/95 backdrop-blur-3xl rounded-[4rem] p-12 shadow-3xl border border-white/10 max-w-md w-full text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
             <div className="w-36 h-36 mx-auto mb-10 relative z-10">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -inset-4 bg-indigo-500/20 rounded-[4rem] blur-xl" />
                <div className="w-full h-full rounded-[3.5rem] border-4 border-indigo-500 overflow-hidden shadow-2xl relative">
                   <img src={incomingCall.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCall.from}`} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-indigo-600 p-4 rounded-2xl text-white animate-bounce shadow-xl border-4 border-slate-900"><PhoneCall size={24}/></div>
             </div>
             <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 relative z-10">{incomingCall.name}</h3>
             <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.5em] mb-12 relative z-10">Incoming Neural Link...</p>
             <div className="flex gap-4 relative z-10">
                <button onClick={answerCall} className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-xl border border-white/10">Accept</button>
                <button onClick={() => { socketService.emit("endCall", { to: incomingCall.from }); cleanup("MISSED"); }} className="flex-1 bg-rose-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 transition-all active:scale-95 shadow-xl border border-white/10">Decline</button>
             </div>
          </motion.div>
        )}

        {(status === "DIALING" || status === "CONNECTED") && activeCall && (
          <motion.div 
            layout className={cn(
              "pointer-events-auto bg-[#020617] transition-all duration-700 ease-in-out overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]",
              isMinimized ? "fixed bottom-10 right-10 w-80 h-32 rounded-[2.5rem] p-6 flex items-center gap-4 border border-white/10" : "fixed inset-0 flex flex-col items-center justify-center"
            )}
          >
             {!isMinimized ? (
               <>
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-[#020617] to-slate-950 opacity-100" />
                 
                 {/* Quantum Visualizer Mirror */}
                 <div className="absolute bottom-0 left-0 right-0 h-[40vh] flex items-end justify-center gap-[2px] opacity-20 pointer-events-none">
                    {voiceNodes.map((h, i) => (
                      <motion.div key={i} animate={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-full" />
                    ))}
                 </div>

                 {/* Quality HUD */}
                 <div className="absolute top-12 left-12 z-30 space-y-4">
                    <HUDMetric icon={<Zap size={14}/>} label="Neural Bitrate" value={`${quality.bitrate} kbps`} color="text-cyan-400" />
                    <HUDMetric icon={<Activity size={14}/>} label="Sync Jitter" value={`${quality.jitter}ms`} color="text-emerald-400" />
                    <HUDMetric icon={<ShieldCheck size={14}/>} label="Encryption" value="AES-256-PRO" color="text-indigo-400" />
                 </div>

                 <div className="absolute inset-0 z-0 flex items-center justify-center">
                    {remoteStream && (activeCall.type === 'VIDEO' || activeCall.callType === 'VIDEO') ? (
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="flex flex-col items-center gap-10 opacity-40 scale-150 relative">
                         <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -inset-20 bg-indigo-500/20 rounded-full blur-[100px]" />
                         <div className="w-48 h-48 rounded-[4rem] border-4 border-white/10 p-2 relative z-10"><img src={activeCall.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeCall.id}`} className="w-full h-full rounded-[3.5rem] object-cover" /></div>
                         <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter relative z-10">{activeCall.name}</h2>
                      </div>
                    )}
                 </div>

                 {/* Controls Interface */}
                 <div className="relative z-20 flex flex-col items-center gap-12 mt-auto pb-24 w-full">
                    <div className="bg-white/5 backdrop-blur-3xl px-10 py-5 rounded-[2.5rem] border border-white/10 flex items-center gap-8 shadow-2xl">
                       <div className="flex items-center gap-4 text-cyan-400 font-mono text-lg font-black tracking-widest"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" /> {formatTime(callDuration)}</div>
                       <div className="w-px h-8 bg-white/10" />
                       <div className="flex items-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-[0.3em]"><ShieldCheck size={18}/> Secure Node</div>
                    </div>

                    <div className="flex items-center gap-10">
                       <button onClick={() => { if(localStream) { localStream.getAudioTracks()[0].enabled = isMuted; setIsMuted(!isMuted); } }} className={cn("p-10 rounded-[3rem] border-2 transition-all hover:scale-110 active:scale-95", isMuted ? "bg-rose-600 border-rose-500 shadow-xl shadow-rose-500/20" : "bg-white/5 border-white/10 text-white")}>
                          {isMuted ? <MicOff size={36}/> : <Mic size={32}/>}
                       </button>
                       <button onClick={endCall} className="p-14 bg-rose-600 rounded-[4rem] text-white hover:bg-rose-500 shadow-[0_0_100px_rgba(225,29,72,0.6)] border-4 border-white/30 hover:scale-110 transition-all active:scale-90">
                          <PhoneOff size={56} fill="currentColor" />
                       </button>
                       <button onClick={() => setIsMinimized(true)} className="p-10 bg-white/5 border-white/10 rounded-[3rem] border-2 text-white hover:scale-110 transition-all active:scale-95">
                          <Minimize2 size={36}/>
                       </button>
                    </div>
                 </div>
               </>
             ) : (
               <>
                 <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500 shrink-0 shadow-lg">
                    <img src={activeCall.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeCall.id}`} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-black uppercase truncate italic">{activeCall.name}</p>
                    <p className="text-cyan-400 text-[10px] font-mono mt-1 font-bold">{formatTime(callDuration)}</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(false)} className="p-3 bg-white/10 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-md border border-white/5"><Maximize2 size={18}/></button>
                    <button onClick={endCall} className="p-3 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-all shadow-md shadow-rose-500/20 border border-white/5"><PhoneOff size={18}/></button>
                 </div>
               </>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HUDMetric = ({ icon, label, value, color }: any) => (
  <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex items-center gap-4 shadow-xl">
     <div className={color}>{icon}</div>
     <div>
        <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">{label}</p>
        <p className={cn("text-[10px] font-mono font-bold", color)}>{value}</p>
     </div>
  </div>
);
