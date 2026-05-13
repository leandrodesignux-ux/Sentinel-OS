import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "bg-[#F6F4D2] text-[#1A1D1D] border-transparent",
      secondary: "bg-[#2B2E2E] text-[#A8AFAF] border border-[#3D4141]",
      outline: "border-[#3D4141] text-[#A8AFAF] bg-transparent",
      destructive: "bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20",
      warning: "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20",
      success: "bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
