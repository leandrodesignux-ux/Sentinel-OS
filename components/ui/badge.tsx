import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "border-primary/30 bg-primary/10 text-primary",
      secondary: "border-border bg-secondary text-foreground",
      destructive: "border-critical/40 bg-critical/10 text-critical",
      warning: "border-warn/40 bg-warn/10 text-warn",
      success: "border-ok/40 bg-ok/10 text-ok",
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
