import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, User, Phone, Briefcase, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import api from "../../api/client";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const InputField = ({ label, icon: Icon, isRtl, ...props }: any) => (
  <div className="space-y-2">
    <label className={cn("text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2", isRtl && "flex-row-reverse text-right mr-1")}>
      {Icon && <Icon size={12} className="text-indigo-500" />}
      {label}
    </label>
    {props.type === "textarea" ? (
      <textarea {...props} className={cn("w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold text-slate-800 dark:text-slate-200 outline-none transition-all resize-none shadow-inner min-h-[100px]", isRtl && "text-right")} />
    ) : (
      <input {...props} className={cn("w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold text-slate-800 dark:text-slate-200 outline-none transition-all disabled:opacity-50 shadow-inner", isRtl && "text-right")} />
    )}
  </div>
);

export const ProfileSettings = ({ user, setUser, t, isRtl }: any) => {
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(user?.avatar || null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await toBase64(file);
            setAvatar(base64); setPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const res = await api.put("/auth/profile", { name, phone, avatar, bio, jobTitle });
            if (res.data.success) { setUser(res.data.data); toast.success(t('common.success')); }
        } catch (e) { toast.error(t('errors.serverError')); } finally { setLoading(false); }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className={cn("flex flex-col sm:flex-row items-center gap-8 p-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-500/20", isRtl && "flex-row-reverse")}>
                <div className="relative group shrink-0">
                    {preview ? <img src={preview} className="w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl object-cover" alt="" /> : <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white">{user?.name?.charAt(0)}</div>}
                    <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl cursor-pointer hover:bg-indigo-600 transition-all shadow-lg border-2 border-white dark:border-slate-800"><Camera size={14} /></label>
                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className={cn("min-w-0", isRtl ? 'text-right' : 'text-left')}>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate uppercase italic">{user?.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm truncate">{user?.email}</p>
                    <span className="mt-2 inline-block px-3 py-1 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-[0.2em] italic">{user?.role}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('team.fields.name')} icon={User} value={name} onChange={(e:any) => setName(e.target.value)} isRtl={isRtl} />
                <InputField label={t('clients.fields.phone')} icon={Phone} value={phone} onChange={(e:any) => setPhone(e.target.value)} isRtl={isRtl} />
            </div>
            <InputField label={t('team.fields.tag')} icon={Briefcase} value={jobTitle} onChange={(e:any) => setJobTitle(e.target.value)} isRtl={isRtl} />
            <InputField label={t('products.fields.description')} icon={ShieldCheck} value={bio} onChange={(e:any) => setBio(e.target.value)} type="textarea" isRtl={isRtl} />
            <div className={cn("flex pt-4", isRtl ? 'justify-start' : 'justify-end')}>
                <button onClick={handleSaveProfile} disabled={loading} className="group relative bg-indigo-600 text-white px-12 py-5 rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.3em] hover:scale-105 transition-all disabled:opacity-50 shadow-2xl border-none italic overflow-hidden">
                   <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                   <span className="relative z-10 flex items-center gap-3">
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                      {t('common.save')}
                   </span>
                </button>
            </div>
        </motion.div>
    );
};
