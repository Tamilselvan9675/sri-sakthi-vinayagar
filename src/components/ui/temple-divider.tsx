interface TempleDividerProps {
  className?: string;
  variant?: "default" | "subtle" | "gold";
}

export function TempleDivider({ className = "", variant = "default" }: TempleDividerProps) {
  const colors = {
    default: {
      line: "bg-border",
      dot: "bg-primary",
      diamond: "border-primary/40",
    },
    subtle: {
      line: "bg-border/50",
      dot: "bg-muted-foreground/30",
      diamond: "border-muted-foreground/20",
    },
    gold: {
      line: "bg-temple-gold/30",
      dot: "bg-temple-gold",
      diamond: "border-temple-gold/40",
    },
  };

  const c = colors[variant];

  return (
    <div
      className={`flex items-center justify-center gap-3 py-2 ${className}`}
      role="separator"
      aria-hidden="true"
    >
      <div className={`h-px flex-1 max-w-24 ${c.line}`} />
      <div className={`h-1.5 w-1.5 rotate-45 border ${c.diamond}`} />
      <div className={`h-2 w-2 rounded-full ${c.dot}`} />
      <div className={`h-1.5 w-1.5 rotate-45 border ${c.diamond}`} />
      <div className={`h-px flex-1 max-w-24 ${c.line}`} />
    </div>
  );
}
