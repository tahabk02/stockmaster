import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import {
  Zap, Brain, Truck, Factory, Package,
  BarChart3, Shield, Lock, Activity, Receipt, Users, ClipboardCheck, Sun, Moon, Radar, Compass,
  ArrowRight, PlaySquare, Camera, Server, Database, Cpu
} from "lucide-react";
import { useAuth } from "../store/auth.slice";
import { Hero3D } from "../components/three/Hero3D";
import { GlobalCanvas } from "../components/three/GlobalCanvas";
import { 
  BentoBox, 
  KineticTitle, 
  VoiceButton, 
  KineticDivider, 
  MagneticWrapper, 
  SovereignTicker,
  CommandPanel,
  SystemTerminal 
} from "../components/ui/pro/UltraProComponents";
import { ThreeModule } from "../components/three/ThreeModule";
import { ThreeImageSlider } from "../components/three/ThreeImageSlider";
import { PayloopVisual } from "../components/three/PayloopVisual";
import { IsometricRoom } from "../components/three/IsometricRoom";
import { AllianceNetwork3D } from "../components/three/AllianceNetwork3D";
import { PricingPro } from "../components/ui/pro/PricingPro";
import { DiagnosticHUD } from "../components/ui/pro/DiagnosticHUD";
import { ImageDetailView } from "../components/ui/pro/ImageDetailView";

