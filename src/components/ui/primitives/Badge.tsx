import { cn } from "@/lib/cn";

type BadgeVariant = "solid" | "outline" | "subtle";
type BadgeColor = "electric" | "purple" | "success" | "error" | "warning";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<BadgeColor, { bg: string; text: string; border: string; dot: string }> = {
  electric: {
    bg: "bg-accent-electric/20",
    text: "text-accent-electric",
    border: "border-accent-electric/40",
    dot: "bg-accent-electric",
  },
  purple: {
    bg: "bg-accent-purple/20",
    text: "text-accent-purple",
    border: "border-accent-purple/40",
    dot: "bg-accent-purple",
  },
  success: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  error: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/40",
    dot: "bg-red-400",
  },
  warning: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
  },
};

const sizeMap: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  variant = "subtle",
  color = "electric",
  size = "md",
  dot = false,
  children,
  className,
}: BadgeProps) {
  const colors = colorMap[color];

  const variantStyles: Record<BadgeVariant, string> = {
    solid: `${colors.bg} ${colors.text} border border-transparent`,
    outline: `bg-transparent ${colors.text} ${colors.border} border`,
    subtle: `${colors.bg} ${colors.text} border border-transparent`,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium leading-none",
        variantStyles[variant],
        sizeMap[size],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />}
      {children}
    </span>
  );
}