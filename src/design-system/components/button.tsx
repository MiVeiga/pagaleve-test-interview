"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:ring-zinc-400",
  outline:
    "border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-50 focus-visible:ring-zinc-400",
  ghost:
    "bg-transparent text-zinc-900 hover:bg-zinc-100 focus-visible:ring-zinc-400",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
} as const;

const buttonSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
