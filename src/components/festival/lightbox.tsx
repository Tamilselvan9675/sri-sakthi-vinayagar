"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

export function Lightbox({
  items,
  locale,
  initialIndex = 0,
  isOpen,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex] ?? items[0];
  const title = getLocalizedField(currentItem, "title", locale);
  const isTa = locale === "ta";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] h-[100dvh] w-screen bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 bg-black/75 backdrop-blur-md z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/75 text-xs sm:text-sm font-medium tabular-nums px-2.5 py-1 rounded bg-white/10">
          {currentIndex + 1} / {items.length}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/15 hover:bg-temple-gold text-white hover:text-black font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 border border-white/25 transition-all shadow-lg cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{isTa ? "மூடு" : "Close"}</span>
        </button>
      </div>

      {/* Image Stage */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-3 sm:px-16 py-3 overflow-hidden">
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/70 hover:bg-temple-gold text-white hover:text-black backdrop-blur-md transition-all z-30 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        <div
          className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentItem.imageUrl}
            alt={
              getLocalizedField(currentItem, "altText", locale) ||
              title ||
              "Gallery Image"
            }
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl border border-white/10"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="shrink-0 w-full px-4 sm:px-6 py-3 border-t border-white/10 bg-black/80 backdrop-blur-md text-center z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white text-sm sm:text-base font-display font-bold line-clamp-1">
          {title || (isTa ? "புகைப்படம்" : "Gallery Photo")}
        </p>
      </div>
    </div>,
    document.body
  );
}
