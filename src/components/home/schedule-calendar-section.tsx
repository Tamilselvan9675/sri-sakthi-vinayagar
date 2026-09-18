"use client";

import { useState, useMemo } from "react";
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
  addDays
} from "date-fns";
import { enUS, ta } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame, MapPin, ArrowRight } from "lucide-react";
import { Messages } from "@/i18n/get-messages";
import { mockPoojas, mockEvents } from "@/lib/constants/mock-schedule";
import { SectionHeader } from "@/components/ui/section-header";
import { MotionButton } from "./motion-button";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

interface ScheduleCalendarSectionProps {
  locale: string;
  messages: Messages;
}

export function ScheduleCalendarSection({ locale }: ScheduleCalendarSectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateLocale = locale === "ta" ? ta : enUS;

  // Next/Prev month handlers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  // Generate calendar grid
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Selected date data
  const selectedPoojas = mockPoojas.filter(p => isSameDay(p.date, selectedDate));
  const selectedEvents = mockEvents.filter(e => isSameDay(e.date, selectedDate));

  return (
    <section className="max-w-5xl mx-auto space-y-6" id="schedule">
      <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
        <SectionHeader
          title={locale === "ta" ? "வரவிருக்கும் பூஜை & நிகழ்வுகள்" : "Upcoming Pooja & Events"}
          subtitle={locale === "ta" ? "கோயிலின் சிறப்பு பூஜைகள் மற்றும் நிகழ்வுகளை பற்றி தெரிந்து கொள்ளுங்கள்." : "Stay updated with the temple's upcoming poojas and special events."}
          icon={CalendarIcon}
        />
        <Link href={`/${locale}/pooja`}>
          <MotionButton variant="outline-temple" className="text-xs py-2 px-4 h-9">
            {locale === "ta" ? "முழு அட்டவணை" : "View Full Schedule"}
            <ArrowRight className="h-3.5 w-3.5 ml-2" />
          </MotionButton>
        </Link>
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
                <button onClick={prevMonth} className="p-1 rounded hover:bg-muted text-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-muted text-foreground transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="relative z-10 p-5 sm:p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-1.5">
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
                  const hasPooja = mockPoojas.some(p => isSameDay(p.date, day));
                  const hasEvent = mockEvents.some(e => isSameDay(e.date, day));

                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all duration-300
                        ${isSelected ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-[0.98]' : 'hover:bg-primary/5 hover:scale-105'}
                        ${!isCurrentMonth && !isSelected ? 'text-muted-foreground/30' : ''}
                        ${isCurrentMonth && !isSelected ? 'text-foreground font-medium' : ''}
                        ${isTodayDate && !isSelected ? 'ring-2 ring-primary/30 bg-primary/5 font-bold text-primary' : ''}
                      `}
                    >
                      <span className="text-sm">{format(day, "d")}</span>
                      
                      {/* Indicators */}
                      <div className="absolute bottom-1.5 flex items-center gap-1">
                        {hasPooja && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                        )}
                        {hasEvent && (
                          <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-temple-gold' : 'bg-temple-gold'}`} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-24 bg-card rounded-[1.5rem] border border-primary/10 shadow-xl shadow-primary/5 overflow-hidden flex-1 p-5 sm:p-8 relative">
            <div className="absolute -top-10 -right-10 text-[100px] text-primary/[0.03] pointer-events-none">
              <CalendarIcon />
            </div>

            <div className="relative z-10">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                {format(selectedDate, "EEEE", { locale: dateLocale })}
              </h4>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 pb-3 border-b border-border/50">
                {format(selectedDate, "MMMM d, yyyy", { locale: dateLocale })}
              </h3>

              <div className="space-y-6">
                {/* Poojas */}
                {selectedPoojas.length > 0 && (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Flame className="w-3.5 h-3.5 text-primary" />
                      {locale === "ta" ? "பூஜைகள்" : "Poojas"}
                    </div>
                    <div className="space-y-3">
                      {selectedPoojas.map(pooja => (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={pooja.id} 
                          className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors"
                        >
                          <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                          <div className="text-[10px] font-bold text-primary mb-0.5 tracking-wider">{pooja.time}</div>
                          <h5 className="font-semibold text-foreground text-base">{locale === "ta" ? pooja.titleTa : pooja.titleEn}</h5>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{locale === "ta" ? pooja.descriptionTa : pooja.descriptionEn}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {selectedEvents.length > 0 && (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <CalendarIcon className="w-3.5 h-3.5 text-temple-gold" />
                      {locale === "ta" ? "நிகழ்வுகள்" : "Events"}
                    </div>
                    <div className="space-y-3">
                      {selectedEvents.map(event => (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={event.id} 
                          className="group relative pl-4 border-l-2 border-temple-gold/30 hover:border-temple-gold transition-colors"
                        >
                          <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-temple-gold" />
                          <div className="text-[10px] font-bold text-temple-gold mb-0.5 tracking-wider">{event.time}</div>
                          <h5 className="font-semibold text-foreground text-base">{locale === "ta" ? event.titleTa : event.titleEn}</h5>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 text-temple-gold/70" />
                            <span>{event.location}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPoojas.length === 0 && selectedEvents.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-3 border border-primary/10">
                      <CalendarIcon className="w-5 h-5 text-primary/40" />
                    </div>
                    <p className="text-xs font-medium">
                      {locale === "ta" ? "இந்த தேதியில் எந்த நிகழ்வும் இல்லை." : "No scheduled events or poojas on this date."}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
