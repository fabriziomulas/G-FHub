"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionStyles = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
  };

  const arrowStyles = {
    top: "top-full border-t-white/10 border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full border-b-white/10 border-l-transparent border-r-transparent border-t-transparent",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 z-50",
              positionStyles[position],
              className
            )}
          >
            <div className="glass px-2.5 py-1.5 rounded-lg text-xs text-text-primary whitespace-nowrap">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}