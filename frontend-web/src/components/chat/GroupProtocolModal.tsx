import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, X, Check } from "lucide-react";
import api from "../../api/client";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

interface GroupProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const GroupProtocolModal = ({ isOpen, onClose, onCreated }: GroupProtocolModalProps) => {
  const [form, setForm] = useState({ name: "", description: "", participants: [] as string[] });
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api.get("/users?global=true").then(res => {
        setNodes(res.data.data || res.data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!form.name || form.participants.length === 0) {
      return toast.error("Configuration Incomplete");
    }
    try {
      await api.post("/chat/groups", form);
      toast.success("Group Protocol Synchronized");
      onCreated();
    } catch (e) {
      toast.error("Sync Failure");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }} 
         className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 shadow-3xl border border-white/5 relative"
       >
          <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-rose-500 transition-colors">
            <X size={24}/>
          </button>
          
          <div className="flex items-center gap-6 mb-10">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
              <Users size={28}/>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Squad <span className="text-indigo-600">Provision.</span></h3>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Unit Designation</p>
                <input 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="Squad Alpha-1..." 
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-5 text-sm font-bold italic outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all dark:text-white shadow-inner" 
                />
             </div>

             <div className="space-y-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Node Selection</p>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                   {loading ? (
                     <div className="animate-pulse text-indigo-600 text-center py-4 font-black uppercase text-[10px]">Scanning Registry...</div>
                   ) : nodes.map(n => (
                     <div 
                       key={n._id} 
                       onClick={() => {
                         const p = form.participants.includes(n._id) 
                           ? form.participants.filter(id => id !== n._id) 
                           : [...form.participants, n._id];
                         setForm({...form, participants: p});
                       }}
                       className={cn(
                         "p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border",
                         form.participants.includes(n._id) 
                           ? "bg-indigo-600 text-white border-indigo-400 shadow-lg" 
                           : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:border-white/10"
                       )}
                     >
                        <img src={n.avatar} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="Node" />
                        <p className="text-xs font-black uppercase italic truncate">{n.name}</p>
                        {form.participants.includes(n._id) && <Check size={14} className="ml-auto" />}
                     </div>
                   ))}
                </div>
             </div>

             <button 
               onClick={handleSubmit} 
               className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all mt-4 shadow-indigo-500/20"
             >
               Authorize Squad Handshake
             </button>
          </div>
       </motion.div>
    </div>
  );
};
