import { cn } from "@/lib/cn";

type SkeletonShape = "text" | "circular" | "rectangular";

interface SkeletonProps {
  shape?: SkeletonShape;
  width?: string;
  height?: string;
  className?: string;
}

const shapeMap: Record<SkeletonShape, string> = {
  text: "h-4 rounded",
  circular: "rounded-full",
  rectangular: "rounded-lg",
};

export function Skeleton({
  shape = "text",
  width,
  height,
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white/5 animate-shimmer bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%]",
        shapeMap[shape],
        className
      )}
      style={{ width, height }}
    />
  );
}