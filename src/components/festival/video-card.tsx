import { getLocalizedField } from "@/lib/utils/locale";
import { Messages } from "@/i18n/get-messages";
import { Card, CardContent } from "@/components/ui/card";
import { Video as VideoIcon, PlayCircle } from "lucide-react";
import { Video } from "@/generated/prisma/client";

interface VideoCardProps {
  video: Video;
  locale: string;
  messages: Messages;
}

export function VideoCard({ video, locale }: VideoCardProps) {
  // Extract YouTube ID if it's a YouTube URL to use their official thumbnail
  let thumbnailUrl = video.thumbnailUrl;

  const ytMatch = video.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    if (!thumbnailUrl) {
      thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-md bg-card flex flex-col h-full">
      <div className="relative aspect-video w-full bg-muted overflow-hidden flex items-center justify-center">
        {thumbnailUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={thumbnailUrl} 
              alt={getLocalizedField(video, "title", locale)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
              <PlayCircle className="w-16 h-16 text-white/90 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-sm" />
            </div>
            {/* The actual clickable area that could either open a modal or link to the video */}
            <a href={video.videoUrl} target="_blank" rel="noreferrer" className="absolute inset-0 z-10">
              <span className="sr-only">Play Video</span>
            </a>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <VideoIcon className="w-12 h-12 mb-2 opacity-50" />
            <span>No Thumbnail</span>
          </div>
        )}
      </div>
      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {getLocalizedField(video, "title", locale)}
        </h3>
        
        {getLocalizedField(video, "description", locale) && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
            {getLocalizedField(video, "description", locale)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
