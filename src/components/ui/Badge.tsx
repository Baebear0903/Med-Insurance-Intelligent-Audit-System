import React from "react";
import { cn } from "@/src/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  status?: "success" | "warning" | "error" | "default" | "info";
  variant?: "solid" | "outline" | "soft";
  children?: React.ReactNode;
};

export function Badge({ children, status = "default", variant = "soft", className, ...props }: BadgeProps) {
  const statusStyles = {
    soft: {
      success: "bg-green-100 text-green-700",
      warning: "bg-orange-100 text-orange-700",
      error: "bg-red-100 text-red-700",
      info: "bg-blue-100 text-blue-700",
      default: "bg-slate-100 text-slate-700",
    },
    solid: {
      success: "bg-green-500 text-white",
      warning: "bg-orange-500 text-white",
      error: "bg-red-500 text-white",
      info: "bg-blue-500 text-white",
      default: "bg-slate-500 text-white",
    },
    outline: {
      success: "border border-green-200 text-green-700",
      warning: "border border-orange-200 text-orange-700",
      error: "border border-red-200 text-red-700",
      info: "border border-blue-200 text-blue-700",
      default: "border border-slate-200 text-slate-700",
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        statusStyles[variant][status],
        className
      )}
      {...props}
    >
      {/* optional little dot indicator */}
      {variant === "soft" && (
        <span className={cn(
          "mr-1.5 w-1.5 h-1.5 rounded-full",
          status === "success" && "bg-green-500",
          status === "warning" && "bg-orange-500",
          status === "error" && "bg-red-500",
          status === "info" && "bg-blue-500",
          status === "default" && "bg-slate-400"
        )} />
      )}
      {children}
    </span>
  );
}
