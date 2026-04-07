import React from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ElementType;
  color: string;
  isRtl: boolean;
}

const MetricCard = ({ label, value, unit, icon: Icon, color, isRtl }: MetricCardProps) => {
  const getAccentClass = () => {
    switch (color) {
      case 'emerald': return 'accent-emerald';
      case 'amber': return 'accent-amber';
      case 'rose': return 'accent-rose';
      case 'sky': return 'accent-sky';
      case 'indigo': return 'accent-sky';
      default: return '';
    }
  };

  return (
    <div className={`theme-card p-6 transition-all group overflow-hidden relative ${getAccentClass()}`}>
      <div className={`absolute ${isRtl ? '-left-4' : '-right-4'} -bottom-4 w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700`} />
      <div className={`relative z-10 flex flex-col gap-6`}>
        <div className={`w-12 h-12 bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${isRtl ? 'mr-auto' : ''}`}>
          <Icon size={22} />
        </div>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 transition-colors">{label}</p>
          <div className={`flex items-baseline gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h4>
            <span className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase transition-colors">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
