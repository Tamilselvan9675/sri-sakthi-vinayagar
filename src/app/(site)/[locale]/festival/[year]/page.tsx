import { notFound } from "next/navigation";
import { getMessages } from "@/i18n/get-messages";
import { getFestivalByYear } from "@/lib/api/festival";
import { getLocalizedField } from "@/lib/utils/locale";
import { Countdown } from "@/components/home/countdown";
import { EventCard } from "@/components/festival/event-card";
import { PoojaCard } from "@/components/festival/pooja-card";
import { WinnerCard } from "@/components/festival/winner-card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Image as ImageIcon, Video, FileSpreadsheet } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ locale: string, year: string }> }) {
  const { locale, year } = await props.params;
  const festival = await getFestivalByYear(parseInt(year));
  
  if (!festival) return { title: "Festival Not Found" };

  return {
    title: getLocalizedField(festival, "title", locale),
    description: getLocalizedField(festival, "description", locale),
  };
}

export default async function FestivalYearPage(props: {
  params: Promise<{ locale: string, year: string }>;
}) {
  const { locale, year } = await props.params;
  const yearInt = parseInt(year);
  
  if (isNaN(yearInt)) {
    notFound();
  }

  const messages = await getMessages(locale);
  const festival = await getFestivalByYear(yearInt);

  if (!festival) {
    notFound();
  }

  const titleLocal = getLocalizedField(festival, "title", locale);
  const descLocal = getLocalizedField(festival, "description", locale);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[50vh] text-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-4 py-16">
        <div className="z-10 max-w-4xl space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-background px-3 py-1 text-sm font-medium mb-4 shadow-sm">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>{year}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-foreground">
            {titleLocal}
          </h1>
          {descLocal && (
            <p className="max-w-2xl text-lg text-muted-foreground mt-4 leading-relaxed">
              {descLocal}
            </p>
          )}

          <div className="w-full max-w-2xl mt-8">
            <Countdown 
              startDate={festival.startDate} 
              endDate={festival.endDate} 
              messages={messages} 
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-16 space-y-24">
        
        {/* Pooja Schedules */}
        {festival.poojaSchedules.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold tracking-tight mb-8 border-b-2 border-primary/20 pb-2 inline-block">
              {messages.common.pooja}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {festival.poojaSchedules.map((pooja) => (
                <PoojaCard key={pooja.id} pooja={pooja} locale={locale} messages={messages} />
              ))}
            </div>
          </section>
        )}

        {/* Events */}
        {festival.events.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold tracking-tight mb-8 border-b-2 border-primary/20 pb-2 inline-block">
              {messages.common.events}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {festival.events.map((event) => (
                <EventCard key={event.id} event={event} locale={locale} messages={messages} />
              ))}
            </div>
          </section>
        )}

        {/* Winners */}
        {festival.winners.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold tracking-tight mb-8 border-b-2 border-primary/20 pb-2 inline-block">
              {messages.common.winners}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {festival.winners.map((winner) => (
                <WinnerCard key={winner.id} winner={winner} locale={locale} messages={messages} />
              ))}
            </div>
          </section>
        )}

        {/* Media & Documents Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invitations */}
          {festival.invitations.length > 0 && (
            <div className="space-y-6 bg-muted/30 p-8 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">{messages.common.invitation}</h3>
              </div>
              <ul className="space-y-4">
                {festival.invitations.map((inv) => (
                  <li key={inv.id} className="flex flex-col gap-2 bg-background p-4 rounded-xl border border-border shadow-sm">
                    <span className="font-medium">{getLocalizedField(inv, "title", locale)}</span>
                    {inv.pdfUrl && (
                      <Button variant="outline" size="sm" render={<a href={inv.pdfUrl} target="_blank" rel="noreferrer" />} className="w-fit">
                        View PDF
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gallery Preview */}
          {festival.galleryAlbums.length > 0 && (
            <div className="space-y-6 bg-muted/30 p-8 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">{messages.common.gallery}</h3>
              </div>
              <p className="text-muted-foreground">{festival.galleryAlbums.length} Albums available</p>
              <Button variant="default" className="w-full">View Gallery</Button>
            </div>
          )}

          {/* Videos Preview */}
          {festival.videos.length > 0 && (
            <div className="space-y-6 bg-muted/30 p-8 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">{messages.common.videos}</h3>
              </div>
              <p className="text-muted-foreground">{festival.videos.length} Videos available</p>
              <Button variant="default" className="w-full">View Videos</Button>
            </div>
          )}
        </section>

        {/* Expenses Summary */}
        {festival.expenses.length > 0 && (
          <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
             <div className="flex items-center gap-3 mb-8">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">{messages.common.expenses}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {festival.expenses.slice(0, 6).map((expense) => (
                  <div key={expense.id} className="bg-background p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                    <span className="text-sm text-muted-foreground">{getLocalizedField(expense.category, "name", locale)}</span>
                    <span className="font-bold text-lg mt-1">₹{expense.amount.toString()}</span>
                    <span className="text-xs text-muted-foreground mt-2">{getLocalizedField(expense, "description", locale)}</span>
                  </div>
                ))}
              </div>
          </section>
        )}

      </div>
    </main>
  );
}
