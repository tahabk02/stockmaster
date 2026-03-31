import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { VoiceButton } from './UltraProComponents';

export const PricingPro = () => {
  const tiers = [
    {
      name: "Standard_Node",
      price: "49",
      features: ["5,000 Products", "10 Team Nodes", "Basic AI Sync", "Standard Support"],
      icon: Zap,
      color: "blue"
    },
    {
      name: "Enterprise_Lattice",
      price: "149",
      features: ["Unlimited Assets", "Neural AI Core", "Forensic Audit", "24/7 Protocol"],
      icon: Shield,
      color: "indigo",
      popular: true
    },
    {
      name: "Sovereign_OS",
      price: "Custom",
      features: ["Dedicated Cluster", "Full Source Access", "Custom Modules", "Physical Sync"],
      icon: Crown,
      color: "rose"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
      {tiers.map((tier, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "relative p-8 rounded-[2.5rem] border border-white/5 bg-slate-950/40 backdrop-blur-3xl flex flex-col justify-between overflow-hidden group",
            tier.popular && "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_50px_rgba(99,102,241,0.1)]"
          )}
        >
          {tier.popular && (
            <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[8px] font-black uppercase italic tracking-[0.3em] rounded-bl-2xl">
              Most_Deployed
            </div>
          )}
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl bg-white/5", `text-${tier.color}-500`)}>
                  <tier.icon size={24} />
               </div>
               <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{tier.name}</h3>
            </div>

            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-black text-white italic tracking-tighter">{tier.price === 'Custom' ? '' : '$'}{tier.price}</span>
               {tier.price !== 'Custom' && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/Cycle</span>}
            </div>

            <ul className="space-y-4">
               {tier.features.map((f, j) => (
                 <li key={j} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{f}</span>
                 </li>
               ))}
            </ul>
          </div>

          <div className="mt-12">
             <VoiceButton 
                variant={tier.popular ? "primary" : "secondary"}
                className="w-full rounded-2xl py-4"
             >
                {tier.price === 'Custom' ? 'Contact_Protocol' : 'Initialize_Node'}
             </VoiceButton>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
