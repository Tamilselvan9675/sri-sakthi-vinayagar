"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const VIDEO_BASE_URL = "https://pub-be4a8bdf17124b4cb55246a1cdca1889.r2.dev/media/videos";
const DESKTOP_SRC = `${VIDEO_BASE_URL}/intro-video.mp4`;
const MOBILE_SRC = `${VIDEO_BASE_URL}/intro-video-mb.mp4`;

/** Tailwind `md` breakpoint: below it the mobile video is used. */
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Full-bleed background intro video for the hero. Only one file is ever
 * requested: the mobile cut below 768px, the desktop cut otherwise. The source
 * is chosen after mount (and updates on resize/rotation), so nothing is
 * downloaded for the unused variant.
 */
export function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setSrc(mq.matches ? DESKTOP_SRC : MOBILE_SRC);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Respect reduced-motion: show the first frame instead of autoplaying.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    } else {
      void video.play().catch(() => {});
    }
  }, [src]);

  // Keep the element in sync with the toggle (also after the source swaps).
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, src]);

  /**
   * Browsers only allow autoplay while muted, so the video starts silent and
   * sound is enabled by this click (a user gesture, which is permitted).
   */
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    if (!next) {
      video.volume = 1;
      void video.play().catch(() => {});
    }
    setMuted(next);
  };

  return (
    <div className="absolute inset-0 bg-black">
      {src && (
        <video
          ref={videoRef}
          key={src}
          src={src}
          className="h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        aria-pressed={!muted}
        className="absolute right-4 bottom-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/50 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:bottom-8 sm:text-sm"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        <span>{muted ? "Sound on" : "Sound off"}</span>
      </button>
    </div>
  );
}

