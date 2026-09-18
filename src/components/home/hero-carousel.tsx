"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

/**
 * Hero images configuration.
 * Add or replace images in /public/images/hero/ and update this array.
 */
const HERO_IMAGES = [
  {
    src: "/images/hero/01-vinayagar.jpg",
    alt: "Sri Sakthi Vinayagar Temple",
  },
  {
    src: "/images/hero/02-temple.jpg",
    alt: "Sri Sakthi Vinayagar Temple Exterior",
  },
];

const AUTOPLAY_INTERVAL = 6000; // 6 seconds for cinematic feel

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 40, // Slow, smooth scroll
    dragFree: false,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotionRef = useRef(false);

  // Check reduced motion preference without triggering re-render
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Track active slide — use event subscription only
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    // Also subscribe to reInit to catch initial state
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (!prefersReducedMotionRef.current) {
        emblaApi.scrollNext();
      }
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [emblaApi]);

  // If only one image, render statically
  if (HERO_IMAGES.length <= 1) {
    return (
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGES[0]?.src || "/images/hero-vinayagar.jpg"}
          alt={HERO_IMAGES[0]?.alt || "Sri Sakthi Vinayagar Temple"}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {/* Embla Carousel */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image.src}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                className={`object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  activeIndex === index ? "scale-105" : "scale-100"
                }`}
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Slide indicators — subtle dots */}
      {HERO_IMAGES.length > 1 && (
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                activeIndex === index
                  ? "w-6 bg-white/80"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
