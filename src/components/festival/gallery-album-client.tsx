"use client";

import { useState } from "react";
import { Lightbox } from "@/components/festival/lightbox";
import { getLocalizedField } from "@/lib/utils/locale";
import { GalleryAlbum, GalleryItem, FestivalYear } from "@/generated/prisma/client";
import { ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Messages } from "@/i18n/get-messages";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TempleDivider } from "@/components/ui/temple-divider";

interface GalleryAlbumClientProps {
  album: GalleryAlbum & { 
    items: GalleryItem[], 
    festivalYear: Pick<FestivalYear, 'year' | 'titleEn' | 'titleTa'> 
  };
  locale: string;
  messages: Messages;
}

export function GalleryAlbumClient({ album, locale, messages }: GalleryAlbumClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openLightbox = (index: number) => {
    setInitialIndex(index);
    setLightboxOpen(true);
  };

  const title = getLocalizedField(album, "title", locale);
  const description = getLocalizedField(album, "description", locale);

  return (
    <div className="space-y-12 pb-24">
      <AnimateOnScroll>
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" render={<Link href={`/${locale}/gallery`} />} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            {messages.common.back}
          </Button>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mt-4">
            <Layers className="h-3.5 w-3.5" />
            <span>{album.festivalYear.year} {messages.common.gallery}</span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            {title}
          </h1>
          
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}

          <TempleDivider variant="subtle" className="w-full max-w-md mx-auto" />
          
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest pt-2">
            {album.items.length} {album.items.length === 1 ? 'Photo' : 'Photos'}
          </div>
        </div>
      </AnimateOnScroll>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {album.items.map((item, index) => (
          <AnimateOnScroll key={item.id} delay={(index % 8) * 50} animation="fade-up">
            <div 
              className="break-inside-avoid cursor-pointer group relative rounded-2xl overflow-hidden border border-border/50 bg-muted shadow-sm hover:shadow-xl transition-all duration-500"
              onClick={() => openLightbox(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.thumbnailUrl || item.imageUrl} 
                alt={getLocalizedField(item, "altText", locale) || title || "Gallery Image"}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-4">
                <span className="text-white text-xs font-medium tracking-wide">
                  View Full Size
                </span>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <Lightbox 
        items={album.items} 
        locale={locale} 
        isOpen={lightboxOpen} 
        initialIndex={initialIndex} 
        onClose={() => setLightboxOpen(false)} 
      />
    </div>
  );
}
