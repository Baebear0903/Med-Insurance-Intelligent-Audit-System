import React from "react";
import { cn } from "@/src/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    link: "text-blue-600 hover:text-blue-800 hover:underline px-0 py-0 h-auto focus:ring-0",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-6 text-base",
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], variant !== "link" && sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
