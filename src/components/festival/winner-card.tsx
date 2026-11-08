import { getLocalizedField } from "@/lib/utils/locale";
import { Messages } from "@/i18n/get-messages";
import { Trophy, Medal, Award, Maximize2 } from "lucide-react";
import { Winner, Event } from "@/generated/prisma/client";

interface WinnerCardProps {
  winner: Winner & { event?: Event | null; festivalYear?: { year: number } };
  locale: string;
  messages: Messages;
  showYear?: boolean;
  viewMode?: "grid" | "list";
  onClick?: () => void;
}

export function WinnerCard({
  winner,
  locale,
  viewMode = "grid",
  onClick,
}: WinnerCardProps) {
  const position = winner.position.toLowerCase();
  let PositionIcon = Award;
  let iconColor = "text-temple-gold";

  if (position.includes("1") || position.includes("first")) {
    PositionIcon = Trophy;
    iconColor = "text-yellow-500";
  } else if (position.includes("2") || position.includes("second")) {
    PositionIcon = Medal;
    iconColor = "text-slate-400";
  } else if (position.includes("3") || position.includes("third")) {
    PositionIcon = Medal;
    iconColor = "text-amber-600";
  }

  const category = getLocalizedField(winner, "category", locale);
  const prize = getLocalizedField(winner, "prize", locale);

  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        className={`group relative flex items-center gap-3.5 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl border border-border/60 hover:border-temple-gold/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        {/* Left Thumbnail */}
        <div className="relative w-24 sm:w-32 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-temple-gold/5 border border-border/40 flex items-center justify-center">
          {winner.photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={winner.photoUrl}
              alt={winner.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <PositionIcon className={`h-9 w-9 ${iconColor}`} />
          )}
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold uppercase tracking-wider">
            {winner.position}
          </div>
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded">
              {category}
            </span>
            <span className="text-[10px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
              {winner.position}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1 group-hover:text-temple-gold transition-colors">
            {winner.name}
          </h3>
          {prize ? (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
              {prize}
            </p>
          ) : (
            winner.festivalYear && (
              <p className="text-xs text-muted-foreground">
                {winner.festivalYear.year}
              </p>
            )
          )}
        </div>

        {/* Right Action Icon */}
        {winner.photoUrl && (
          <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-temple-gold/10 group-hover:bg-temple-gold text-temple-gold group-hover:text-white flex items-center justify-center transition-colors">
            <Maximize2 className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-border/60 hover:border-temple-gold/50 bg-card transition-all duration-300 h-full ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-temple-gold/5 flex items-center justify-center shrink-0">
        {winner.photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={winner.photoUrl}
              alt={winner.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </>
        ) : (
          <PositionIcon className={`h-12 w-12 ${iconColor}`} />
        )}

        {/* Position Badge */}
        <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
          <PositionIcon className={`w-3 h-3 ${iconColor}`} />
          <span>{winner.position}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 flex flex-col justify-between gap-1 flex-grow bg-card">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded line-clamp-1">
            {category}
          </span>
          {winner.festivalYear && (
            <span className="text-[10px] text-muted-foreground font-medium shrink-0">
              {winner.festivalYear.year}
            </span>
          )}
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 group-hover:text-temple-gold transition-colors">
          {winner.name}
        </h3>
        {prize && (
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {prize}
          </p>
        )}
      </div>
    </div>
  );
}
