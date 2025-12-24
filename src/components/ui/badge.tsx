import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
                secondary:
                    "bg-slate-700 text-slate-300 border border-slate-600",
                todo: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
                applied: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
                followup: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
                interview: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
                offer: "bg-green-500/20 text-green-300 border border-green-500/30",
                rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
