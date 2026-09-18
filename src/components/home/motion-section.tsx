"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView } from "motion/react";

/**
 * Motion-powered section reveal animation.
 * Replaces AnimateOnScroll for major home page sections with smoother Motion animations.
 * Respects prefers-reduced-motion via Motion's built-in support.
 */

interface MotionSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function MotionSection({
  children,
  className = "",
  delay = 0,
}: MotionSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -60px 0px",
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: delay / 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
