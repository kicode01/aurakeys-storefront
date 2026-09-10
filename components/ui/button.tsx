import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0.5 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]",
        gold:
          "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black font-semibold shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:brightness-110",
        outline:
          "border border-aura-border bg-aura-surface/60 text-neutral-200 hover:border-aura-gold hover:text-white backdrop-blur-md",
        ghost:
          "text-neutral-300 hover:bg-aura-panel hover:text-white",
        tactile:
          "border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-[0_4px_0_0_#1a1a1a] active:shadow-[0_0_0_0_#1a1a1a] active:translate-y-1 hover:border-neutral-500",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-13 rounded-xl px-8 text-base tracking-wide",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
