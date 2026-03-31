import React from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, Upload, Images, Trash2, Loader2, PlusCircle, MinusCircle, Tag } from "lucide-react";
import { cn } from "../../lib/utils";

interface BulkAddModalProps {
  editingId: string | null;
  bulkProducts: any[];
  categories: any[];
  isSubmitting: boolean;
  isRtl: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onAddRow: () => void;
  onRemoveRow: (i: number) => void;
  onBulkChange: (i: number, field: string, val: any) => void;
  onFileChange: (i: number, e: React.ChangeEvent<HTMLInputElement>, isGallery?: boolean) => void;
  onRemoveGalleryImg: (pi: number, imgI: number) => void;
  t: (key: string) => string;
}

const FormInput = ({ label, isRtl, ...props }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    <input {...props} className={cn("w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-[11px] font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-600/20 transition-all shadow-inner", isRtl && "text-right")} />
  </div>
);

export const BulkAddModal = (props: BulkAddModalProps) => {
  const { 
    editingId, bulkProducts, categories, isSubmitting, isRtl, 
    onClose, onSubmit, onAddRow, onRemoveRow, onBulkChange, 
    onFileChange, onRemoveGalleryImg, t 
  } = props;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[2rem] p-6 md:p-10 shadow-2xl relative my-auto border border-slate-200 dark:border-white/5 transition-colors">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-lg border-none bg-transparent active:scale-90"><X size={20} /></button>
        
        <div className={cn("flex items-center gap-4 mb-8", isRtl && "flex-row-reverse")}>
           <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl shrink-0"><ShieldCheck size={24} /></div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">{editingId ? t('common.edit') : "Bulk Provisioning"} <span className="text-indigo-600">Protocol.</span></h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
           <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {bulkProducts.map((item, index) => (
                <div key={index} className="p-6 bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-slate-200 dark:border-white/5 relative group/row">
                   {!editingId && bulkProducts.length > 1 && (
                     <button type="button" onClick={() => onRemoveRow(index)} className="absolute -top-2 -right-2 p-2 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover/row:opacity-100 transition-all border-none active:scale-90"><MinusCircle size={16}/></button>
                   )}
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-3 space-y-4">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Imagery</p>
                         <div className="grid grid-cols-2 gap-2">
                            <div onClick={() => (document.getElementById(`file-${index}`) as any).click()} className="aspect-square bg-white dark:bg-slate-950 rounded-2xl border-2 border-dashed border-indigo-500/20 flex flex-col items-center justify-center relative cursor-pointer hover:border-indigo-500 transition-all overflow-hidden group/img">
                               {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="text-center p-2"><Upload size={20} className="mx-auto mb-1 text-indigo-500"/><p className="text-[6px] font-black uppercase text-slate-400">Primary</p></div>}
                               <input id={`file-${index}`} type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(index, e)} />
                            </div>
                            <div onClick={() => (document.getElementById(`gallery-${index}`) as any).click()} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center relative cursor-pointer hover:border-indigo-500/50 transition-all group/gal">
                               <Images size={20} className="text-slate-400 group-hover/gal:text-indigo-500" />
                               <p className="text-[6px] font-black uppercase text-slate-400 mt-1">Add to Gallery</p>
                               <input id={`gallery-${index}`} type="file" className="hidden" multiple accept="image/*" onChange={(e) => onFileChange(index, e, true)} />
                            </div>
                         </div>
                         {item.gallery && item.gallery.length > 0 && (
                           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                              {item.gallery.map((img: string, i: number) => (
                                <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 relative group/imgprev">
                                   <img src={img} className="w-full h-full object-cover" />
                                   <button type="button" onClick={() => onRemoveGalleryImg(index, i)} className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover/imgprev:opacity-100 transition-all flex items-center justify-center border-none bg-transparent"><Trash2 size={10}/></button>
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                      <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormInput label="Name" value={item.name} onChange={(e:any)=>onBulkChange(index, 'name', e.target.value)} required isRtl={isRtl} />
                         <FormInput label="SKU" value={item.sku} onChange={(e:any)=>onBulkChange(index, 'sku', e.target.value)} required isRtl={isRtl} />
                         <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                            <div className="relative group/cat">
                               <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-[11px] font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-600/20 transition-all shadow-inner uppercase appearance-none" value={(item.category && typeof item.category === 'object') ? (item.category as any)?._id : item.category} onChange={(e)=>onBulkChange(index, 'category', e.target.value)}>
                                  <option value="">Select Tier</option>
                                  {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                               </select>
                               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40 group-hover/cat:opacity-100 transition-opacity">
                                  <Tag size={12} className="text-indigo-500" />
                               </div>
                            </div>
                         </div>
                         <FormInput label="Price (DH)" type="number" value={item.price} onChange={(e:any)=>onBulkChange(index, 'price', e.target.value)} required isRtl={isRtl} />
                         <FormInput label="Quantity" type="number" value={item.quantity} onChange={(e:any)=>onBulkChange(index, 'quantity', e.target.value)} required isRtl={isRtl} />
                         <FormInput label="Location" value={item.location} onChange={(e:any)=>onBulkChange(index, 'location', e.target.value)} isRtl={isRtl} />
                         <div className="md:col-span-3">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1">Description</label>
                            <textarea className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-[11px] font-medium text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-600/20 transition-all shadow-inner min-h-[60px] resize-none" value={item.description} onChange={(e)=>onBulkChange(index, 'description', e.target.value)} />
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
              {!editingId && (
                <button type="button" onClick={onAddRow} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-all border-none bg-transparent"><PlusCircle size={18}/> Add Product Entry</button>
              )}
              <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-16 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 border-none">
                 {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={18} />} 
                 {editingId ? "Save Changes" : "Commit Provisioning"}
              </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
};
