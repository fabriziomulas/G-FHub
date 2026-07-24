import { cn } from "@/lib/cn";

const LEVEL_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  STONE:   { icon: "🪨", color: "text-gray-400", bg: "bg-gray-400/10" },
  BRONZE:  { icon: "🥉", color: "text-amber-600", bg: "bg-amber-600/10" },
  SILVER:  { icon: "🥈", color: "text-gray-300", bg: "bg-gray-300/10" },
  GOLD:    { icon: "🥇", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  PLATINUM:{ icon: "💎", color: "text-cyan-300", bg: "bg-cyan-300/10" },
  DIAMOND: { icon: "👑", color: "text-blue-300", bg: "bg-blue-300/10" },
  MASTER:  { icon: "🔮", color: "text-purple-300", bg: "bg-purple-300/10" },
  LEGEND:  { icon: "🌟", color: "text-amber-300", bg: "bg-amber-300/10" },
};

interface LevelBadgeProps {
  level: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.STONE;

  const sizeMap = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bg,
        config.color,
        sizeMap[size],
        className
      )}
    >
      <span>{config.icon}</span>
      {level}
    </span>
  );
}