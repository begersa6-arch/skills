import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  isMatched?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function SkillBadge({ 
  skill, 
  isMatched = false, 
  isSelected = false,
  onClick, 
  size = "md" 
}: SkillBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all duration-200",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        onClick && "cursor-pointer hover:scale-105",
        isMatched
          ? "bg-cheer-success/20 text-cheer-success border border-cheer-success/30"
          : isSelected
          ? "bg-primary/30 text-primary-foreground border border-primary/50"
          : "bg-muted text-muted-foreground border border-border"
      )}
    >
      {skill}
    </span>
  );
}
