import React, { useState } from "react";
import { motion } from "framer-motion";
import { Store, Camera, Palette, Type, Settings2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import { useTenant } from "../../store/tenant.slice";

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

export const StoreSettings = ({ t, isRtl }: any) => {
    const { tenant, updateTenant } = useTenant();
    const [name, setName] = useState(tenant?.name || "");
    const [description, setDescription] = useState(tenant?.description || "");
    const [themeColor, setThemeColor] = useState(tenant?.settings?.themeColor || "#6366f1");
    const [fontFamily, setFontFamily] = useState(tenant?.settings?.fontFamily || "Inter");
    const [logo, setLogo] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(tenant?.logo || null);

    const fonts = [{ name: "Inter", provider: "Standard Sans" }, { name: "Space Grotesk", provider: "Modern Tech" }, { name: "Outfit", provider: "Geometric Pro" }];
    const presets = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4"];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await toBase64(file);
            setLogo(base64); setPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveStore = async () => {
        const data: any = { name, description, settings: { ...tenant?.settings, themeColor, fontFamily } };
        if (logo) data.logo = logo;
        toast.promise(updateTenant(data), { 
            loading: t('common.loading'), 
            success: t('common.success'), 
            error: t('errors.serverError') 
        });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className={cn("flex flex-col sm:flex-row items-center gap-8 p-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-[3rem] border border-indigo-100 dark:border-indigo-500/20", isRtl && "flex-row-reverse")}>
                <div className="relative group shrink-0">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center">{preview ? <img src={preview} className="w-full h-full object-cover" alt="" /> : <Store size={32} className="text-slate-300" />}</div>
                    <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg border-2 border-white dark:border-slate-800"><Camera size={14} /></label>
                    <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className={isRtl ? "text-right" : "text-left"}>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic truncate">{name || "Node"}</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-70">UID: {tenant?.slug}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <InputField label={t('products.fields.name')} icon={Store} value={name} onChange={(e:any)=>setName(e.target.value)} isRtl={isRtl} />
                    <InputField label={t('products.fields.description')} icon={Type} value={description} onChange={(e:any)=>setDescription(e.target.value)} type="textarea" isRtl={isRtl} />
                </div>
                <div className="space-y-8 p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-inner text-left">
                    <div className="space-y-4">
                        <label className={cn("text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 block italic", isRtl && "text-right mr-1")}>{t('settings.theme')}</label>
                        <div className={cn("flex flex-wrap gap-2", isRtl && "justify-end")}>{presets.map(c => <button key={c} onClick={()=>setThemeColor(c)} className={cn("w-8 h-8 rounded-lg border-2", themeColor === c ? "border-slate-900 dark:border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100")} style={{ backgroundColor: c }} />)}</div>
                    </div>
                    <div className="space-y-4">
                        <label className={cn("text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 block italic", isRtl && "text-right mr-1")}>{t('settings.languages')}</label>
                        <div className="grid grid-cols-1 gap-2">{fonts.map(f => <button key={f.name} onClick={()=>setFontFamily(f.name)} className={cn("p-4 rounded-xl border-none text-left text-[10px] font-black uppercase tracking-widest transition-all", fontFamily === f.name ? "bg-indigo-600 text-white shadow-xl scale-105" : "bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-500 shadow-sm", isRtl && "text-right")}>{f.name}</button>)}</div>
                    </div>
                </div>
            </div>
            <div className={cn("flex pt-6", isRtl ? "justify-start" : "justify-end")}>
                <button onClick={handleSaveStore} className="group relative bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-12 py-5 rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl active:scale-95 border-none italic overflow-hidden transition-all">
                   <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                   <span className="relative z-10 flex items-center gap-3">
                      <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                      {t('common.save')}
                   </span>
                </button>
            </div>
        </motion.div>
    );
};
