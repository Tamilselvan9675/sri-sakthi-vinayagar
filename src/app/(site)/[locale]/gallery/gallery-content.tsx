"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  LayoutGrid,
  List,
  FolderOpen,
} from "lucide-react";
import { GlassSelect } from "@/components/ui/glass-select";
import { Messages } from "@/i18n/get-messages";
import type { CmsGalleryItem, CmsGalleryPhoto } from "@/lib/cms/content";

interface GalleryContentProps {
  locale: string;
  messages: Messages;
  items: CmsGalleryItem[];
  categories: string[];
  festivalYears?: number[];
  loadError?: boolean;
}

function getFolderPhotos(item: CmsGalleryItem): CmsGalleryPhoto[] {
  if (item.photos && item.photos.length > 0) {
    return item.photos;
  }
  return [
    {
      id: item.id,
      imageUrl: item.imageUrl,
      thumbUrl: item.imageUrl,
      descEn: item.descEn,
      descTa: item.descTa,
    },
  ];
}

export function GalleryContent({
  locale,
  messages,
  items,
  categories,
  festivalYears = [],
  loadError,
}: GalleryContentProps) {
  const isTa = locale === "ta";

  // Extract unique years from CMS data, sort descending, always fallback to current year
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

  // Lightbox state: folder index + photo index inside that folder
  const [activeFolderIndex, setActiveFolderIndex] = useState<number | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Filter folders by year and category
  const filteredItems = items.filter((item) => {
    const matchYear = item.year === selectedYear;
    const matchCat =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchYear && matchCat;
  });

  const activeFolder =
    activeFolderIndex !== null ? filteredItems[activeFolderIndex] ?? null : null;
  const activePhotos = activeFolder ? getFolderPhotos(activeFolder) : [];
  const currentPhoto = activePhotos[activePhotoIndex] ?? activePhotos[0] ?? null;

  const closeLightbox = useCallback(() => {
    setActiveFolderIndex(null);
    setActivePhotoIndex(0);
  }, []);

  const stepNext = useCallback(() => {
    if (activeFolderIndex === null || !activeFolder) return;
    const photos = getFolderPhotos(activeFolder);
    if (photos.length > 1) {
      setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    } else if (filteredItems.length > 1) {
      setActiveFolderIndex((prev) =>
        prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0
      );
      setActivePhotoIndex(0);
    }
  }, [activeFolderIndex, activeFolder, filteredItems.length]);

  const stepPrev = useCallback(() => {
    if (activeFolderIndex === null || !activeFolder) return;
    const photos = getFolderPhotos(activeFolder);
    if (photos.length > 1) {
      setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    } else if (filteredItems.length > 1) {
      setActiveFolderIndex((prev) =>
        prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1
      );
      setActivePhotoIndex(0);
    }
  }, [activeFolderIndex, activeFolder, filteredItems.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeFolderIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepPrev();
      if (e.key === "ArrowRight") stepNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    if (activeFolderIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeFolderIndex, closeLightbox, stepPrev, stepNext]);

  const openLightbox = (folderIndex: number) => {
    setActiveFolderIndex(folderIndex);
    setActivePhotoIndex(0);
  };

  const canNavigate =
    activePhotos.length > 1 ||
    (activePhotos.length === 1 && filteredItems.length > 1);
  const counterIndex =
    activePhotos.length > 1
      ? activePhotoIndex + 1
      : (activeFolderIndex ?? 0) + 1;
  const counterTotal =
    activePhotos.length > 1 ? activePhotos.length : filteredItems.length;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-20 max-w-7xl relative z-10">
      {/* Header and Unified Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-temple-gold/20 to-red-900/10 rounded-2xl mb-4 shadow-inner border border-temple-gold/20">
            <ImageIcon className="w-7 h-7 text-temple-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3 tracking-tight drop-shadow-sm">
            {messages.pages.galleryTitle}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {messages.pages.galleryDesc}
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
                  closeLightbox();
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
                  closeLightbox();
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
            ? "புகைப்படங்களை ஏற்ற முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
            : "We couldn't load the gallery right now. Please try again shortly."}
        </div>
      )}

      {/* Gallery Content Area */}
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
                  const photos = getFolderPhotos(item);
                  const photoCount = photos.length;
                  const title = isTa ? item.titleTa : item.titleEn;
                  const desc = isTa ? item.descTa : item.descEn;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                      onClick={() => openLightbox(index)}
                      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg border border-border/60 hover:border-temple-gold/50 bg-card transition-all duration-300 h-full"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {/* Folder Photo Count Badge */}
                        <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-white text-[10px] font-semibold border border-white/15">
                          <FolderOpen className="w-3 h-3 text-temple-gold" />
                          <span>
                            {photoCount}{" "}
                            {isTa
                              ? photoCount === 1
                                ? "படம்"
                                : "படங்கள்"
                              : photoCount === 1
                                ? "Photo"
                                : "Photos"}
                          </span>
                        </div>

                        {/* Expand Icon */}
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white">
                          <Maximize2 className="w-3.5 h-3.5" />
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
                  const photos = getFolderPhotos(item);
                  const photoCount = photos.length;
                  const title = isTa ? item.titleTa : item.titleEn;
                  const desc = isTa ? item.descTa : item.descEn;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                      onClick={() => openLightbox(index)}
                      className="group relative flex items-center gap-3.5 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl border border-border/60 hover:border-temple-gold/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-24 sm:w-32 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-muted/40 border border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold inline-flex items-center gap-1">
                          <FolderOpen className="w-2.5 h-2.5 text-temple-gold" />
                          <span>{photoCount}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {photoCount}{" "}
                            {isTa
                              ? photoCount === 1
                                ? "படம்"
                                : "படங்கள்"
                              : photoCount === 1
                                ? "Photo"
                                : "Photos"}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1 group-hover:text-temple-gold transition-colors">
                          {title}
                        </h3>
                        {desc ? (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                            {desc}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {item.year}
                          </p>
                        )}
                      </div>

                      {/* Action Icon */}
                      <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-temple-gold/10 group-hover:bg-temple-gold text-temple-gold group-hover:text-white flex items-center justify-center transition-colors">
                        <Maximize2 className="w-4 h-4" />
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
                <ImageIcon className="h-8 w-8 text-temple-gold/70" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold mb-2 text-foreground">
                {isTa ? "புகைப்படங்கள் எதுவும் கிடைக்கவில்லை" : "No Photos Found"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-5">
                {isTa
                  ? "தேர்ந்தெடுக்கப்பட்ட ஆண்டு அல்லது வகையில் புகைப்படங்கள் இல்லை."
                  : "No gallery albums are available for the selected filters. Try choosing another year or category."}
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

      {/* Portaled Lightbox / Fullscreen Folder Preview */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeFolder && currentPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] h-[100dvh] w-screen bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none"
                onClick={closeLightbox}
              >
                {/* Top Header Bar */}
                <div
                  className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 bg-black/75 backdrop-blur-md z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-temple-gold/20 border border-temple-gold/40 text-temple-gold text-xs font-semibold shrink-0">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{activeFolder.category}</span>
                    </span>
                    <h2 className="text-white font-display font-bold text-sm sm:text-base truncate">
                      {isTa ? activeFolder.titleTa : activeFolder.titleEn}
                    </h2>
                    <span className="text-white/60 text-xs sm:text-sm font-medium tabular-nums shrink-0 px-2 py-0.5 rounded bg-white/10">
                      {counterIndex} / {counterTotal}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={closeLightbox}
                    aria-label={isTa ? "மூடு" : "Close preview"}
                    className="shrink-0 ml-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/15 hover:bg-temple-gold text-white hover:text-black font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 border border-white/25 transition-all shadow-lg cursor-pointer"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">
                      {isTa ? "மூடு" : "Close"}
                    </span>
                  </button>
                </div>

                {/* Center Image Stage */}
                <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-3 sm:px-16 py-3 overflow-hidden">
                  {canNavigate && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          stepPrev();
                        }}
                        aria-label="Previous image"
                        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          stepNext();
                        }}
                        aria-label="Next image"
                        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}

                  <div
                    className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentPhoto.id}
                        src={currentPhoto.imageUrl}
                        alt={
                          (isTa ? currentPhoto.descTa : currentPhoto.descEn) ||
                          (isTa ? activeFolder.titleTa : activeFolder.titleEn)
                        }
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10"
                      />
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Caption & Folder Thumbnails Bar */}
                <div
                  className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-black/80 backdrop-blur-md flex flex-col items-center gap-2.5 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center max-w-3xl">
                    <p className="text-white text-sm sm:text-base font-display font-bold line-clamp-1">
                      {isTa ? activeFolder.titleTa : activeFolder.titleEn}
                    </p>
                    {(isTa ? currentPhoto.descTa : currentPhoto.descEn) && (
                      <p className="text-white/75 text-xs sm:text-sm line-clamp-1 mt-0.5">
                        {isTa ? currentPhoto.descTa : currentPhoto.descEn}
                      </p>
                    )}
                  </div>

                  {activePhotos.length > 1 && (
                    <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full py-1 px-2">
                      {activePhotos.map((photo, idx) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`relative w-12 h-9 sm:w-14 sm:h-10 rounded-md overflow-hidden shrink-0 transition-all cursor-pointer border ${
                            idx === activePhotoIndex
                              ? "border-temple-gold ring-2 ring-temple-gold scale-105 opacity-100"
                              : "border-white/20 opacity-50 hover:opacity-85"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.thumbUrl || photo.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
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
