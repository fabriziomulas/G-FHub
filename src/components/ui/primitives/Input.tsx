"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type InputVariant = "default" | "glass";

interface InputProps extends Omit<HTMLMotionProps<"input">, "ref"> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<InputVariant, string> = {
  default:
    "bg-background-secondary border-border-default focus:border-accent-electric focus:ring-1 focus:ring-accent-electric/30",
  glass:
    "glass border-border-light focus:border-accent-electric focus:ring-1 focus:ring-accent-electric/30",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { variant = "default", label, error, leftIcon, rightIcon, className, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <motion.input
            ref={ref}
            id={inputId}
            whileFocus={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "w-full h-10 px-3 rounded-lg text-sm text-text-primary placeholder:text-text-muted transition-colors duration-200 outline-none",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
              variantStyles[variant],
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1.5"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";