"use client";

import { useEffect, useState } from "react";
import { Messages } from "@/i18n/get-messages";
import { TempleDivider } from "@/components/ui/temple-divider";
import { Flower2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center justify-center relative">
    <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-background/60 backdrop-blur-md rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)] relative overflow-hidden group">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
      
      <span className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground tabular-nums">
        {value.toString().padStart(2, "0")}
      </span>
    </div>
    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-3 uppercase tracking-[0.2em]">
      {label}
    </span>
  </div>
);

const Separator = () => (
  <div className="flex flex-col items-center justify-center -translate-y-4 px-1 sm:px-2 lg:px-4">
    <span className="text-xl sm:text-3xl text-primary/40 font-light">:</span>
  </div>
);

interface CountdownProps {
  startDate: Date;
  endDate: Date;
  messages: Messages;
  locale?: string;
}

export function Countdown({ startDate, endDate, messages, locale = "ta" }: CountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  // Avoid hydration mismatch by setting time only on client
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="w-full max-w-4xl mx-auto rounded-3xl h-[280px] bg-background/40 backdrop-blur animate-pulse border border-border/50" />
    );
  }

  const isUpcoming = now < startDate;
  const isOngoing = now >= startDate && now <= endDate;
  const isEnded = now > endDate;

  let title = messages.home.countdownEnded;
  let targetDate = endDate;

  if (isUpcoming) {
    title = messages.home.countdownUpcoming;
    targetDate = startDate;
  } else if (isOngoing) {
    title = messages.home.countdownOngoing;
    targetDate = endDate;
  }

  if (isEnded) {
    return (
      <div className="w-full max-w-3xl mx-auto relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-temple-gold/10 to-primary/5 rounded-3xl blur-xl transition-all duration-700 opacity-50 group-hover:opacity-70" />
        <div className="relative p-8 sm:p-12 bg-background/80 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-2xl flex flex-col items-center text-center space-y-6">
          <Flower2 className="w-12 h-12 text-primary/40" />
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            {messages.home.countdownEnded}
          </h3>
          <TempleDivider variant="subtle" />
          <p className="text-muted-foreground mb-4">
            {messages.home.countdownMemories}
          </p>
          <Link href={`/${locale}/festival`}>
            <Button className="gap-2 rounded-xl">
              {messages.home.exploreFestival}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const diff = targetDate.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="w-full max-w-4xl mx-auto relative group">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-temple-gold/10 to-primary/10 rounded-3xl blur-2xl transition-all duration-700 opacity-50 group-hover:opacity-80" />
      
      <div className="relative p-8 sm:p-10 lg:p-14 bg-background/70 backdrop-blur-2xl rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl flex flex-col items-center">
        {/* Decorative inner border */}
        <div className="absolute inset-4 sm:inset-6 rounded-2xl border border-primary/10 pointer-events-none" />
        
        <h3 className="text-sm sm:text-base font-medium text-primary uppercase tracking-[0.2em] mb-8 sm:mb-12 text-center">
          {title}
        </h3>
        
        <div className="flex items-center justify-center w-full">
          <TimeUnit value={days} label={messages.home.days} />
          <Separator />
          <TimeUnit value={hours} label={messages.home.hours} />
          <Separator />
          <TimeUnit value={minutes} label={messages.home.minutes} />
          <Separator />
          <TimeUnit value={seconds} label={messages.home.seconds} />
        </div>
      </div>
    </div>
  );
}
