import * as React from "react";
import { cn } from "@/renderer/lib/utils";

export function Alert({ className, children }: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      className={cn(
        "relative rounded-xl border border-red-500/20",
        "bg-neutral-900/70 backdrop-blur-lg",
        "px-4 py-3 text-sm",
        "shadow-[0_0_25px_var(--gym-soft-glow)]",
        "animate-in fade-in duration-300",
        className,
      )}
    >
      {children}
    </div>
  );
}
