"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Messages } from "@/i18n/get-messages";
import { MOCK_GALLERY_DATA, GALLERY_CATEGORIES } from "./mock-data";

interface GalleryContentProps {
  locale: string;
  messages: Messages;
}

export function GalleryContent({ locale, messages }: GalleryContentProps) {
  // Extract unique years from mock data, sort descending
  const years = Array.from(new Set(MOCK_GALLERY_DATA.map(item => item.year))).sort((a, b) => b - a);
  const defaultYear = years.length > 0 ? years[0] : new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter items
  const filteredItems = MOCK_GALLERY_DATA.filter(item => {
    const matchYear = item.year === selectedYear;
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchYear && matchCat;
  });

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === "Escape") setLightboxIndex(null);
    if (e.key === "ArrowLeft") {
      setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
    }
    if (e.key === "ArrowRight") {
      setLightboxIndex(prev => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
    }
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown, lightboxIndex]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
  };
  
  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
  };

  const isTa = locale === "ta";

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl relative z-10">
      
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-temple-gold/20 to-red-900/10 rounded-2xl mb-6 shadow-inner border border-temple-gold/20">
            <ImageIcon className="w-8 h-8 text-temple-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight drop-shadow-sm">
            {messages.pages.galleryTitle}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {messages.pages.galleryDesc}
          </p>
        </div>
        
        {/* Premium Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 z-20">
          
          {/* Year Dropdown */}
          <div className="relative group">
            <label className="text-xs font-bold text-temple-gold uppercase tracking-widest mb-2 block font-display">
              {messages.filters?.filterByYear || "Select Year"}
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none w-full sm:w-40 bg-white/80 dark:bg-card/80 backdrop-blur-md border border-temple-gold/30 rounded-xl px-4 py-3 pr-10 text-foreground font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-temple-gold/50 focus:border-temple-gold transition-all duration-300 cursor-pointer hover:shadow-md"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-temple-gold pointer-events-none group-hover:translate-y-[2px] transition-transform" />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="relative group">
            <label className="text-xs font-bold text-temple-gold uppercase tracking-widest mb-2 block font-display">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full sm:w-56 bg-white/80 dark:bg-card/80 backdrop-blur-md border border-temple-gold/30 rounded-xl px-4 py-3 pr-10 text-foreground font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-temple-gold/50 focus:border-temple-gold transition-all duration-300 cursor-pointer hover:shadow-md"
              >
                <option value="All">All Categories</option>
                {GALLERY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-temple-gold pointer-events-none group-hover:translate-y-[2px] transition-transform" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div 
              key={`${selectedYear}-${selectedCategory}`}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                },
                exit: { opacity: 0, transition: { duration: 0.2 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 20 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
                  }}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl border border-border/50 bg-card transition-all duration-500"
                  onClick={() => openLightbox(index)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={isTa ? item.titleTa : item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-temple-gold bg-black/50 backdrop-blur-md px-2 py-1 rounded-md mb-2 inline-block">
                      {item.category}
                    </span>
                    <h3 className="text-white font-semibold line-clamp-1">
                      {isTa ? item.titleTa : item.titleEn}
                    </h3>
                  </div>
                  
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-md p-2 rounded-full">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
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
              <ImageIcon className="h-16 w-16 text-temple-gold/40 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                No Photos Found
              </h3>
              <p className="text-muted-foreground">Try adjusting your filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox / Fullscreen Preview */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={closeLightbox}
          >
            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
              <span className="text-white/60 font-medium tabular-nums">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Buttons */}
            {filteredItems.length > 1 && (
              <>
                <button 
                  onClick={prevPhoto}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/10 text-white backdrop-blur-md transition-all z-50 group border border-white/10"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={nextPhoto}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/10 text-white backdrop-blur-md transition-all z-50 group border border-white/10"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}

            {/* Image Container */}
            <div className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-video flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img 
                  key={lightboxIndex}
                  src={filteredItems[lightboxIndex].imageUrl}
                  alt={isTa ? filteredItems[lightboxIndex].titleTa : filteredItems[lightboxIndex].titleEn}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="max-w-full max-h-[75vh] object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                />
              </AnimatePresence>
              
              {/* Image Details */}
              <motion.div 
                key={`desc-${lightboxIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-16 sm:-bottom-20 inset-x-0 text-center"
              >
                <h2 className="text-white text-xl sm:text-2xl font-bold font-display mb-1">
                  {isTa ? filteredItems[lightboxIndex].titleTa : filteredItems[lightboxIndex].titleEn}
                </h2>
                <p className="text-white/70 text-sm sm:text-base">
                  {isTa ? filteredItems[lightboxIndex].descTa : filteredItems[lightboxIndex].descEn}
                </p>
              </motion.div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
