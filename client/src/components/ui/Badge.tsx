import React from "react";

export type BadgeVariant = "critical" | "warning" | "success" | "primary" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ children, variant = "neutral", className = "", size = "sm" }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    critical: "bg-red-500/10 text-red-400 border-red-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    primary: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    neutral: "bg-slate-800/60 text-slate-300 border-slate-700/50"
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 tracking-wider",
    md: "text-xs px-2.5 py-1"
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase font-semibold border rounded ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
