import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";

export const EmbeddedPaymentModal = ({ 
    planName, 
    price, 
    onClose, 
    isRtl 
}: { 
    planName: string; 
    price: string; 
    onClose: () => void; 
    isRtl: boolean;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/settings?tab=plans&success=true`,
      },
    });

    if (error) {
      toast.error(error.message || "Payment Protocol Failure");
      setIsProcessing(false);
    } else {
      // confirmPayment usually redirects, but if it doesn't:
      toast.success("Signal Confirmed");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_100px_rgba(79,70,229,0.2)] relative border border-white/5 my-auto overflow-hidden"
      >
        <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl transition-all active:scale-90 border-none bg-transparent"
        >
            <X size={20} />
        </button>

        <div className={cn("space-y-8", isRtl && "text-right")}>
            <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                        Secure Checkout
                    </h3>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic leading-none">
                        Protocol: {planName}_ELEVATION
                    </p>
                </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Asset Tier</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-white uppercase italic">{planName}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Terminal Value</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white italic tabular-nums">{price}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="payment-element-container p-2 bg-white rounded-xl">
                    <PaymentElement options={{ layout: "tabs" }} />
                </div>

                <div className="space-y-4">
                    <button 
                        disabled={isProcessing || !stripe || !elements}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-4 border-none italic"
                    >
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <>Elevate Node Now</>}
                    </button>
                    
                    <div className={cn("flex items-center justify-center gap-2 opacity-40", isRtl && "flex-row-reverse")}>
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Encrypted_CMI_Stripe_Gateway_v4.0
                        </span>
                    </div>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
};
