"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  LayoutGrid,
  List,
} from "lucide-react";
import { GlassSelect } from "@/components/ui/glass-select";
import { Messages } from "@/i18n/get-messages";
import type { CmsVideoItem } from "@/lib/cms/content";

interface VideosContentProps {
  locale: string;
  messages: Messages;
  items: CmsVideoItem[];
  categories: string[];
  festivalYears?: number[];
  loadError?: boolean;
}

export function VideosContent({
  locale,
  messages,
  items,
  categories,
  festivalYears = [],
  loadError,
}: VideosContentProps) {
  const isTa = locale === "ta";

  // Extract unique years from CMS data, sort descending, fallback to current year
  const itemYears = Array.from(new Set(items.map((item) => item.year))).sort(
    (a, b) => b - a
  );
  const extractedYears = Array.from(
    new Set([...itemYears, ...festivalYears])
  ).sort((a, b) => b - a);
  const defaultYear =
    itemYears.length > 0
      ? itemYears[0]
      : extractedYears.length > 0
        ? extractedYears[0]
        : new Date().getFullYear();
  const availableYears =
    extractedYears.length > 0 ? extractedYears : [defaultYear];

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

  // YouTube Modal state
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchYear = item.year === selectedYear;
    const matchCat =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchYear && matchCat;
  });

  const activeVideo =
    modalIndex !== null ? filteredItems[modalIndex] ?? null : null;

  const closeModal = useCallback(() => setModalIndex(null), []);

  const nextVideo = useCallback(() => {
    if (filteredItems.length <= 1) return;
    setModalIndex((prev) =>
      prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
    );
  }, [filteredItems.length]);

  const prevVideo = useCallback(() => {
    if (filteredItems.length <= 1) return;
    setModalIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
    );
  }, [filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalIndex === null) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevVideo();
      if (e.key === "ArrowRight") nextVideo();
    };
    window.addEventListener("keydown", handleKeyDown);
    if (modalIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [modalIndex, closeModal, prevVideo, nextVideo]);

  const openModal = (index: number) => setModalIndex(index);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-20 max-w-7xl relative z-10">
      {/* Header and Unified Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-temple-gold/20 to-red-900/10 rounded-2xl mb-4 shadow-inner border border-temple-gold/20">
            <Video className="w-7 h-7 text-temple-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3 tracking-tight drop-shadow-sm">
            {messages.pages.videosTitle || messages.common.videos}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {messages.pages.videosDesc}
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
                  closeModal();
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
              {isTa ? "வகை" : "Category"}
            </label>
            <div className="relative">
              <GlassSelect
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  closeModal();
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

      {loadError && (
        <div
          role="alert"
          className="mb-8 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {isTa
            ? "வீடியோக்களை ஏற்ற முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
            : "We couldn't load the videos right now. Please try again shortly."}
        </div>
      )}

      {/* Video Content Area */}
      <div className="min-h-[360px]">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            viewMode === "grid" ? (
              <motion.div
                key={`grid-${selectedYear}-${selectedCategory}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4"
              >
                {filteredItems.map((item, index) => {
                  const title = isTa ? item.titleTa : item.titleEn;
                  const desc = isTa ? item.descTa : item.descEn;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                      onClick={() => openModal(index)}
                      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg border border-border/60 hover:border-temple-gold/50 bg-card transition-all duration-300 h-full"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-85 group-hover:opacity-100"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-300" />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/25 group-hover:bg-temple-gold group-hover:scale-110 transition-all duration-300 shadow-lg">
                            <Play
                              className="w-4 h-4 text-white group-hover:text-black ml-0.5"
                              fill="currentColor"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-3 flex flex-col justify-between gap-1 flex-grow bg-card">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded line-clamp-1">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                            {item.year}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 group-hover:text-temple-gold transition-colors">
                          {title}
                        </h3>
                        {desc && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {desc}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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
                {filteredItems.map((item, index) => {
                  const title = isTa ? item.titleTa : item.titleEn;
                  const desc = isTa ? item.descTa : item.descEn;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                      onClick={() => openModal(index)}
                      className="group relative flex items-center gap-3.5 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl border border-border/60 hover:border-temple-gold/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-24 sm:w-32 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-black border border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-7 h-7 rounded-full bg-black/65 flex items-center justify-center border border-white/25 group-hover:bg-temple-gold transition-colors">
                            <Play
                              className="w-3 h-3 text-white group-hover:text-black ml-0.5"
                              fill="currentColor"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {item.year}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1 group-hover:text-temple-gold transition-colors">
                          {title}
                        </h3>
                        {desc && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                            {desc}
                          </p>
                        )}
                      </div>

                      {/* Action Icon */}
                      <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-temple-gold/10 group-hover:bg-temple-gold text-temple-gold group-hover:text-white flex items-center justify-center transition-colors">
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                      </div>
                    </motion.div>
                  );
                })}
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
                <Video className="h-8 w-8 text-temple-gold/70" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold mb-2 text-foreground">
                {isTa ? "வீடியோக்கள் எதுவும் கிடைக்கவில்லை" : "No Videos Found"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-5">
                {isTa
                  ? "தேர்ந்தெடுக்கப்பட்ட ஆண்டு அல்லது வகையில் வீடியோக்கள் இல்லை."
                  : "No videos are available for the selected filters. Try choosing another year or category."}
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

      {/* Portaled Cinematic YouTube Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeVideo && modalIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] h-[100dvh] w-screen bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none"
                onClick={closeModal}
              >
                {/* Top Header Bar */}
                <div
                  className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 bg-black/75 backdrop-blur-md z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-temple-gold/20 border border-temple-gold/40 text-temple-gold text-xs font-semibold shrink-0">
                      <Video className="w-3.5 h-3.5" />
                      <span>{activeVideo.category}</span>
                    </span>
                    <h2 className="text-white font-display font-bold text-sm sm:text-base truncate">
                      {isTa ? activeVideo.titleTa : activeVideo.titleEn}
                    </h2>
                    <span className="text-white/60 text-xs sm:text-sm font-medium tabular-nums shrink-0 px-2 py-0.5 rounded bg-white/10">
                      {modalIndex + 1} / {filteredItems.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label={isTa ? "மூடு" : "Close video"}
                    className="shrink-0 ml-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/15 hover:bg-temple-gold text-white hover:text-black font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 border border-white/25 transition-all shadow-lg cursor-pointer"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">
                      {isTa ? "மூடு" : "Close"}
                    </span>
                  </button>
                </div>

                {/* Video Player Stage */}
                <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-3 sm:px-16 py-3 overflow-hidden">
                  {filteredItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevVideo();
                        }}
                        aria-label="Previous video"
                        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextVideo();
                        }}
                        aria-label="Next video"
                        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}

                  <div
                    className="relative w-full max-w-5xl max-h-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.75)] border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AnimatePresence mode="wait">
                      <motion.iframe
                        key={activeVideo.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                        title={isTa ? activeVideo.titleTa : activeVideo.titleEn}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Details Bar */}
                <div
                  className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-black/80 backdrop-blur-md text-center z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-white text-sm sm:text-base font-display font-bold line-clamp-1">
                    {isTa ? activeVideo.titleTa : activeVideo.titleEn}
                  </p>
                  {(isTa ? activeVideo.descTa : activeVideo.descEn) && (
                    <p className="text-white/75 text-xs sm:text-sm line-clamp-1 mt-0.5 max-w-3xl mx-auto">
                      {isTa ? activeVideo.descTa : activeVideo.descEn}
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
