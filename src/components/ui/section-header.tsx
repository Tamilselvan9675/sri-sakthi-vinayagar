import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`space-y-3 ${
        align === "center" ? "text-center" : ""
      } ${className}`}
    >
      {/* Decorative tag with optional icon */}
      {Icon && (
        <div
          className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Title */}
      <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Decorative underline */}
      <div
        className={`flex items-center gap-2 pt-2 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <div className="h-0.5 w-8 bg-primary rounded-full" />
        <div className="h-1 w-1 rounded-full bg-temple-gold" />
        <div className="h-0.5 w-16 bg-primary/30 rounded-full" />
      </div>
    </div>
  );
}
