import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Command, ArrowRight, Box, Users, 
  FileText, Settings, LogOut, Zap, Shield, 
  TrendingUp, MessageSquare, Plus, Globe as GlobeIcon
} from "lucide-react";
import { useAuth } from "../../store/auth.slice";
import { cn } from "../../lib/utils";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  section: "NAVIGATION" | "ACTION" | "SYSTEM";
}

export const CommandNexus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const commands: CommandItem[] = [
    // Navigation
    { id: "nav-dash", label: "Go to Dashboard", icon: <Zap size={16}/>, section: "NAVIGATION", action: () => navigate("/dashboard") },
    { id: "nav-inv", label: "Inventory Registry", icon: <Box size={16}/>, section: "NAVIGATION", action: () => navigate("/inventory") },
    { id: "nav-comm", label: "Neural Community", icon: <GlobeIcon size={16}/>, section: "NAVIGATION", action: () => navigate("/community") },
    { id: "nav-sales", label: "Sales Matrix", icon: <TrendingUp size={16}/>, section: "NAVIGATION", action: () => navigate("/sales") },
    { id: "nav-team", label: "Squad Management", icon: <Users size={16}/>, section: "NAVIGATION", action: () => navigate("/team") },
    
    // Actions
    { id: "act-new-prod", label: "Register Asset", icon: <Plus size={16}/>, section: "ACTION", action: () => navigate("/inventory?action=new") },
    { id: "act-broadcast", label: "Broadcast Signal", icon: <MessageSquare size={16}/>, section: "ACTION", action: () => navigate("/community?action=new") },
    
    // System
    { id: "sys-settings", label: "System Configuration", icon: <Settings size={16}/>, section: "SYSTEM", action: () => navigate("/settings") },
    { id: "sys-logout", label: "Terminate Session", icon: <LogOut size={16}/>, section: "SYSTEM", action: () => logout() },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  // Toggle with Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard Navigation inside List
  useEffect(() => {
    const handleListNav = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
          setIsOpen(false);
          setQuery("");
        }
      }
    };
    window.addEventListener("keydown", handleListNav);
    return () => window.removeEventListener("keydown", handleListNav);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus Input on Open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(99,102,241,0.15)] overflow-hidden flex flex-col max-h-[60vh]"
      >
        {/* Search Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
           <Search size={20} className="text-indigo-500" />
           <input 
             ref={inputRef}
             value={query}
             onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
             placeholder="Execute protocol or navigate..."
             className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-white placeholder:text-slate-500 placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.2em]"
           />
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ESC</span>
           </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2" ref={listRef}>
           {filteredCommands.length === 0 ? (
             <div className="py-12 text-center opacity-40">
                <Command size={48} className="mx-auto mb-4 text-indigo-500" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">No matching protocols found</p>
             </div>
           ) : (
             filteredCommands.map((cmd, i) => (
               <motion.div
                 key={cmd.id}
                 initial={false}
                 onClick={() => { cmd.action(); setIsOpen(false); }}
                 onMouseEnter={() => setSelectedIndex(i)}
                 className={cn(
                   "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border border-transparent",
                   i === selectedIndex ? "bg-indigo-600 text-white border-indigo-400/30 shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:bg-white/5"
                 )}
               >
                  <div className="flex items-center gap-4">
                     <div className={cn("p-2 rounded-lg", i === selectedIndex ? "bg-white/20" : "bg-white/5")}>
                        {cmd.icon}
                     </div>
                     <div>
                        <p className="text-sm font-bold tracking-tight">{cmd.label}</p>
                        <p className="text-[8px] uppercase tracking-[0.2em] opacity-60">{cmd.section}</p>
                     </div>
                  </div>
                  {i === selectedIndex && <ArrowRight size={16} className="animate-pulse" />}
               </motion.div>
             ))
           )}
        </div>

        <div className="px-6 py-3 bg-white/5 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
           <span>Neural Nexus v4.2</span>
           <div className="flex gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
