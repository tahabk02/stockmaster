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
      className={`pro-input w-full ${isRtl ? 'text-right' : ''}`}
    />
  </div>
);


export default FormInput;
