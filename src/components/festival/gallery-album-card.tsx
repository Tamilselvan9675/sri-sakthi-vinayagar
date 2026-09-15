import { getLocalizedField } from "@/lib/utils/locale";
import { Messages } from "@/i18n/get-messages";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Layers } from "lucide-react";
import Link from "next/link";
import { GalleryAlbum, GalleryItem } from "@/generated/prisma/client";

interface GalleryAlbumCardProps {
  album: GalleryAlbum & { items: GalleryItem[] };
  locale: string;
  messages: Messages;
}

export function GalleryAlbumCard({ album, locale, messages }: GalleryAlbumCardProps) {
  const coverItem = album.items && album.items.length > 0 ? album.items[0] : null;

  return (
    <Link href={`/${locale}/gallery/${album.id}`} className="block h-full">
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-md bg-card flex flex-col h-full cursor-pointer relative">
        <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-border flex items-center gap-1.5 pointer-events-none">
          <Layers className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold">{messages.common.gallery}</span>
        </div>

        <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden flex items-center justify-center">
          {coverItem ? (
            <>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10 pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={coverItem.thumbnailUrl || coverItem.imageUrl} 
                alt={getLocalizedField(coverItem, "altText", locale) || getLocalizedField(album, "title", locale)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mb-2 opacity-30" />
            </div>
          )}
        </div>
        <CardContent className="p-5 flex-1 flex flex-col bg-background relative z-20">
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
            {getLocalizedField(album, "title", locale)}
          </h3>
          
          {getLocalizedField(album, "description", locale) && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {getLocalizedField(album, "description", locale)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
