import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark" | "gradient";
  animate?: boolean;
  onClick?: () => void;
}

export const GlassCard = ({
  children,
  className,
  variant = "default",
  animate = false,
  onClick,
}: GlassCardProps) => {
  const variants = {
    default:
      "bg-white/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/10 shadow-sm",
    dark: "bg-slate-950/90 border-white/10 text-white shadow-pro",
    gradient:
      "bg-gradient-to-br from-indigo-600/90 to-violet-700/90 border-white/10 text-white shadow-md shadow-indigo-500/20",
  };

  const Wrapper = animate ? motion.div : "div";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
        whileHover: onClick
          ? { scale: 1.02, transition: { duration: 0.2 } }
          : undefined,
      }
    : {};

  return (
    // @ts-ignore
    <Wrapper
      onClick={onClick}
      {...animationProps}
      className={cn(
        "backdrop-blur-2xl rounded-[2rem] border p-6 relative overflow-hidden shadow-sm transition-all",
        variants[variant],
        onClick && "cursor-pointer active:scale-95",
        className,
      )}
    >
      {/* Neural Noise Texture - Ultra Pro Detail */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>

      {/* Shine Effect on Hover */}
      {onClick && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      )}
    </Wrapper>
  );
};
