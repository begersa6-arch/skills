import { cn } from "@/lib/utils";

interface MatchIndicatorProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
}

export function MatchIndicator({ percentage, size = "md" }: MatchIndicatorProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-lg",
  };

  const getColor = () => {
    if (percentage >= 70) return "text-cheer-success";
    if (percentage >= 40) return "text-cheer-warning";
    return "text-destructive";
  };

  const getGradient = () => {
    if (percentage >= 70) return "from-cheer-success to-cheer-success";
    if (percentage >= 40) return "from-cheer-warning to-cheer-warning";
    return "from-destructive to-destructive";
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-bold",
        sizeClasses[size],
        getColor()
      )}
      style={{
        background: `conic-gradient(
          hsl(var(--cheer-success)) ${percentage}%, 
          hsl(var(--muted)) ${percentage}%
        )`,
      }}
    >
      <div className="absolute inset-1 rounded-full bg-card flex items-center justify-center">
        <span className={cn("font-bold", getColor())}>{percentage}%</span>
      </div>
    </div>
  );
}
