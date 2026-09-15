import { getLocalizedField } from "@/lib/utils/locale";
import { Messages } from "@/i18n/get-messages";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { Winner, Event } from "@/generated/prisma/client";

interface WinnerCardProps {
  winner: Winner & { event?: Event | null };
  locale: string;
  messages: Messages;
  showYear?: boolean;
}

export function WinnerCard({ winner, locale }: WinnerCardProps) {
  // Determine icon based on position
  const position = winner.position.toLowerCase();
  let PositionIcon = Award;
  let iconColor = "text-primary/40";
  
  if (position.includes("1") || position.includes("first")) {
    PositionIcon = Trophy;
    iconColor = "text-yellow-500";
  } else if (position.includes("2") || position.includes("second")) {
    PositionIcon = Medal;
    iconColor = "text-slate-400";
  } else if (position.includes("3") || position.includes("third")) {
    PositionIcon = Medal;
    iconColor = "text-amber-700";
  }

  return (
    <Card className="text-center overflow-hidden hover:shadow-md transition-shadow group">
      <div className="bg-primary/5 h-40 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 z-10" />
        {winner.photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={winner.photoUrl} 
            alt={winner.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <PositionIcon className={`h-16 w-16 ${iconColor}`} />
        )}
        
        <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-border">
          <span className="text-xs font-bold uppercase tracking-wider">{winner.position}</span>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-3 relative z-20 bg-background">
        <h3 className="font-bold text-lg leading-tight line-clamp-1">{winner.name}</h3>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">
            {getLocalizedField(winner, "category", locale)}
          </p>
          {winner.event && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {getLocalizedField(winner.event, "title", locale)}
            </p>
          )}
        </div>
        
        {getLocalizedField(winner, "prize", locale) && (
          <div className="mt-4 pt-4 border-t border-border/50 inline-block w-full">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Prize</span>
            <span className="text-sm font-semibold">{getLocalizedField(winner, "prize", locale)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
