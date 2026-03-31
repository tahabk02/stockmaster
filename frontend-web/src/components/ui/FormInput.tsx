import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isRtl: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, isRtl, ...props }) => (
  <div className="space-y-2">
    <label className={`text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1 block ml-1 italic ${isRtl ? 'text-right' : ''}`}>
      {label}
    </label>
    <input
      {...props}
      className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm ${isRtl ? 'text-right' : ''}`}
    />
  </div>
);

export default FormInput;
