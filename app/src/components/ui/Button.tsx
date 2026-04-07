"use client";

import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary:
    "bg-gradient-to-r from-accent to-emerald-500 text-white shadow-[0_2px_16px_rgba(16,185,129,0.25)]",
  secondary:
    "bg-surface text-text shadow-sm border border-border hover:bg-bg-secondary",
  ghost:
    "bg-transparent text-text-secondary hover:text-text hover:bg-surface",
  outline:
    "bg-transparent border border-border text-text hover:border-accent/40 hover:text-accent hover:bg-accent/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-sm rounded-2xl",
  lg: "px-8 py-3.5 text-base rounded-2xl",
  xl: "px-10 py-4 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", children, fullWidth, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 font-semibold
          transition-all duration-200 cursor-pointer
          hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
