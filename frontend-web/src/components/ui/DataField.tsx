import React from "react";

interface DataFieldProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  highlight?: boolean;
  isRtl: boolean;
}

const DataField = ({ label, value, icon: IconComponent, highlight, isRtl }: DataFieldProps) => {
  const Icon = IconComponent as any;
  return (
  <div className={`p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 group hover:border-slate-200 dark:hover:border-slate-700 transition-all ${highlight ? 'ring-1 ring-indigo-500/20' : ''} ${isRtl ? 'text-right' : 'text-left'}`}>
    <div className={`flex items-center gap-3 mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
      <Icon size={14} className="text-indigo-600 dark:text-indigo-500" />
      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] transition-colors">{label}</span>
    </div>
    <p className={`text-[13px] font-black italic tracking-tight transition-colors ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{value}</p>
  </div>
  );
};

export default DataField;
