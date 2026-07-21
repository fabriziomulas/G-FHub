"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type CardVariant = "default" | "glass" | "interactive";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-background-secondary border border-border-default",
  glass: "glass",
  interactive: "glass cursor-pointer hover:bg-white/8 hover:border-border-light hover:shadow-glow-blue",
};

const paddingMap: Record<string, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={variant === "interactive" ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-xl transition-all duration-200",
        variantStyles[variant],
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}