"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryItem } from "@/generated/prisma/client";
import { getLocalizedField } from "@/lib/utils/locale";

interface LightboxProps {
  items: GalleryItem[];
  locale: string;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ items, locale, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex(initialIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const title = getLocalizedField(currentItem, "title", locale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {items.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 z-50 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 z-50 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="relative w-full flex-1 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={currentItem.imageUrl} 
            alt={getLocalizedField(currentItem, "altText", locale) || title || "Gallery Image"}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
          />
        </div>
        
        {title && (
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <span className="inline-block bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm shadow-xl">
              {title}
            </span>
          </div>
        )}

        <div className="absolute top-4 left-4 text-white/50 text-sm font-mono tracking-widest">
          {currentIndex + 1} / {items.length}
        </div>
      </div>
    </div>
  );
}
