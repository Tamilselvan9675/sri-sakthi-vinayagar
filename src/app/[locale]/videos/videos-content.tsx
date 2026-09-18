"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Video, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Messages } from "@/i18n/get-messages";
import { MOCK_VIDEO_DATA, VIDEO_CATEGORIES } from "./mock-data";

interface VideosContentProps {
  locale: string;
  messages: Messages;
}

export function VideosContent({ locale, messages }: VideosContentProps) {
  // Extract unique years from mock data, sort descending
  const years = Array.from(new Set(MOCK_VIDEO_DATA.map(item => item.year))).sort((a, b) => b - a);
  const defaultYear = years.length > 0 ? years[0] : new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // YouTube Modal state
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // Filter items
  const filteredItems = MOCK_VIDEO_DATA.filter(item => {
    const matchYear = item.year === selectedYear;
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchYear && matchCat;
  });

  // Keyboard navigation for Modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (modalIndex === null) return;
    if (e.key === "Escape") setModalIndex(null);
    if (e.key === "ArrowLeft") {
      setModalIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
    }
    if (e.key === "ArrowRight") {
      setModalIndex(prev => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
    }
  }, [modalIndex, filteredItems.length]);

  useEffect(() => {
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
  }, [handleKeyDown, modalIndex]);

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);
  
  const nextVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalIndex(prev => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
  };
  
  const prevVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
  };

  const isTa = locale === "ta";

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl relative z-10">
      
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-temple-gold/20 to-red-900/10 rounded-2xl mb-6 shadow-inner border border-temple-gold/20">
            <Video className="w-8 h-8 text-temple-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight drop-shadow-sm">
            {messages.pages.videosTitle || messages.common.videos}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {messages.pages.videosDesc}
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
                {VIDEO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-temple-gold pointer-events-none group-hover:translate-y-[2px] transition-transform" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Video Grid */}
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
                  transition: { staggerChildren: 0.1 }
                },
                exit: { opacity: 0, transition: { duration: 0.2 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95, y: 20 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
                  }}
                  className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl border border-border/50 bg-card transition-all duration-500"
                  onClick={() => openModal(index)}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img 
                      src={item.thumbnailUrl} 
                      alt={isTa ? item.titleTa : item.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-temple-gold/90 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-500">
                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-5 flex flex-col gap-2 relative z-10 bg-background group-hover:bg-primary/5 transition-colors duration-500 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-temple-gold bg-temple-gold/10 px-2 py-1 rounded-md">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-foreground text-lg font-semibold line-clamp-2 leading-tight">
                      {isTa ? item.titleTa : item.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {isTa ? item.descTa : item.descEn}
                    </p>
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
              <Video className="h-16 w-16 text-temple-gold/40 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                No Videos Found
              </h3>
              <p className="text-muted-foreground">Try adjusting your filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cinematic YouTube Modal */}
      <AnimatePresence>
        {modalIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={closeModal}
          >
            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
              <span className="text-white/80 font-medium tabular-nums">
                {modalIndex + 1} / {filteredItems.length}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); closeModal(); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Buttons */}
            {filteredItems.length > 1 && (
              <>
                <button 
                  onClick={prevVideo}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/10 text-white backdrop-blur-md transition-all z-50 group border border-white/10"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={nextVideo}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/10 text-white backdrop-blur-md transition-all z-50 group border border-white/10"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}

            {/* Video Container (16:9) */}
            <div className="relative w-full max-w-6xl aspect-video flex items-center justify-center bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.iframe
                  key={modalIndex} // Force reload of iframe when video changes
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${filteredItems[modalIndex].youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={isTa ? filteredItems[modalIndex].titleTa : filteredItems[modalIndex].titleEn}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </AnimatePresence>
            </div>
            
            {/* Video Details Below Player */}
            <motion.div 
              key={`desc-${modalIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-white text-xl sm:text-2xl font-bold font-display mb-2">
                {isTa ? filteredItems[modalIndex].titleTa : filteredItems[modalIndex].titleEn}
              </h2>
              <p className="text-white/70 text-sm sm:text-base">
                {isTa ? filteredItems[modalIndex].descTa : filteredItems[modalIndex].descEn}
              </p>
            </motion.div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
