"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";

/**
 * Premium animated button using Motion for React.
 * Provides temple-palette styled buttons with subtle hover/tap animations.
 *
 * Variants:
 * - temple-primary: Deep maroon/temple-red primary CTA
 * - hero-outline: White outline for hero section
 * - hero-gold: Gold accent for hero section
 * - outline-temple: Maroon outline for content sections
 * - whatsapp: Green WhatsApp style
 */

interface MotionButtonProps {
  children: ReactNode;
  variant?:
    | "temple-primary"
    | "hero-outline"
    | "hero-gold"
    | "outline-temple"
    | "premium-gold"
    | "whatsapp";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variantClasses: Record<string, string> = {
  "temple-primary":
    "bg-[oklch(0.35_0.12_22)] hover:bg-[oklch(0.32_0.13_22)] text-white border border-[oklch(0.35_0.12_22)] shadow-sm",
  "hero-outline":
    "bg-transparent border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
  "hero-gold":
    "bg-transparent border border-temple-gold/40 text-temple-gold hover:bg-temple-gold/10 backdrop-blur-sm",
  "outline-temple":
    "bg-transparent border border-primary/30 text-primary hover:bg-primary/5",
  "premium-gold":
    "relative overflow-hidden bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[oklch(0.20_0.08_20)] font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] border border-[#D4AF37]/50 bg-[length:200%_auto] hover:bg-[position:100%_center] transition-all duration-500",
  whatsapp:
    "bg-transparent border border-green-600/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30",
};

export function MotionButton({
  children,
  variant = "temple-primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: MotionButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
