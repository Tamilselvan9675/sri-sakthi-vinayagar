import { getLocalizedField } from "@/lib/utils/locale";
import { Messages } from "@/i18n/get-messages";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { Event } from "@/generated/prisma/client";

interface EventCardProps {
  event: Event;
  locale: string;
  messages: Messages;
  showYear?: boolean;
}

export function EventCard({ event, locale, showYear = false }: EventCardProps) {
  const date = new Date(event.date);
  
  return (
    <Card className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-md">
      <CardContent className="p-0 flex flex-col sm:flex-row h-full">
        <div className="bg-muted w-full sm:w-1/3 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-border shrink-0">
          <span className="text-sm uppercase font-semibold text-primary/80">
            {date.toLocaleDateString(locale, { month: 'short' })}
            {showYear && ` '${date.getFullYear().toString().substring(2)}`}
          </span>
          <span className="text-4xl font-bold text-foreground">{date.getDate()}</span>
          <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{event.eventType}</span>
        </div>
        
        <div className="p-6 w-full sm:w-2/3 flex flex-col justify-center">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
            {getLocalizedField(event, "title", locale)}
          </h3>
          
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary/70 shrink-0" />
              <span>{event.time || "TBA"}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>
          
          {getLocalizedField(event, "description", locale) && (
            <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
              {getLocalizedField(event, "description", locale)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
