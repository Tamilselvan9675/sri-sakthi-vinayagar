"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Trophy,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GlassSelect } from "@/components/ui/glass-select";
import { Winner, Event } from "@/generated/prisma/client";
import { Messages } from "@/i18n/get-messages";
import { WinnerCard } from "@/components/festival/winner-card";
import { getLocalizedField } from "@/lib/utils/locale";

interface WinnersContentProps {
  winners: (Winner & { event?: Event | null; festivalYear: { year: number } })[];
  years: { year: number }[];
  locale: string;
  messages: Messages;
}

export function WinnersContent({
  winners,
  years,
  locale,
  messages,
}: WinnersContentProps) {
  const isTa = locale === "ta";

  // Combine years from festivalYears and winners, sort descending, fallback to current year
  const yearSet = new Set<number>([
    ...years.map((y) => y.year),
    ...winners.map((w) => w.festivalYear?.year).filter((y): y is number => typeof y === "number"),
  ]);
  const extractedYears = Array.from(yearSet).sort((a, b) => b - a);
  const defaultYear =
    extractedYears.length > 0 ? extractedYears[0] : new Date().getFullYear();
  const availableYears =
    extractedYears.length > 0 ? extractedYears : [defaultYear];

  // Extract unique game categories
  const categories = Array.from(
    new Set(winners.map((w) => w.categoryEn).filter(Boolean))
  );

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Mobile defaults to "list", Desktop defaults to "grid"
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setViewMode("grid");
    }
  }, []);

  // Filter winners based on selected year and category
  const filteredWinners = winners.filter((w) => {
    const matchYear = w.festivalYear?.year === selectedYear;
    const matchCat =
      selectedCategory === "All" || w.categoryEn === selectedCategory;
    return matchYear && matchCat;
  });

  // Lightbox preview for winners with photos
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const activeWinner =
    previewIndex !== null ? filteredWinners[previewIndex] ?? null : null;

  const closePreview = useCallback(() => setPreviewIndex(null), []);

  const nextWinner = useCallback(() => {
    if (filteredWinners.length <= 1) return;
    setPreviewIndex((prev) =>
      prev !== null && prev < filteredWinners.length - 1 ? prev + 1 : 0
    );
  }, [filteredWinners.length]);

  const prevWinner = useCallback(() => {
    if (filteredWinners.length <= 1) return;
    setPreviewIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : filteredWinners.length - 1
    );
  }, [filteredWinners.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewIndex === null) return;
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") prevWinner();
      if (e.key === "ArrowRight") nextWinner();
    };
    window.addEventListener("keydown", handleKeyDown);
    if (previewIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [previewIndex, closePreview, prevWinner, nextWinner]);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-20 max-w-7xl relative z-10">
      {/* Header and Unified Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-temple-gold/20 to-red-900/10 rounded-2xl mb-4 shadow-inner border border-temple-gold/20">
            <Trophy className="w-7 h-7 text-temple-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3 tracking-tight drop-shadow-sm">
            {messages.pages.winnersTitle}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {messages.pages.winnersDesc}
          </p>
        </div>

        {/* Filter & View Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-end gap-3 sm:gap-4 shrink-0 z-20 w-full lg:w-auto">
          {/* Year Dropdown */}
          <div className="relative group w-[calc(50%-0.375rem)] sm:w-36">
            <label className="text-xs font-bold text-temple-gold uppercase tracking-widest mb-1.5 block font-display">
              {messages.filters?.filterByYear || (isTa ? "ஆண்டு" : "Select Year")}
            </label>
            <div className="relative">
              <GlassSelect
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  closePreview();
                }}
                className="appearance-none w-full h-11 bg-white/80 dark:bg-card/80 backdrop-blur-md border border-temple-gold/30 rounded-xl px-3.5 py-2.5 pr-9 text-sm text-foreground font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-temple-gold/50 focus:border-temple-gold transition-all duration-300 cursor-pointer hover:shadow-md"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </GlassSelect>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-gold pointer-events-none" />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="relative group w-[calc(50%-0.375rem)] sm:w-48">
            <label className="text-xs font-bold text-temple-gold uppercase tracking-widest mb-1.5 block font-display">
              {isTa ? "போட்டி" : "Category"}
            </label>
            <div className="relative">
              <GlassSelect
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  closePreview();
                }}
                className="appearance-none w-full h-11 bg-white/80 dark:bg-card/80 backdrop-blur-md border border-temple-gold/30 rounded-xl px-3.5 py-2.5 pr-9 text-sm text-foreground font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-temple-gold/50 focus:border-temple-gold transition-all duration-300 cursor-pointer hover:shadow-md"
              >
                <option value="All">
                  {isTa ? "அனைத்து வகைகளும்" : "All Categories"}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </GlassSelect>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temple-gold pointer-events-none" />
            </div>
          </div>

          {/* Grid / List View Switcher */}
          <div className="w-full sm:w-auto">
            <label className="text-xs font-bold text-temple-gold uppercase tracking-widest mb-1.5 block font-display">
              {isTa ? "காட்சி" : "View"}
            </label>
            <div
              role="group"
              aria-label="View mode"
              className="inline-flex w-full sm:w-auto items-center p-1 h-11 rounded-xl bg-white/80 dark:bg-card/80 backdrop-blur-md border border-temple-gold/30 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-initial h-9 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-temple-gold text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={viewMode === "grid"}
                title={isTa ? "கட்டம்" : "Grid View"}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{isTa ? "கட்டம்" : "Grid"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex-1 sm:flex-initial h-9 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-temple-gold text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={viewMode === "list"}
                title={isTa ? "பட்டியல்" : "List View"}
              >
                <List className="w-4 h-4" />
                <span>{isTa ? "பட்டியல்" : "List"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Winners Content Area */}
      <div className="min-h-[360px]">
        <AnimatePresence mode="wait">
          {filteredWinners.length > 0 ? (
            viewMode === "grid" ? (
              <motion.div
                key={`grid-${selectedYear}-${selectedCategory}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4"
              >
                {filteredWinners.map((winner, index) => (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                  >
                    <WinnerCard
                      winner={winner}
                      locale={locale}
                      messages={messages}
                      viewMode="grid"
                      onClick={
                        winner.photoUrl ? () => setPreviewIndex(index) : undefined
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${selectedYear}-${selectedCategory}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {filteredWinners.map((winner, index) => (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                  >
                    <WinnerCard
                      winner={winner}
                      locale={locale}
                      messages={messages}
                      viewMode="list"
                      onClick={
                        winner.photoUrl ? () => setPreviewIndex(index) : undefined
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            )
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center py-20 sm:py-24 px-6 text-center border rounded-2xl border-dashed border-temple-gold/30 bg-temple-gold/5 backdrop-blur-sm min-h-[320px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-temple-gold/10 border border-temple-gold/20 flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-temple-gold/70" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold mb-2 text-foreground">
                {isTa ? "வெற்றியாளர்கள் விவரம் இல்லை" : "No Winners Found"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-5">
                {isTa
                  ? "தேர்ந்தெடுக்கப்பட்ட ஆண்டு அல்லது போட்டியில் வெற்றியாளர்கள் விவரம் இன்னும் சேர்க்கப்படவில்லை."
                  : messages.home?.noData ||
                    "No winner records are available for the selected filters yet."}
              </p>
              {selectedCategory !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className="px-4 py-2 rounded-xl bg-temple-gold/15 hover:bg-temple-gold text-temple-gold hover:text-white text-xs sm:text-sm font-semibold border border-temple-gold/30 transition-all cursor-pointer"
                >
                  {isTa ? "அனைத்து வகைகளையும் காண்க" : "Reset Category Filter"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Portaled Winner Photo Lightbox */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeWinner && activeWinner.photoUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] h-[100dvh] w-screen bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none"
                onClick={closePreview}
              >
                {/* Top Header Bar */}
                <div
                  className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 bg-black/75 backdrop-blur-md z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-temple-gold/20 border border-temple-gold/40 text-temple-gold text-xs font-semibold shrink-0">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{activeWinner.position}</span>
                    </span>
                    <h2 className="text-white font-display font-bold text-sm sm:text-base truncate">
                      {activeWinner.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closePreview}
                    aria-label={isTa ? "மூடு" : "Close preview"}
                    className="shrink-0 ml-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/15 hover:bg-temple-gold text-white hover:text-black font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 border border-white/25 transition-all shadow-lg cursor-pointer"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">
                      {isTa ? "மூடு" : "Close"}
                    </span>
                  </button>
                </div>

                {/* Image Stage */}
                <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-3 sm:px-16 py-3 overflow-hidden">
                  {filteredWinners.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevWinner();
                        }}
                        aria-label="Previous winner"
                        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextWinner();
                        }}
                        aria-label="Next winner"
                        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}

                  <div
                    className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeWinner.photoUrl}
                      alt={activeWinner.name}
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10"
                    />
                  </div>
                </div>

                {/* Bottom Details */}
                <div
                  className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-black/80 backdrop-blur-md text-center z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-white text-sm sm:text-base font-display font-bold line-clamp-1">
                    {activeWinner.name} —{" "}
                    {getLocalizedField(activeWinner, "category", locale)}
                  </p>
                  {getLocalizedField(activeWinner, "prize", locale) && (
                    <p className="text-white/75 text-xs sm:text-sm line-clamp-1 mt-0.5">
                      {getLocalizedField(activeWinner, "prize", locale)}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
