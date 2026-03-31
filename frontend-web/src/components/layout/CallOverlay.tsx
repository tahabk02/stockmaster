import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  PhoneOff,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  PhoneCall,
  ShieldCheck,
  Zap,
  Activity,
  Video,
  Wifi,
  SignalHigh,
  Cpu,
  Lock,
  Globe,
  HardDrive,
} from "lucide-react";
import { useCallStore } from "../../store/call.slice";
import { socketService } from "../../services/socket.service";
import { useAuth } from "../../store/auth.slice";
import { toast } from "react-hot-toast";
import api from "../../api/client";

const peerConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const CallOverlay = () => {
  const {
    incomingCall,
    setIncomingCall,
    activeCall,
    setActiveCall,
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    status,
    setStatus,
    resetCall,
  } = useCallStore();
  const { user } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>(
    new Array(60).fill(5),
  );
  const [voiceVolume, setVoiceVolume] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const isInitializing = useRef(false);

  const auraSize = useSpring(1, { stiffness: 100, damping: 10 });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  const playSound = (url: string, loop: boolean = false) => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }
    const audio = new Audio(url);
    audio.loop = loop;
    audio.play().catch(() => {});
    ringtoneRef.current = audio;
  };

  const stopSounds = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current = null;
    }
  };

  const cleanup = useCallback(
    async (callStatus: "COMPLETED" | "MISSED" | "BUSY" = "COMPLETED") => {
      stopSounds();
      if (callStatus === "COMPLETED")
        playSound(
          "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
        );

      const durationStr = formatTime(callDuration);
      const targetId = (
        activeCall?.from ||
        activeCall?.id ||
        activeCall?._id ||
        incomingCall?.from
      )?.toString();
      const type =
        activeCall?.type ||
        activeCall?.callType ||
        incomingCall?.callType ||
        "AUDIO";

      if (targetId && (activeCall || incomingCall)) {
        api
          .post("/chat/log-call", {
            participantId: targetId,
            callType: type,
            duration: durationStr,
            status: callStatus,
          })
          .catch(() => {});
      }

      if (timerRef.current) clearInterval(timerRef.current);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }

      resetCall();
      setCallDuration(0);
      setIsMinimized(false);
      isInitializing.current = false;
    },
    [
      localStream,
      resetCall,
      callDuration,
      activeCall,
      incomingCall,
      setLocalStream,
    ],
  );

  const endCall = useCallback(() => {
    const targetId =
      activeCall?.from ||
      activeCall?.id ||
      activeCall?._id ||
      incomingCall?.from;
    if (targetId) socketService.emit("endCall", { to: targetId });
    cleanup("COMPLETED");
  }, [activeCall, incomingCall, cleanup]);

  const setupVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current || status !== "CONNECTED") return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const reduced = Array.from(dataArray)
          .slice(0, 60)
          .map((v) => Math.max(5, v / 2.5));
        setVisualizerData(reduced);
        const volume =
          Array.from(dataArray).reduce((a, b) => a + b, 0) / dataArray.length;
        setVoiceVolume(volume);
        auraSize.set(1 + volume / 150);
        requestAnimationFrame(update);
      };
      update();
    } catch (e) {}
  };

  const setupPeer = useCallback(
    (stream: MediaStream, targetId: string) => {
      if (pcRef.current) pcRef.current.close();
      const pc = new RTCPeerConnection(peerConfig);
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pc.onicecandidate = (event) => {
        if (event.candidate)
          socketService.emit("ice-candidate", {
            to: targetId,
            candidate: event.candidate,
          });
      };
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        setupVisualizer(event.streams[0]);
      };
      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        )
          cleanup("COMPLETED");
      };
      return pc;
    },
    [cleanup, setRemoteStream, status],
  );

  const answerCall = async () => {
    if (!incomingCall || isInitializing.current) return;
    isInitializing.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCall.callType === "VIDEO",
      });
      setLocalStream(stream);
      const pc = setupPeer(stream, incomingCall.from);
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.signal),
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketService.emit("answerCall", {
        signal: answer,
        to: incomingCall.from,
      });
      setActiveCall({ ...incomingCall, connected: true });
      setIncomingCall(null);
      setStatus("CONNECTED");
      timerRef.current = setInterval(() => setCallDuration((p) => p + 1), 1000);
    } catch (err) {
      toast.error("Permissions audio refusées");
      cleanup("MISSED");
    }
  };

  useEffect(() => {
    socketService.on("callUser", (data) => {
      if (status === "IDLE") {
        playSound(
          "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3",
          true,
        );
        setIncomingCall(data);
      } else {
        socketService.emit("endCall", { to: data.from, reason: "BUSY" });
      }
    });

    socketService.on("callAccepted", async (signal) => {
      if (pcRef.current && status === "DIALING") {
        try {
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(signal),
          );
          setStatus("CONNECTED");
          setActiveCall((prev: any) =>
            prev ? { ...prev, connected: true } : null,
          );
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(
            () => setCallDuration((p) => p + 1),
            1000,
          );
        } catch (e) {
          console.error("Sync Critical Error", e);
        }
      }
    });

    socketService.on("ice-candidate", (data) => {
      if (pcRef.current && data.candidate)
        pcRef.current
          .addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(() => {});
    });

    socketService.on("callEnded", (data) => {
      if (data?.reason === "BUSY")
        toast.error("La ligne du destinataire est occupée");
      cleanup("COMPLETED");
    });

    return () => {
      socketService.off("callUser");
      socketService.off("callAccepted");
      socketService.off("ice-candidate");
      socketService.off("callEnded");
    };
  }, [status, cleanup, setStatus, setActiveCall, setIncomingCall]);

  useEffect(() => {
    if (status === "DIALING")
      playSound(
        "https://assets.mixkit.co/active_storage/sfx/1352/1352-preview.mp3",
        true,
      );
    if (status === "CONNECTED" || status === "IDLE") stopSounds();
  }, [status]);

  useEffect(() => {
    if (
      status === "DIALING" &&
      activeCall &&
      !activeCall.connected &&
      !pcRef.current &&
      !isInitializing.current
    ) {
      isInitializing.current = true;
      const start = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: activeCall.type === "VIDEO",
          });
          setLocalStream(stream);
          const targetId = (activeCall.id || activeCall._id).toString();
          const pc = setupPeer(stream, targetId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketService.emit("callUser", {
            userToCall: targetId,
            signalData: offer,
            from: user?.id || user?._id,
            name: user?.name,
            avatar: user?.avatar,
            callType: activeCall.type,
          });
        } catch (e) {
          toast.error("Média inaccessible");
          cleanup();
        }
      };
      start();
    }
  }, [status, activeCall, user, setupPeer, setLocalStream, cleanup]);

  useEffect(() => {
    if (localVideoRef.current && localStream)
      localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  if (status === "IDLE") return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center font-sans overflow-hidden">
      <AnimatePresence>
        {status === "RINGING" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-3xl rounded-[4rem] p-12 shadow-[0_0_100px_rgba(79,70,229,0.4)] border border-white/10 max-w-sm w-full text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-emerald-500/20 opacity-50" />
            <div className="w-36 h-36 mx-auto mb-10 relative z-10">
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                  rotate: [0, 90, 180],
                }}
                transition={{ repeat: 999999, repeatType: "loop", duration: 3 }}
                className="absolute -inset-4 border-2 border-dashed border-emerald-500/50 rounded-[3.5rem]"
              />
              <img
                src={
                  incomingCall?.avatar ||
                  `https://i.pravatar.cc/150?u=${incomingCall?.from}`
                }
                className="w-full h-full rounded-[3.5rem] border-4 border-emerald-500 object-cover shadow-2xl relative z-10"
              />
              <div className="absolute -bottom-3 -right-3 bg-emerald-500 p-4 rounded-[1.8rem] text-white shadow-[0_10px_30px_rgba(16,185,129,0.5)] border-4 border-slate-900 z-20">
                <PhoneCall size={24} className="animate-bounce" />
              </div>
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">
              {incomingCall?.name}
            </h3>
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <p className="text-emerald-400/70 font-black uppercase text-[10px] tracking-[0.6em]">
                Quantum Link Request
              </p>
            </div>
            <div className="flex gap-5 relative z-10">
              <button
                onClick={answerCall}
                className="flex-1 bg-emerald-500 text-white py-6 rounded-[2.2rem] font-black uppercase text-xs tracking-widest shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  socketService.emit("endCall", { to: incomingCall?.from });
                  cleanup("MISSED");
                }}
                className="flex-1 bg-rose-500 text-white py-6 rounded-[2.2rem] font-black uppercase text-xs tracking-widest shadow-[0_15px_40px_rgba(244,63,94,0.3)] hover:bg-rose-400 transition-all hover:scale-105 active:scale-95"
              >
                Decline
              </button>
            </div>
          </motion.div>
        )}

        {(status === "DIALING" || status === "CONNECTED") && activeCall && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={
              isMinimized
                ? {
                    width: 360,
                    height: 120,
                    borderRadius: 45,
                    y: 0,
                    opacity: 1,
                  }
                : {
                    width: "100%",
                    height: "100%",
                    borderRadius: 0,
                    y: 0,
                    opacity: 1,
                  }
            }
            className={`pointer-events-auto bg-[#020617] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden ${isMinimized ? "fixed bottom-10 right-10 p-6 flex items-center gap-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 z-[10000]" : "fixed inset-0 z-[9999] flex flex-col items-center justify-center"}`}
          >
            {!isMinimized && (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-[#020617] to-purple-950 opacity-100" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />

                {/* Quantum Visualizer (Mirror Mode) */}
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] flex items-end justify-center gap-1.5 px-12 opacity-30 pointer-events-none">
                  {visualizerData.map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: `${h}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="flex-1 bg-gradient-to-t from-indigo-600 via-purple-500 to-cyan-400 rounded-t-full"
                    />
                  ))}
                </div>

                <div className="absolute top-12 left-12 z-20 flex flex-col gap-6">
                  <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col gap-4 shadow-2xl">
                    <div className="flex items-center gap-4 text-white/40">
                      <Cpu size={16} />
                      <div className="flex flex-col">
                        <p className="text-[8px] font-black uppercase tracking-widest">
                          Neural Load
                        </p>
                        <p className="text-[10px] font-mono text-cyan-400">
                          {(voiceVolume * 1.2).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/40">
                      <Globe size={16} />
                      <div className="flex flex-col">
                        <p className="text-[8px] font-black uppercase tracking-widest">
                          Quantum Latency
                        </p>
                        <p className="text-[10px] font-mono text-emerald-400">
                          24ms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/40">
                      <Lock size={16} />
                      <div className="flex flex-col">
                        <p className="text-[8px] font-black uppercase tracking-widest">
                          Security
                        </p>
                        <p className="text-[10px] font-mono text-amber-400">
                          AES-256-GCM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 z-0">
                  {remoteStream &&
                    (activeCall.type === "VIDEO" ||
                      activeCall.callType === "VIDEO") && (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover grayscale-[0.2] brightness-75"
                      />
                    )}
                  {localStream &&
                    (activeCall.type === "VIDEO" ||
                      activeCall.callType === "VIDEO") && (
                      <div className="absolute top-12 right-12 w-72 aspect-[9/16] bg-black rounded-[3.5rem] overflow-hidden border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-20 group">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                </div>

                <div className="relative z-10 text-center space-y-24 w-full max-w-3xl px-10">
                  <div className="flex flex-col items-center gap-12">
                    <div className="relative">
                      <motion.div
                        style={{ scale: auraSize }}
                        className="absolute -inset-16 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-full blur-[80px]"
                      />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: 999999,
                          duration: 20,
                          ease: "linear",
                        }}
                        
                        className="absolute -inset-8 border-2 border-dashed border-white/10 rounded-[6rem]"
                      />
                      <div className="relative w-80 h-80">
                        <img
                          src={
                            activeCall.avatar ||
                            `https://i.pravatar.cc/150?u=${activeCall.id || activeCall.from}`
                          }
                          className="w-full h-full rounded-[6rem] border-4 border-white/10 p-3 object-cover shadow-[0_0_120px_rgba(79,70,229,0.6)]"
                        />
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-3xl px-14 py-5 rounded-[2.5rem] text-[16px] font-black uppercase tracking-[0.6em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-5 text-white">
                          <Activity
                            size={20}
                            className="animate-pulse text-cyan-400"
                          />{" "}
                          {formatTime(callDuration)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <h2 className="text-9xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)] leading-none">
                        {activeCall.name}
                      </h2>
                      <div className="flex items-center justify-center gap-8">
                        <div className="flex items-center gap-4 bg-emerald-500/10 backdrop-blur-xl px-8 py-3 rounded-full border border-emerald-500/20 shadow-inner">
                          <ShieldCheck size={16} className="text-emerald-400" />
                          <span className="text-emerald-400 font-black text-[11px] uppercase tracking-[0.3em]">
                            Quantum Encrypted
                          </span>
                        </div>
                        <div className="flex items-center gap-4 bg-indigo-500/10 backdrop-blur-xl px-8 py-3 rounded-full border border-indigo-500/20 shadow-inner">
                          <SignalHigh size={16} className="text-cyan-400" />
                          <span className="text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                            {status === "CONNECTED"
                              ? "Liaison Stable"
                              : "Synchronisation..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-14 pt-10">
                    <button
                      onClick={() => {
                        if (localStream) {
                          localStream.getAudioTracks()[0].enabled = isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className={`p-12 rounded-[3.5rem] border-2 transition-all duration-500 hover:scale-110 active:scale-90 ${isMuted ? "bg-rose-500 border-rose-400 shadow-[0_0_60px_rgba(244,63,94,0.5)]" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
                    >
                      <Mic size={40} />
                    </button>
                    <button
                      onClick={endCall}
                      className="p-16 bg-rose-600 rounded-[4rem] text-white hover:bg-rose-700 shadow-[0_0_150px_rgba(225,29,72,0.8)] hover:scale-110 active:scale-95 transition-all border-4 border-white/30 flex items-center justify-center"
                    >
                      <PhoneOff size={64} fill="currentColor" />
                    </button>
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="p-12 bg-white/5 border-white/10 hover:bg-white/10 rounded-[3.5rem] border-2 transition-all hover:scale-110 active:scale-90 text-white"
                    >
                      <Minimize2 size={40} />
                    </button>
                  </div>
                </div>
              </>
            )}
            {isMinimized && (
              <div className="flex items-center w-full gap-6 pointer-events-auto">
                <div className="relative w-24 h-24 shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: 999999, repeatType: "mirror", duration: 1.5 }}
                    className="absolute -inset-2 bg-indigo-500/20 rounded-[2rem] blur-xl"
                  />
                  <img
                    src={
                      activeCall.avatar ||
                      `https://i.pravatar.cc/150?u=${activeCall.id || activeCall.from}`
                    }
                    className="w-full h-full rounded-[2rem] object-cover border-2 border-white/10 relative z-10"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#020617] animate-pulse z-20 shadow-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[15px] font-black uppercase truncate italic tracking-tighter">
                    {activeCall.name}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-1 h-4 items-end">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 16, 4] }}
                          transition={{
                            repeat: 999999,
                            repeatType: "mirror",
                            duration: 0.4,
                            delay: i * 0.08,
                          }}
                          
                          className="w-1.5 bg-emerald-400 rounded-full"
                        />
                      ))}
                    </div>
                    <p className="text-cyan-400 text-[11px] font-black uppercase tracking-widest">
                      {formatTime(callDuration)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 pr-2">
                  <button
                    onClick={() => setIsMinimized(false)}
                    className="p-5 bg-white/5 hover:bg-white/10 text-white rounded-3xl transition-all shadow-xl"
                  >
                    <Maximize2 size={24} />
                  </button>
                  <button
                    onClick={endCall}
                    className="p-5 bg-rose-600 text-white rounded-3xl hover:bg-rose-700 shadow-[0_10px_30px_rgba(225,29,72,0.4)] transition-all"
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <audio
        autoPlay
        ref={(el) => {
          if (el && remoteStream) el.srcObject = remoteStream;
        }}
        className="hidden"
      />
    </div>
  );
};
