import React, { useState, useEffect, useCallback } from "react";
import { Bell, Info, Trash2, ShieldCheck } from "lucide-react";
import api from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTenant } from "../../store/tenant.slice";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { socketService } from "../../services/socket.service";

interface Notification {
  _id: string; title: string; message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'STOCK_ALERT' | 'ORDER_CONFIRMED' | 'SECURITY';
  read: boolean; createdAt: string;
}

export const NotificationCenter = () => {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.read).length);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Listen for real-time signals
    socketService.on("new_notification", (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.custom((t) => (
        <div className={cn("bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl border border-indigo-500/20 flex items-center gap-5 animate-reveal", t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
           <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><Bell size={20} className="animate-ring" /></div>
           <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">{notif.title}</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic truncate max-w-[200px] leading-tight">"{notif.message}"</p>
           </div>
        </div>
      ), { duration: 5000, position: 'top-right' });
    });

    const interval = setInterval(fetchNotifications, 300000); // Poll every 5 min as backup
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try { await api.put(`/notifications/${id}/read`); fetchNotifications(); } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try { await api.put("/notifications/mark-all-read"); toast.success(t('common.success')); fetchNotifications(); } catch (e) { console.error(e); }
  };

  const deleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try { await api.delete(`/notifications/${id}`); fetchNotifications(); } catch (e) { console.error(e); }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SUCCESS': case 'ORDER_CONFIRMED': return 'bg-emerald-500 text-white';
      case 'WARNING': case 'STOCK_ALERT': return 'bg-amber-500 text-white';
      case 'ERROR': case 'SECURITY': return 'bg-rose-500 text-white';
      default: return 'bg-indigo-500 text-white';
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`relative p-3 rounded-xl transition-all duration-300 ${isOpen ? 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)]' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:border-indigo-500/30'}`}>
        <Bell size={18} className={isOpen ? 'scale-110' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-lg animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/20 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }} className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-4 w-[calc(100vw-2rem)] sm:w-96 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 overflow-hidden z-[110] transition-colors`}>
              <div className={cn("p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md", isRtl && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                   <div className="p-2 bg-slate-900 dark:bg-slate-800 rounded-lg text-white"><Bell size={14} /></div>
                   <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white transition-colors">{tenant?.name || "System"} Inbox</h3>
                </div>
                <button onClick={markAllRead} className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">{t('common.refresh')}</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div key={n._id} onClick={() => !n.read && markAsRead(n._id)} className={cn(`p-6 border-b border-slate-50 dark:border-slate-800 transition-all cursor-pointer group ${n.read ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`, isRtl && "text-right")}>
                    <div className={cn("flex gap-4", isRtl && "flex-row-reverse")}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${getTypeStyles(n.type)}`}><Info size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("flex justify-between items-start gap-2 mb-1", isRtl && "flex-row-reverse")}>
                           <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{n.title}</h4>
                           <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">"{n.message}"</p>
                      </div>
                      <button onClick={(e) => deleteNotif(e, n._id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )) : <div className="py-20 text-center grayscale opacity-30"><ShieldCheck size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">{t('common.noData')}</p></div>}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800"><button onClick={() => setIsOpen(false)} className="w-full py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-black text-[9px] uppercase text-slate-500 hover:bg-slate-900 hover:text-white transition-all">{t('common.close')}</button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
