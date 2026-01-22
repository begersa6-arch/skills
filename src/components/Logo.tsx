import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-primary glow-text">CHEER</span>
    </span>
  );
}
