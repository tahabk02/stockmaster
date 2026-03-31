import React from "react";
import { motion } from "framer-motion";
import { Layers, Scan } from "lucide-react";

export const WarehouseLoading = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617] overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="relative">
         <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-[3] animate-ping" />
         <Layers size={150} className="text-indigo-500 opacity-10" />
         <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
               <Scan size={64} className="text-indigo-500" />
            </motion.div>
         </div>
      </div>
      <p className="mt-20 font-black text-[14px] uppercase tracking-[1.2em] text-indigo-500 animate-pulse italic">Cognitive Map Initializing...</p>
    </div>
  );
};
