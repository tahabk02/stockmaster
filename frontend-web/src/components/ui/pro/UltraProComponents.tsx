import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { Activity, Shield, Cpu, Zap, ArrowUpRight, ChevronRight, Hash, Globe, Clock, Terminal as TerminalIcon } from 'lucide-react';

// --- MAGNETIC INTERACTION (THEME AWARE) ---
export const MagneticWrapper = ({ children, strength = 0.2 }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * strength);
    y.set((clientY - (top + height / 2)) * strength);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ x: springX, y: springY }}>
      {children}
    </motion.div>
  );
};

// --- ZENITH COMMAND PANEL ---
export const CommandPanel = ({ children, title, icon: Icon, className }: any) => (
  <div className={cn(
    "relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-white/10",
    "bg-white/70 dark:bg-slate-950/20 backdrop-blur-3xl shadow-sm dark:shadow-pro",
    className
  )}>
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={14} className="text-indigo-500" />}
        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] italic">{title}</span>
      </div>
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// --- HARD DATA TICKER ---
export const SovereignTicker = () => {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setTime(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-y border-slate-200/60 dark:border-white/5 py-4 overflow-hidden flex whitespace-nowrap z-50">
      <motion.div 
        animate={{ x: [0, -2000] }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="flex gap-32 items-center px-20"
      >
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="flex gap-16 items-center">
            <div className="flex items-center gap-4">
              <Hash size={10} className="text-indigo-500" />
              <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase italic tracking-tighter">BLOCK_0x{time.toString(16).slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-4">
              <Globe size={10} className="text-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase italic tracking-tighter">NODE_SYNC_STABLE</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock size={10} className="text-rose-500" />
              <span className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase italic tracking-tighter">UNIX_{Math.floor(time/1000)}</span>
            </div>
            <span className="text-indigo-600 font-black text-[10px] opacity-20 tracking-[1em]">/////////////////////</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- BENTO BOX (PRO THEME ADAPTIVE) ---
export const BentoBox = ({ children, className, title, subtitle, icon: Icon, delay = 0, num, color = "indigo", bgImage, onClickImage, details, tags }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    viewport={{ once: true }}
    className={cn(
      "relative overflow-hidden p-10 group transition-all duration-700 shadow-sm dark:shadow-xl",
      "bg-white dark:bg-[#0C0C1A] border border-slate-200/60 dark:border-white/5",
      "hover:border-indigo-500/40 hover:shadow-md dark:hover:shadow-indigo-500/10",
      className
    )}
  >
    {bgImage && (
      <div 
        className="absolute inset-0 z-0 cursor-zoom-in"
        onClick={() => onClickImage?.({ url: bgImage, title, subtitle, details, tags })}
      >
        <img src={bgImage} alt="" className="w-full h-full object-cover opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform duration-[2s] grayscale group-hover:grayscale-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent" />
      </div>
    )}

    {num && <span className="absolute bottom-[-20px] right-4 font-display text-[100px] text-indigo-600 opacity-[0.04] dark:opacity-[0.06] pointer-events-none group-hover:opacity-[0.1] transition-opacity">{num}</span>}
    
    <div className="relative z-10 h-full flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className={cn("w-12 h-12 chamfer-sm flex items-center justify-center transition-all duration-500 shadow-inner bg-slate-50 dark:bg-white/5", `text-${color}-600 dark:text-${color}-400 group-hover:bg-${color}-600 group-hover:text-white`)}>
            {Icon && <Icon size={24} />}
          </div>
          <span className="font-mono text-[8px] font-black text-slate-500 dark:text-white/20 uppercase tracking-widest">FEAT_0x{(delay * 100).toFixed(0)}</span>
        </div>
        <div>
          <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white mb-2 uppercase italic">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{subtitle}</p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between items-end">
         <div className="inline-block font-mono text-[8px] px-3 py-1 border border-slate-200/60 dark:border-white/5 rounded-sm text-slate-500 dark:text-slate-600 uppercase tracking-widest group-hover:border-indigo-500/30 group-hover:text-indigo-500 transition-colors">
            Node_Sync_Active
         </div>
         <ArrowUpRight size={18} className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors" />
      </div>
    </div>
    {children}
  </motion.div>
);

// --- MONUMENTAL TITLES (THEME ADAPTIVE) ---
export const KineticTitle = ({ children, className }: any) => (
  <h1 className={cn(
    "font-display text-[14vw] lg:text-[12rem] leading-[0.85] tracking-[-2px] uppercase select-none",
    "bg-clip-text text-transparent bg-gradient-to-b from-slate-950 via-slate-800 to-slate-600 dark:from-white dark:via-white dark:to-white/10",
    className
  )}>
    {children}
  </h1>
);

// --- VOICE SIGNAL BUTTON (THEME ADAPTIVE) ---
export const VoiceButton = ({ children, onClick, className, variant = "primary" }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "group relative px-12 py-6 chamfer-btn font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-500",
        variant === "primary" 
          ? "bg-slate-950 text-white dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 shadow-2xl" 
          : "bg-white/50 dark:bg-transparent border border-slate-300 dark:border-indigo-500/30 text-slate-900 dark:text-white hover:border-slate-900 dark:hover:border-white",
        className
      )}
    >
      <div className="relative z-10 flex items-center justify-center gap-5">
        {children}
        <div className="flex gap-1 h-4 items-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={isHovered ? { height: [2, 16, 2] } : { height: 2 }}
              transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.05 }}
              className="w-0.5 bg-current rounded-full opacity-50"
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.button>
  );
};

// --- SYSTEM TERMINAL (THEME ADAPTIVE) ---
export const SystemTerminal = () => {
  const [lines, setLines] = useState<string[]>(["INIT_OS_BOOT...", "ATTACHING_CORE...", "LATTICE_SYNC_OK"]);
  useEffect(() => {
    const commands = ["ENCRYPT_BLOCK_0xAF", "SYNC_TENANT", "AUDIT_REGISTER_COMPLETE", "NEURAL_ZENITH"];
    const interval = setInterval(() => {
      setLines(prev => [...prev.slice(-2), `${commands[Math.floor(Math.random()*commands.length)]}... [OK]`]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="w-full bg-slate-100 dark:bg-[#0C0C1A] border border-slate-200 dark:border-white/5 p-6 font-mono overflow-hidden shadow-xl dark:shadow-2xl rounded-2xl">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-3 mb-4">
        <TerminalIcon size={12} className="text-indigo-600 dark:text-indigo-500" />
        <span className="text-[9px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest italic">Live_System_Log</span>
      </div>
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4 items-center">
            <span className="text-[8px] text-slate-400 dark:text-white/20">[{i}]</span>
            <span className="text-[10px] text-slate-700 dark:text-white/60 font-bold uppercase tracking-tighter">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- KINETIC DIVIDER (THEME ADAPTIVE) ---
export const KineticDivider = () => (
  <div className="w-full h-32 relative overflow-hidden flex items-center justify-center border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#06060F]">
    <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-20">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-600 dark:via-indigo-500 to-transparent scale-x-150" />
    </div>
    <div className="flex gap-40 items-center">
      {["PROTOCOL_V4.2", "LATTICE_SECURE", "CORE_ZENITH"].map((text, i) => (
        <div key={i} className="flex items-center gap-3 opacity-40 dark:opacity-60">
          <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-500 rounded-full animate-ping" />
          <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white uppercase tracking-[1em] italic">{text}</span>
        </div>
      ))}
    </div>
  </div>
);
