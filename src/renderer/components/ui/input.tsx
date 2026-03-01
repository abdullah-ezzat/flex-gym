import * as React from "react";
import { cn } from "@/renderer/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl",
          "bg-[#3E3636] text-[#F5EDED]",
          "border border-[#D72323]/20",
          "px-4 py-3 text-sm",
          "transition-all duration-300 ease-out",
          "placeholder:text-neutral-500",
          "focus:outline-none",
          "focus:ring-2 focus:ring-[#D72323]/60",
          "focus:border-[#D72323]",
          "hover:border-[#D72323]/40",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
