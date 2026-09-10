import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-aura-border bg-aura-panel/80 text-neutral-300 backdrop-blur-md",
        gold:
          "border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(212,175,55,0.15)]",
        accent:
          "border-blue-500/40 bg-blue-500/10 text-blue-300",
        outline:
          "border-neutral-700 text-neutral-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
