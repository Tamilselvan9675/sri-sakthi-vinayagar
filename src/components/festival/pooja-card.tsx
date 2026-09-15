import { getLocalizedField } from "@/lib/utils/locale";
import { Messages } from "@/i18n/get-messages";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { PoojaSchedule } from "@/generated/prisma/client";

interface PoojaCardProps {
  pooja: PoojaSchedule;
  locale: string;
  messages: Messages;
  showYear?: boolean;
}

export function PoojaCard({ pooja, locale, showYear = false }: PoojaCardProps) {
  const date = new Date(pooja.date);
  
  return (
    <Card className="hover:shadow-md transition-all border-l-4 border-l-primary group">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
            {getLocalizedField(pooja, "title", locale)}
          </h3>
          <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        
        <div className="space-y-2 text-sm font-medium text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>
              {date.toLocaleDateString(locale, { 
                weekday: 'long', 
                year: showYear ? 'numeric' : undefined, 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>{pooja.time || "TBA"}</span>
          </div>
        </div>
        
        {getLocalizedField(pooja, "description", locale) && (
          <p className="text-sm text-muted-foreground/90 leading-relaxed">
            {getLocalizedField(pooja, "description", locale)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
