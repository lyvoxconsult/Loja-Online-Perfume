import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  showText?: boolean;
}

export const Logo = ({ className, variant = "default", showText = true }: LogoProps) => {
  const textColor = variant === "white" ? "text-primary-foreground" : "text-primary";

  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5 group", className)} aria-label="Lumina English Academy">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shadow-soft transition-transform group-hover:scale-105">
        <Languages className="h-5 w-5 text-secondary-foreground" aria-hidden="true" />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display font-bold text-lg tracking-tight", textColor)}>Lumina</span>
          <span className={cn("text-[10px] font-medium uppercase tracking-[0.18em]", variant === "white" ? "text-primary-foreground/70" : "text-muted-foreground")}>English Academy</span>
        </span>
      )}
    </Link>
  );
};
