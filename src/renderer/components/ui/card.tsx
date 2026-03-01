import { cn } from "@/renderer/lib/utils";

export function Card({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-(--gym-card) backdrop-blur-2xl",
        "border border-(--gym-border)",
        "shadow-[0_10px_40px_rgba(0,0,0,0.6)]",
        "transition-all duration-300 ease-out",
        "hover:shadow-[0_0_40px_var(--gym-soft-glow)]",
        "hover:-translate-y-1",
        "before:absolute before:inset-0 before:bg-linear-to-br",
        "before:from-red-500/5 before:to-transparent before:opacity-0",
        "hover:before:opacity-100 before:transition-opacity",
        className,
      )}
      {...props}
    />
  );
}
