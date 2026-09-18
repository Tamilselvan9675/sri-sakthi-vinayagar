"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Trophy } from "lucide-react";
import { Winner, Event } from "@/generated/prisma/client";
import { Messages } from "@/i18n/get-messages";
import { WinnerCard } from "@/components/festival/winner-card";

interface WinnersContentProps {
  winners: (Winner & { event?: Event | null, festivalYear: { year: number } })[];
  years: { year: number }[];
  locale: string;
  messages: Messages;
}

export function WinnersContent({ winners, years, locale, messages }: WinnersContentProps) {
  // Sort years descending
  const sortedYears = [...years].sort((a, b) => b.year - a.year);
  const defaultYear = sortedYears.length > 0 ? sortedYears[0].year : new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  // Filter winners based on selected year
  const filteredWinners = winners.filter(w => w.festivalYear?.year === selectedYear);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl relative z-10">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-temple-gold/20 to-orange-500/10 rounded-2xl mb-6 shadow-inner border border-temple-gold/20">
            <Trophy className="w-8 h-8 text-temple-gold" />
          </div>
          <h1 className="text-4xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-tight drop-shadow-sm">
            {messages.pages.winnersTitle}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {messages.pages.winnersDesc}
          </p>
        </div>
        
        {/* Premium Year Dropdown */}
        <div className="shrink-0 relative group z-20">
          <label className="text-xs font-bold text-temple-gold uppercase tracking-widest mb-2 block font-display">
            {messages.filters?.filterByYear || "Select Year"}
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none w-full sm:w-48 bg-white/80 dark:bg-card/80 backdrop-blur-md border border-temple-gold/30 rounded-xl px-4 py-3 pr-10 text-foreground font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-temple-gold/50 focus:border-temple-gold transition-all duration-300 cursor-pointer hover:shadow-md hover:bg-white dark:hover:bg-card"
            >
              {sortedYears.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year} Festival
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-temple-gold pointer-events-none group-hover:translate-y-[2px] transition-transform" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-temple-gold/30 to-red-900/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none -z-10" />
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {filteredWinners.length > 0 ? (
            <motion.div 
              key={selectedYear}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                },
                exit: { opacity: 0, transition: { duration: 0.2 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredWinners.map((winner) => (
                <motion.div 
                  key={winner.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}
                >
                  <WinnerCard 
                    winner={winner} 
                    locale={locale} 
                    messages={messages} 
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-32 px-4 text-center border rounded-3xl border-dashed border-temple-gold/30 bg-temple-gold/5 backdrop-blur-sm"
            >
              <Trophy className="h-16 w-16 text-temple-gold/40 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                No Winners Found
              </h3>
              <p className="text-muted-foreground">{messages.home.noData}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