export const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [booting, setBooting] = useState(true);
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // IMAGE MODAL STATE
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; subtitle?: string; details?: string[]; tags?: string[] } | null>(null);
  
  const handleOpenImage = (data: { url: string; title: string; subtitle?: string; details?: string[]; tags?: string[] }) => {
    setSelectedImage(data);
  };

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className={cn(
      "min-h-screen selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-1000 scanline-overlay",
      "bg-white text-slate-900 dark:bg-[#06060F] dark:text-[#F1F0FF]",
      isRtl ? "text-right" : "text-left"
    )}>
      <GlobalCanvas />
      <DiagnosticHUD />
      <ImageDetailView 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
        image={selectedImage?.url || ""} 
        title={selectedImage?.title || ""} 
        subtitle={selectedImage?.subtitle || ""}
        details={selectedImage?.details}
        tags={selectedImage?.tags}
      />
      
      {/* 0. BOOT SEQUENCE */}
      <AnimatePresence>
        {booting && (
          <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-slate-50 dark:bg-[#06060F] flex items-center justify-center">
            <div className="flex flex-col items-center gap-8">
               <div className="relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-20 h-24 border-t-2 border-indigo-600 dark:border-indigo-500 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600 dark:text-indigo-500 animate-pulse">
                     <Zap size={32} fill="currentColor" />
                  </div>
               </div>
               <div className="text-center space-y-2">
                  <p className="font-mono text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[1em] italic">{t('landing.boot.init')}</p>
                  <p className="font-mono text-[6px] text-slate-400 dark:text-slate-700 uppercase tracking-[0.5em]">{t('landing.boot.core')}</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. FIXED NAV */}
      <nav className={cn("fixed top-0 w-full z-[500] h-[80px] flex items-center justify-between px-[5%] pointer-events-none", isRtl && "flex-row-reverse")}>
        <div className={cn("logo pointer-events-auto cursor-pointer flex items-center", isRtl && "flex-row-reverse")} onClick={() => navigate("/")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={isRtl ? "ml-2" : "mr-2"}>
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="var(--indigo)" strokeWidth="2"/>
                <path d="M12 6V18M6 9L18 15M18 9L6 15" stroke="var(--indigo)" strokeWidth="1.5"/>
            </svg>
            <span className="font-display text-2xl tracking-tighter uppercase italic leading-none text-slate-950 dark:text-white">
              {t('landing.nav.logo_main')} <span className="text-indigo-600">{t('landing.nav.logo_pro')}</span>
            </span>
        </div>
        
        <div className={cn("flex items-center gap-6 pointer-events-auto bg-white/40 dark:bg-black/40 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-slate-200 dark:border-white/5 shadow-2xl", isRtl && "flex-row-reverse")}>
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-amber-400 hover:scale-110 transition-transform">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
            <VoiceButton onClick={() => navigate(user ? '/dashboard' : '/login')} className="px-6 py-2.5 text-[10px]">
               {user ? t('landing.nav.console') : t('landing.nav.deploy')}
            </VoiceButton>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center grid-bg overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-100">
            <Hero3D />
        </div>
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.02] dark:opacity-[0.05] cursor-zoom-in"
          onClick={() => handleOpenImage({ url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600", title: "ENTERPRISE_CORE", subtitle: "Lattice_Core_v4.2_Visualization" })}
        />
        
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 space-y-10">
            <div className="px-4 py-1.5 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-3xl italic inline-flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="font-mono text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t('landing.hero.status')}</span>
            </div>
            
            <KineticTitle className="flex flex-col">
                <span className="text-slate-950 dark:text-white opacity-10 dark:opacity-20 text-stroke dark:text-stroke-none">{t('landing.hero.title_1')}</span>
                <span className="text-indigo-600">{t('landing.hero.title_2')}</span>
                <span className="text-slate-950 dark:text-white">{t('landing.hero.title_3')}</span>
            </KineticTitle>

            <p className="max-w-xl mx-auto font-mono text-[11px] text-slate-600 dark:text-[#6B6B8A] uppercase tracking-widest leading-relaxed italic">
                {t('landing.hero.desc_1')} <br />
                {t('landing.hero.desc_2')}
            </p>

            <div className="flex gap-6 justify-center">
                <VoiceButton onClick={() => navigate('/register')} className="px-12 py-6 text-[12px]">{t('landing.hero.cta_init')}</VoiceButton>
                <VoiceButton variant="secondary" className="px-12 py-6 text-[12px]">{t('landing.hero.cta_demo')}</VoiceButton>
            </div>
        </motion.div>
      </section>

      <SovereignTicker />

      {/* 3. STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-y border-slate-900/10 dark:border-white/5 bg-slate-50 dark:bg-[#06060F] relative overflow-hidden">
        {[
            { l: t('landing.stats.items'), v: "50K+", d: "↑ 14%", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800" },
            { l: t('landing.stats.orders'), v: "1.2M+", d: "↑ 08%", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800" },
            { l: t('landing.stats.uptime'), v: "99.9%", d: t('landing.stats.optimal'), img: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800" },
            { l: t('landing.stats.teams'), v: "840+", d: "↑ 04%", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800" }
        ].map((stat, i) => (
            <div key={i} className={cn("p-10 border-r border-slate-900/10 dark:border-white/5 hover:bg-indigo-600/5 transition-colors relative z-10 group overflow-hidden", isRtl && "text-right")}>
                <img 
                  src={stat.img} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700 cursor-zoom-in" 
                  onClick={() => handleOpenImage({ url: stat.img, title: stat.l, subtitle: stat.v + " " + stat.d })}
                />
                <span className="font-mono text-[9px] text-slate-500 dark:text-[#6B6B8A] uppercase mb-4 block relative z-10">{stat.l}</span>
                <span className="font-display text-5xl text-slate-950 dark:text-white block relative z-10">{stat.v}</span>
                <span className="font-mono text-[10px] text-emerald-500 relative z-10">{stat.d}</span>
            </div>
        ))}
      </div>

      {/* 4. FEATURES GRID */}
      <section id="Modules" className="py-32 px-[5%] relative">
        <div className={cn("space-y-4 mb-20", isRtl ? "text-center md:text-right" : "text-center md:text-left")}>
            <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] italic">{t('landing.features.subtitle')}</span>
            <h2 className="font-display text-6xl md:text-8xl dark:text-white">{t('landing.features.title_1')} <span className="text-indigo-600">{t('landing.features.title_2')}</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BentoBox 
              num="01" 
              title={t('landing.features.stocks.title')} 
              subtitle={t('landing.features.stocks.desc')} 
              icon={Package} 
              delay={0.1} 
              bgImage="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800" 
              onClickImage={handleOpenImage}
              details={t('landing.features.stocks.details', { returnObjects: true })}
              tags={t('landing.features.stocks.tags', { returnObjects: true })}
              isRtl={isRtl}
            />
            <BentoBox 
              num="02" 
              title={t('landing.features.suppliers.title')} 
              subtitle={t('landing.features.suppliers.desc')} 
              icon={Truck} 
              delay={0.2} 
              bgImage="https://images.unsplash.com/photo-1556740734-7f9a2b7a0f42?q=80&w=800" 
              onClickImage={handleOpenImage}
              details={t('landing.features.suppliers.details', { returnObjects: true })}
              tags={t('landing.features.suppliers.tags', { returnObjects: true })}
              isRtl={isRtl}
            />
            <BentoBox 
              num="03" 
              title={t('landing.features.invoicing.title')} 
              subtitle={t('landing.features.invoicing.desc')} 
              icon={Receipt} 
              delay={0.3} 
              bgImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800" 
              onClickImage={handleOpenImage}
              details={t('landing.features.invoicing.details', { returnObjects: true })}
              tags={t('landing.features.invoicing.tags', { returnObjects: true })}
              isRtl={isRtl}
            />
            <BentoBox 
              num="04" 
              title={t('landing.features.analytics.title')} 
              subtitle={t('landing.features.analytics.desc')} 
              icon={BarChart3} 
              delay={0.4} 
              bgImage="https://images.unsplash.com/photo-1551288049-bbda4865cda1?q=80&w=800" 
              onClickImage={handleOpenImage} 
              details={t('landing.features.analytics.details', { returnObjects: true })}
              tags={t('landing.features.analytics.tags', { returnObjects: true })}
              isRtl={isRtl}
            />
            <BentoBox 
              num="05" 
              title={t('landing.features.security.title')} 
              subtitle={t('landing.features.security.desc')} 
              icon={Shield} 
              delay={0.5} 
              bgImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800" 
              onClickImage={handleOpenImage} 
              details={t('landing.features.security.details', { returnObjects: true })}
              tags={t('landing.features.security.tags', { returnObjects: true })}
              isRtl={isRtl}
            />
            <BentoBox 
              num="06" 
              title={t('landing.features.notifications.title')} 
              subtitle={t('landing.features.notifications.desc')} 
              icon={Activity} 
              delay={0.6} 
              bgImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800" 
              onClickImage={handleOpenImage} 
              details={t('landing.features.notifications.details', { returnObjects: true })}
              tags={t('landing.features.notifications.tags', { returnObjects: true })}
              isRtl={isRtl}
            />
        </div>
      </section>

      <KineticDivider />

      {/* 5. BENTO ANALYTICS */}
      <section id="Analytique" className="py-32 px-[5%] bg-slate-100 dark:bg-[#0C0C1A] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=1600" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />
        <div className={cn("space-y-4 mb-20 relative z-10", isRtl ? "text-center md:text-right" : "text-center md:text-left")}>
            <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] italic">{t('landing.analytics_sec.subtitle')}</span>
            <h2 className="font-display text-6xl md:text-8xl dark:text-white">{t('landing.analytics_sec.title_1')} <span className="text-indigo-600">{t('landing.analytics_sec.title_2')}</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[300px] relative z-10">
            <div className="md:col-span-8 md:row-span-2 relative bg-white dark:bg-black/20 rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 overflow-hidden flex flex-col justify-between group shadow-xl">
                <div className="absolute inset-0 z-0 opacity-20 dark:opacity-40 pointer-events-none scale-125 transform -translate-y-10 group-hover:scale-150 transition-transform duration-[2s]">
                    <ThreeModule type="NEURAL" color="#4F46E5" />
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.05] dark:opacity-[0.1] mix-blend-overlay cursor-zoom-in group-hover:opacity-[0.2] transition-opacity" 
                  onClick={() => handleOpenImage({ url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200", title: t('landing.analytics_sec.lattice_preview'), subtitle: "" })}
                />
                <span className="font-mono text-[10px] text-slate-400 dark:text-[#6B6B8A] uppercase relative z-10">{t('landing.analytics_sec.lattice_preview')}</span>
                <div className="relative z-10 mt-auto">
                    <SystemTerminal />
                </div>
            </div>
            <div className="md:col-span-4 md:row-span-1 bg-white dark:bg-black/20 rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
                <span className="font-mono text-[9px] text-slate-400 dark:text-[#6B6B8A] uppercase mb-6">{t('landing.analytics_sec.uptime')}</span>
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="w-full h-full rotate-[-90deg]">
                        <circle cx="60" cy="60" r="54" stroke="currentColor" fill="none" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                        <circle cx="60" cy="60" r="54" stroke="#10B981" fill="none" strokeWidth="8" strokeDasharray="339" strokeDashoffset="33.9" className="drop-shadow-[0_0_10px_#10B981]" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display text-3xl dark:text-white">99.9%</span>
                </div>
            </div>
            <div className="md:col-span-4 md:row-span-1 bg-white dark:bg-black/20 rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 flex flex-col justify-center shadow-xl relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800" 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.05] dark:opacity-[0.1] cursor-zoom-in group-hover:opacity-[0.2] transition-opacity" 
                  onClick={() => handleOpenImage({ url: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200", title: t('landing.analytics_sec.orders_24h'), subtitle: "" })}
                />
                <span className="font-mono text-[9px] text-slate-400 dark:text-[#6B6B8A] uppercase relative z-10">{t('landing.analytics_sec.orders_24h')}</span>
                <span className="font-display text-7xl mt-4 dark:text-white relative z-10">2,840</span>
                <span className="font-mono text-[10px] text-emerald-500 italic mt-2 relative z-10">{t('landing.analytics_sec.velocity')}</span>
            </div>
            <div className="md:col-span-12 md:row-span-2 rounded-[4rem] overflow-hidden border border-slate-200 dark:border-white/5 relative bg-white dark:bg-black group shadow-4xl">
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200" 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.1] dark:opacity-[0.2] scale-110 group-hover:scale-100 transition-transform duration-[3s] cursor-zoom-in" 
                  onClick={() => handleOpenImage({ url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600", title: t('landing.analytics_sec.global_sync'), subtitle: "" })}
                />
                <AllianceNetwork3D />
                <div className={cn("absolute top-10 z-10 pointer-events-none space-y-2", isRtl ? "right-10" : "left-10")}>
                    <span className="font-mono text-[10px] font-black text-indigo-600 dark:text-white/40 uppercase tracking-[1em] italic">{t('landing.analytics_sec.global_sync')}</span>
                    <div className={cn("flex gap-1", isRtl && "flex-row-reverse")}>
                        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />)}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 6. PAYLOOP TELEMETRY */}
      <section className="py-48 px-10 relative overflow-hidden">
         <img 
           src="https://images.unsplash.com/photo-1551288049-bbda4865cda1?q=80&w=1200" 
           alt="" 
           className="absolute inset-0 w-full h-full object-cover opacity-[0.02] dark:opacity-[0.05] cursor-zoom-in hover:opacity-[0.1] transition-opacity" 
           onClick={() => handleOpenImage({ url: "https://images.unsplash.com/photo-1551288049-bbda4865cda1?q=80&w=1600", title: "NEURAL_FLUX", subtitle: "Planetary-scale telemetry synchronization" })}
         />
         <div className={cn("max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10", isRtl && "rtl")}>
            <PayloopVisual />
            <div className="space-y-16">
               <div className="space-y-8">
                  <div className={cn("flex items-center gap-6", isRtl && "flex-row-reverse")}>
                     <div className="w-4 h-4 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_30px_#00f3ff]" />
                     <span className="font-mono text-[12px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[1em] italic">{t('landing.flux.subtitle')}</span>
                  </div>
                  <h2 className="text-8xl md:text-[14rem] font-display leading-[0.7] dark:text-white">{t('landing.flux.title_1')} <br/><span className="text-cyan-500">{t('landing.flux.title_2')}</span></h2>
               </div>
               <p className="font-mono text-2xl text-slate-500 dark:text-[#6B6B8A] uppercase tracking-tight italic leading-snug">
                  {t('landing.flux.desc')}
               </p>
               <div className={cn("grid grid-cols-2 gap-24 border-t border-slate-200 dark:border-white/5 pt-20", isRtl && "rtl")}>
                  <div className="space-y-6">
                     <p className="font-display text-8xl italic dark:text-white">0.001s</p>
                     <p className="font-mono text-[12px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.8em]">{t('landing.flux.delta')}</p>
                  </div>
                  <div className="space-y-6">
                     <p className="font-display text-8xl italic dark:text-white">100%</p>
                     <p className="font-mono text-[12px] font-black text-rose-600 dark:text-rose-500 uppercase tracking-[0.8em]">{t('landing.flux.audit')}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 7. COMMAND AXIS */}
      <section id="Axis" className="py-48 px-[5%] bg-slate-50 dark:bg-[#06060F] relative">
         <img 
           src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200" 
           alt="" 
           className="absolute inset-0 w-full h-full object-cover opacity-[0.02] dark:opacity-[0.04] cursor-zoom-in hover:opacity-[0.1] transition-opacity" 
           onClick={() => handleOpenImage({ url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600", title: t('landing.axis.title_1') + " " + t('landing.axis.title_2'), subtitle: t('landing.axis.desc') })}
         />
         <div className="max-w-[1800px] mx-auto space-y-40 relative z-10">
            <div className="text-center space-y-12">
               <h2 className="text-8xl md:text-[18rem] font-display leading-[0.6] text-center dark:text-white">{t('landing.axis.title_1')} <br/><span className="text-indigo-600">{t('landing.axis.title_2')}</span></h2>
               <p className="max-w-4xl mx-auto font-mono text-2xl text-slate-500 dark:text-[#6B6B8A] uppercase italic tracking-widest opacity-70">{t('landing.axis.desc')}</p>
            </div>
            <div className="rounded-[6rem] overflow-hidden border-4 border-slate-200 dark:border-white/10 shadow-pro relative bg-white dark:bg-black p-6">
                <IsometricRoom />
            </div>
         </div>
      </section>

      <KineticDivider />

      {/* 8. TECH STACK */}
      <section className="py-32 px-[5%] relative">
        <div className="space-y-4 mb-20 text-center">
            <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] italic">{t('landing.stack.subtitle')}</span>
            <h2 className="font-display text-6xl md:text-8xl dark:text-white">{t('landing.stack.title_1')} <span className="text-indigo-600">{t('landing.stack.title_2')}</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                { i: "RN", n: "React Native", s: t('landing.stack.rn'), img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800" },
                { i: "NJ", n: "Node.js", s: t('landing.stack.node'), img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800" },
                { i: "MG", n: "MongoDB", s: t('landing.stack.mongo'), img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=800" },
                { i: "ZD", n: "Zustand", s: t('landing.stack.zustand'), img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800" },
                { i: "TS", n: "TypeScript", s: t('landing.stack.ts'), img: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=800" },
                { i: "JT", n: "JWT", s: t('landing.stack.jwt'), img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800" },
                { i: "I1", n: "i18next", s: t('landing.stack.i18n'), img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800" },
                { i: "DK", n: "Docker", s: t('landing.stack.docker'), img: "https://images.unsplash.com/photo-1605745341112-85968b193ef5?q=80&w=800" }
            ].map((stack, i) => (
                <div key={i} className="bg-white dark:bg-[#0C0C1A] border border-slate-200 dark:border-white/5 p-10 text-center rounded-[2.5rem] hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-xl">
                    <img 
                      src={stack.img} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-10 transition-opacity duration-700 cursor-zoom-in" 
                      onClick={() => handleOpenImage({ url: stack.img, title: stack.n, subtitle: stack.s })}
                    />
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform relative z-10 shadow-lg">
                        {stack.i}
                    </div>
                    <p className="font-mono text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase italic relative z-10">{stack.n}</p>
                    <p className="font-mono text-[10px] text-slate-400 dark:text-[#6B6B8A] uppercase tracking-widest relative z-10">{stack.s}</p>
                </div>
            ))}
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="py-64 px-10 text-center relative overflow-hidden bg-slate-950">
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-indigo-600/5 -skew-y-12" />
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5 }} className="max-w-6xl mx-auto space-y-20 relative z-10">
            <h2 className="font-display text-8xl md:text-[16rem] leading-[0.75] text-white">{t('landing.cta_sec.title_1')} <span className="text-indigo-600 italic">{t('landing.cta_sec.title_2')}</span></h2>
            <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
                <VoiceButton onClick={() => navigate('/register')} className="px-24 py-10 text-3xl rounded-[3rem] shadow-[0_0_100px_rgba(99,102,241,0.2)]">{t('landing.cta_sec.deploy')}</VoiceButton>
                <VoiceButton variant="secondary" className="px-20 py-10 text-2xl font-mono border-white/10">{t('landing.cta_sec.docs')}</VoiceButton>
            </div>
        </motion.div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-32 px-12 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#020205] relative z-20">
        <div className="max-w-none mx-auto grid grid-cols-1 lg:grid-cols-4 gap-24">
            <div className="lg:col-span-2 space-y-12">
                <div className="logo text-3xl dark:text-white flex items-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--indigo)" className="mr-4 inline-block"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    {t('landing.nav.logo_main')} <span className="text-indigo-600 ml-2">{t('landing.nav.logo_pro')}</span>
                </div>
                <p className="max-w-md text-xl text-slate-500 dark:text-[#6B6B8A] font-mono uppercase italic tracking-tighter leading-relaxed opacity-80">
                    {t('landing.footer.desc')}
                </p>
            </div>
            <div className="grid grid-cols-2 gap-20 lg:col-span-2">
                <div className="space-y-10">
                    <h4 className="font-mono text-[11px] font-black text-indigo-600 uppercase tracking-[0.6em]">{t('landing.footer.product')}</h4>
                    <ul className="space-y-6">
                        {[
                          {l: t('landing.footer.modules'), h: "#Modules"}, 
                          {l: t('landing.footer.security'), h: "#"}, 
                          {l: t('landing.footer.analytics'), h: "#Analytique"}
                        ].map(item => (
                            <li key={item.l}><a href={item.h} className="font-mono text-[12px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 uppercase transition-colors italic">{item.l}</a></li>
                        ))}
                    </ul>
                </div>
                <div className="space-y-10">
                    <h4 className="font-mono text-[11px] font-black text-indigo-600 uppercase tracking-[0.6em]">{t('landing.footer.company')}</h4>
                    <ul className="space-y-6">
                        {[
                          {l: t('landing.footer.about'), h: "#"}, 
                          {l: t('landing.footer.contact'), h: "#"}, 
                          {l: t('landing.footer.legal'), h: "#"}
                        ].map(item => (
                            <li key={item.l}><a href={item.h} className="font-mono text-[12px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 uppercase transition-colors italic">{item.l}</a></li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        <div className="mt-48 pt-16 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-16">
            <span className="font-mono text-[12px] font-black text-slate-400 tracking-[2em] uppercase italic opacity-30">{t('landing.footer.copyright')}</span>
            <div className={cn("flex items-center gap-10 px-10 py-5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 shadow-inner", isRtl && "flex-row-reverse")}>
               <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
                  <span className="font-mono text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[1em] italic">{t('landing.footer.status')}</span>
               </div>
               <div className="w-px h-6 bg-black/10 dark:bg-white/10" />
               <span className="font-mono text-[11px] font-black text-indigo-600 uppercase italic font-black text-lg">0x82A...ZENITH</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
