import { motion } from "framer-motion";
import { cn } from "@/renderer/lib/utils";

interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={cn(
        "relative rounded-2xl p-6",
        "bg-[var(--gym-surface-glass)] backdrop-blur-2xl",
        "border border-[var(--gym-border)]",
        "shadow-[0_20px_60px_rgba(0,0,0,0.65)]",
        "transition-all duration-300 ease-out",
        "hover:shadow-[0_0_30px_rgba(215,35,35,0.25)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
