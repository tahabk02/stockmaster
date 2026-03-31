import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

interface ClusterTopologyProps {
  data: any[];
  colors: string[];
  isRtl: boolean;
}

export const ClusterTopology = ({ data, colors, isRtl }: ClusterTopologyProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-slate-950 p-6 md:p-8 rounded-[2.2rem] md:rounded-[2.8rem] border border-white/10 shadow-4xl flex flex-col items-center relative overflow-hidden group h-full min-h-[400px]">
       <div className="absolute inset-0 grid-pattern opacity-[0.05]" />
       <div className="scanline opacity-10" />
       <h2 className={cn("text-base md:text-lg font-black text-white uppercase tracking-widest italic mb-6 md:mb-10 self-start relative z-10", isRtl && "self-end text-right")}>{t('admin.cluster.topology')}</h2>
       
       <div className="h-48 md:h-56 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
             <PieChart>
                <Pie data={data} innerRadius={window.innerWidth < 768 ? 45 : 65} outerRadius={window.innerWidth < 768 ? 75 : 95} paddingAngle={8} dataKey="value" stroke="none">
                  {data.map((_e: any, index: number) => (<Cell key={index} fill={colors[index % colors.length]} />))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}} />
             </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-2xl md:text-4xl font-black text-indigo-500 italic tracking-tighter uppercase">CORE</span>
             <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5 italic">{t('admin.cluster.nodeLattice')}</span>
          </div>
       </div>

       <div className="w-full space-y-2.5 mt-6 md:mt-8 relative z-10 overflow-y-auto max-h-[150px] md:max-h-[200px] custom-scrollbar pr-2">
          {data.map((item: any, i: number) => (
            <div key={i} className={cn("flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/node", isRtl && "flex-row-reverse")}>
               <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{backgroundColor: colors[i % colors.length], color: colors[i % colors.length]}} />
                  <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 group-hover/node:text-white transition-colors">{item.name}</span>
               </div>
               <span className="text-xs md:text-sm font-black text-white italic tracking-tighter">{item.value} <span className="text-[7px] md:text-[8px] opacity-30 not-italic ml-1 uppercase">Unit</span></span>
            </div>
          ))}
       </div>
    </div>
  );
};
