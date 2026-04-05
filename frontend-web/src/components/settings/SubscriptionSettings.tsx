import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, CheckCircle2, Zap, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { cn } from "../../lib/utils";
import { useTenant } from "../../store/tenant.slice";
import api from "../../api/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { EmbeddedPaymentModal } from "./EmbeddedPaymentModal";

// Replace with your real VITE_STRIPE_PUBLISHABLE_KEY in .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export const SubscriptionSettings = ({ t, isRtl }: any) => {
    const { tenant, fetchTenant } = useTenant();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [checkoutData, setCheckoutData] = useState<{ clientSecret: string, plan: any } | null>(null);
    
    const plans = [
        { name: "FREE", price: "0 DH", products: 50, users: 2, ai: false, color: "bg-slate-100 dark:bg-slate-800", description: "Ideal for individual vendors starting their node journey." },
        { name: "PRO", price: "199 DH", products: 1000, users: 10, ai: true, color: "bg-indigo-600 text-white", description: "Scale your commerce cluster with advanced intelligence." },
        { name: "ENTERPRISE", price: "999 DH", products: "Illimité", users: "Illimité", ai: true, color: "bg-amber-500 text-white", description: "Institutional-grade capabilities for high-velocity enterprises." }
    ];

    useEffect(() => {
        if (searchParams.get("success")) { 
            toast.success("Node Tier Elevated Successfully"); 
            fetchTenant(); 
            setSearchParams({}); 
        }
    }, [searchParams, setSearchParams, fetchTenant]);

    const handleElevate = async (plan: any) => {
        if (plan.name === "FREE") return;
        
        setLoadingPlan(plan.name);
        try {
            const res = await api.post("/saas/create-payment-intent", { planName: plan.name });
            if (res.data?.clientSecret) {
                setCheckoutData({ clientSecret: res.data.clientSecret, plan });
            } else {
                throw new Error("Missing Client Secret");
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Payment Protocol Error");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden">
                <Gem className="absolute right-[-40px] top-[-40px] w-64 h-64 opacity-10 rotate-12" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-80 italic">Current Node Tier</p>
                    <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">{tenant?.plan} EDITION</h3>
                    <div className="flex items-center gap-3 mt-6 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl border border-white/10">
                        <CheckCircle2 size={14} className="text-emerald-400" /> Operational Status: {tenant?.subscriptionStatus === 'ACTIVE' ? 'Active' : 'Awaiting Signal'}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => (
                    <div key={p.name} className={cn("p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between group overflow-hidden relative", tenant?.plan === p.name ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-white/5', p.color)}>
                        <div className="mb-8 relative z-10">
                           <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">{p.name}</h4>
                           <p className="text-[10px] font-bold opacity-70 mb-6 leading-relaxed italic">{p.description}</p>
                           <p className="text-3xl font-black italic tracking-tighter">{p.price}<span className="text-[10px] not-italic opacity-60 uppercase ml-1">/Mo</span></p>
                           <ul className="mt-8 space-y-4 text-[9px] font-black uppercase tracking-widest">
                               <li className="flex items-center gap-3"><CheckCircle2 size={14} /> {p.products} Inventory SKUs</li>
                               <li className="flex items-center gap-3"><CheckCircle2 size={14} /> {p.users} Squad Members</li>
                               {p.ai && <li className="flex items-center gap-3 text-emerald-400"><Zap size={14} fill="currentColor" /> Neural AI Access</li>}
                           </ul>
                        </div>
                        <button 
                            onClick={() => handleElevate(p)}
                            disabled={tenant?.plan === p.name || loadingPlan !== null} 
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl border-none relative z-10 flex items-center justify-center gap-2", 
                                tenant?.plan === p.name ? "bg-white/20 cursor-not-allowed text-white" : "bg-white text-indigo-600 hover:scale-105 active:scale-95"
                            )}
                        >
                            {loadingPlan === p.name ? <Loader2 size={16} className="animate-spin" /> : (tenant?.plan === p.name ? "Active Tier" : `Elevate Node`)}
                        </button>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {checkoutData && (
                    <Elements 
                        stripe={stripePromise} 
                        options={{ 
                            clientSecret: checkoutData.clientSecret,
                            appearance: { theme: 'night' } 
                        }}
                    >
                        <EmbeddedPaymentModal 
                            planName={checkoutData.plan.name} 
                            price={checkoutData.plan.price} 
                            isRtl={isRtl} 
                            onClose={() => setCheckoutData(null)} 
                        />
                    </Elements>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


