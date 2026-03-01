import * as React from "react";
import { cn } from "@/renderer/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  loading,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#D72323] text-[#F5EDED] hover:bg-[#b71c1c] hover:shadow-[0_0_25px_rgba(215,35,35,0.5)] active:scale-[0.97]",
    outline: "border border-[#D72323] text-[#D72323] hover:bg-[#D72323]/10",
    ghost: "text-[#F5EDED] hover:bg-[#3E3636]/60",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {loading && (
        <span className="h-4 w-4 border-2 border-[#F5EDED] border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
