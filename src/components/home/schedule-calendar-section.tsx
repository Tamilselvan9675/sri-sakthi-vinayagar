"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addDays,
} from "date-fns";
import { enUS, ta } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Messages } from "@/i18n/get-messages";
import type { PanchangamData } from "@/lib/api/prokerala";
import { SectionHeader } from "@/components/ui/section-header";
import { motion, AnimatePresence } from "motion/react";

interface ScheduleCalendarSectionProps {
  locale: string;
  messages: Messages;
}

// Client-side memory cache keyed by "YYYY-MM-DD:locale"
const clientPanchangamCache = new Map<string, PanchangamData>();

export function ScheduleCalendarSection({ locale }: ScheduleCalendarSectionProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [panchangam, setPanchangam] = useState<PanchangamData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const dateLocale = locale === "ta" ? ta : enUS;
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const cacheKey = `${selectedDateKey}:${locale === "ta" ? "ta" : "en"}`;

  // Next/Prev month handlers — also update selectedDate so month navigation dynamically updates Panchangam
  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    const now = new Date();
    setSelectedDate(isSameMonth(next, now) ? now : startOfMonth(next));
  };

  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
    const now = new Date();
    setSelectedDate(isSameMonth(prev, now) ? now : startOfMonth(prev));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(startOfMonth(day));
    }
  };

  const handleRetry = useCallback(() => {
    clientPanchangamCache.delete(cacheKey);
    setRetryCount((c) => c + 1);
  }, [cacheKey]);

  // Fetch Panchangam for the selected date with client cache + debounce
  useEffect(() => {
    const cached = clientPanchangamCache.get(cacheKey);
    if (cached) {
      setPanchangam(cached);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/panchangam?date=${encodeURIComponent(selectedDateKey)}&locale=${encodeURIComponent(locale)}`,
          { signal: controller.signal },
        );
        const json = (await res.json()) as {
          ok?: boolean;
          data?: PanchangamData;
          error?: string;
        };

        if (!res.ok || !json.ok || !json.data) {
          throw new Error(json.error || "Unable to load Panchangam");
        }

        clientPanchangamCache.set(cacheKey, json.data);
        setPanchangam(json.data);
        setError(null);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setError(
          locale === "ta"
            ? "பஞ்சாங்க விவரங்களை ஏற்ற முடியவில்லை."
            : "Could not load Panchangam details.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cacheKey, selectedDateKey, locale, retryCount]);

  // Generate calendar grid
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Selected date data
  const observances = panchangam?.observances ?? [];

  return (
    <section className="max-w-5xl mx-auto space-y-6" id="schedule">
      <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
        <SectionHeader
          title={locale === "ta" ? "வரவிருக்கும் பூஜை & நிகழ்வுகள்" : "Upcoming Pooja & Events"}
          subtitle={
            locale === "ta"
              ? "கோயிலின் சிறப்பு பூஜைகள் மற்றும் நிகழ்வுகளை பற்றி தெரிந்து கொள்ளுங்கள்."
              : "Stay updated with the temple's upcoming poojas and special events."
          }
          icon={CalendarIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
        {/* LEFT: CALENDAR */}
        <div className="lg:col-span-7 bg-card rounded-[1.5rem] border border-primary/10 shadow-xl shadow-primary/5 overflow-hidden flex flex-col relative">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-5 sm:p-6 border-b border-border/50">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/10"
              >
                {locale === "ta" ? "இன்று" : "Today"}
              </button>
              <div className="flex items-center gap-0.5 bg-background border border-border rounded-md p-0.5 shadow-sm">
                <button
                  onClick={prevMonth}
                  aria-label="Previous month"
                  className="p-1 rounded hover:bg-muted text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  aria-label="Next month"
                  className="p-1 rounded hover:bg-muted text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="relative z-10 p-5 sm:p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-1.5"
                >
                  {format(addDays(startOfWeek(new Date()), i), "EEE", { locale: dateLocale })}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              <AnimatePresence mode="popLayout">
                {days.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleSelectDay(day)}
                      className={`
                        relative aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all duration-300
                        ${isSelected ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-[0.98]" : "hover:bg-primary/5 hover:scale-105"}
                        ${!isCurrentMonth && !isSelected ? "text-muted-foreground/30" : ""}
                        ${isCurrentMonth && !isSelected ? "text-foreground font-medium" : ""}
                        ${isTodayDate && !isSelected ? "ring-2 ring-primary/30 bg-primary/5 font-bold text-primary" : ""}
                      `}
                    >
                      <span className="text-sm">{format(day, "d")}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-24 bg-card rounded-[1.5rem] border border-primary/10 shadow-xl shadow-primary/5 overflow-hidden flex-1 p-5 sm:p-7 relative">
            <div className="absolute -top-10 -right-10 text-[100px] text-primary/[0.03] pointer-events-none">
              <CalendarIcon />
            </div>

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {panchangam?.weekday || format(selectedDate, "EEEE", { locale: dateLocale })}
                </h4>
                {panchangam?.tamilDateFormatted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-temple-gold/15 border border-temple-gold/30 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                    <Sparkles className="w-3 h-3 text-temple-gold" />
                    {locale === "ta"
                      ? `தமிழ்: ${panchangam.tamilDateFormatted}`
                      : `Tamil: ${panchangam.tamilDateFormatted}`}
                  </span>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-5 pb-3 border-b border-border/50">
                {format(selectedDate, "MMMM d, yyyy", { locale: dateLocale })}
              </h3>

              <div className="space-y-5">
                {/* TAMIL HINDU PANCHANGAM SECTION */}
                <div className="rounded-xl bg-primary/[0.03] dark:bg-primary/[0.06] border border-primary/10 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-temple-gold" />
                      {locale === "ta" ? "தமிழ் பஞ்சாங்கம்" : "Tamil Panchangam"}
                    </span>
                    {isLoading && (
                      <span className="text-[10px] text-muted-foreground animate-pulse">
                        {locale === "ta" ? "ஏற்றுகிறது..." : "Loading..."}
                      </span>
                    )}
                  </div>

                  {isLoading && !panchangam ? (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="h-11 rounded-lg bg-muted/50 animate-pulse border border-border/30"
                        />
                      ))}
                    </div>
                  ) : error && !panchangam ? (
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground py-2">
                      <span>{error}</span>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold hover:bg-primary/15 transition-colors shrink-0"
                      >
                        <RefreshCw className="w-3 h-3" />
                        {locale === "ta" ? "மீண்டும்" : "Retry"}
                      </button>
                    </div>
                  ) : panchangam ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="rounded-lg bg-background/70 border border-border/50 px-3 py-2">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Moon className="w-3 h-3 text-primary" />
                            {locale === "ta" ? "திதி" : "Tithi"}
                          </div>
                          <div className="font-medium text-foreground mt-0.5 leading-snug">
                            {panchangam.tithi}
                          </div>
                        </div>

                        <div className="rounded-lg bg-background/70 border border-border/50 px-3 py-2">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-temple-gold" />
                            {locale === "ta" ? "நட்சத்திரம்" : "Nakshatra"}
                          </div>
                          <div className="font-medium text-foreground mt-0.5 leading-snug">
                            {panchangam.nakshatra}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-background/70 border border-border/50 px-2.5 py-2">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary/80" />
                            {locale === "ta" ? "ராகு காலம்" : "Rahu Kalam"}
                          </div>
                          <div className="font-semibold text-foreground mt-0.5 text-[11px]">
                            {panchangam.rahuKalam}
                          </div>
                        </div>

                        <div className="rounded-lg bg-background/70 border border-border/50 px-2.5 py-2">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3 text-temple-gold" />
                            {locale === "ta" ? "யமகண்டம்" : "Yamagandam"}
                          </div>
                          <div className="font-semibold text-foreground mt-0.5 text-[11px]">
                            {panchangam.yamagandam}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div className="flex items-center gap-2 rounded-lg bg-background/70 border border-border/50 px-2.5 py-1.5">
                          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <div>
                            <div className="text-[9px] font-semibold text-muted-foreground uppercase">
                              {locale === "ta" ? "சூரிய உதயம்" : "Sunrise"}
                            </div>
                            <div className="font-semibold text-foreground text-[11px]">
                              {panchangam.sunrise}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-background/70 border border-border/50 px-2.5 py-1.5">
                          <Sunset className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <div>
                            <div className="text-[9px] font-semibold text-muted-foreground uppercase">
                              {locale === "ta" ? "சூரிய அஸ்தமனம்" : "Sunset"}
                            </div>
                            <div className="font-semibold text-foreground text-[11px]">
                              {panchangam.sunset}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Special Panchangam Observances (Vratam / Auspicious Days) */}
                {observances.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-temple-gold" />
                      {locale === "ta" ? "சிறப்பு வழிபாடு" : "Special Observance"}
                    </div>
                    <div className="space-y-2">
                      {observances.map((obs) => (
                        <div
                          key={obs.id}
                          className="rounded-xl bg-temple-gold/10 border border-temple-gold/30 px-3.5 py-2.5"
                        >
                          <div className="font-semibold text-foreground text-sm">{obs.title}</div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {obs.subtitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
