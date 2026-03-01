import { cn } from "@/renderer/lib/utils";

export function Badge({ active }: Readonly<{ active: boolean }>) {
  return (
    <span
      className={cn(
        "px-3 py-1 text-xs rounded-full font-semibold transition-all duration-300",
        active
          ? "bg-green-500/20 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          : "bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(255,0,0,0.4)]",
      )}
    >
      {active ? "Active" : "Expired"}
    </span>
  );
}
