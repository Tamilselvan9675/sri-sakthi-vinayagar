import { getMessages } from "@/i18n/get-messages";
import { getAllFestivalYears, getInvitations } from "@/lib/api/festival";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { WhatsAppShareButton } from "@/components/festival/whatsapp-share-button";
import { Button } from "@/components/ui/button";
import { getLocalizedField } from "@/lib/utils/locale";
import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TempleDivider } from "@/components/ui/temple-divider";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.common.invitation,
  };
}

export default async function InvitationsPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const messages = await getMessages(locale);
  
  const yearFilter = searchParams.year ? parseInt(searchParams.year) : undefined;
  
  const [years, invitations] = await Promise.all([
    getAllFestivalYears(),
    getInvitations(yearFilter)
  ]);

  const yearOptions = years.map(y => ({
    value: y.year.toString(),
    label: y.year.toString()
  }));

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl">
        
        <AnimateOnScroll>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <SectionHeader
              title={messages.common.invitation}
              subtitle="View, download, and share our festival invitations with your family and friends."
              icon={FileText}
            />
            
            <div className="w-full md:w-64 shrink-0 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                {messages.filters.filterByYear}
              </label>
              <FilterDropdown 
                paramName="year"
                options={yearOptions}
                defaultValue={yearFilter?.toString() || "all"}
                placeholder={messages.filters.allYears}
                messages={messages}
              />
            </div>
          </div>
        </AnimateOnScroll>

        {invitations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {invitations.map((inv, i) => (
              <AnimateOnScroll key={inv.id} delay={i * 100}>
                <Card className="overflow-hidden border border-border/50 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-500 group flex flex-col h-full bg-card rounded-2xl">
                  {inv.imageUrl && (
                    <div className="w-full relative aspect-[3/4] sm:aspect-auto sm:h-[600px] bg-primary/5 flex items-center justify-center p-6 sm:p-12">
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50 pointer-events-none" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={inv.imageUrl} 
                        alt={getLocalizedField(inv, "title", locale)} 
                        className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-700 z-10"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-8 md:p-10 bg-background flex-1 flex flex-col justify-between relative z-20">
                    <div className="space-y-6">
                      <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20">
                        {inv.festivalYear.year}
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
                          {getLocalizedField(inv, "title", locale)}
                        </h3>
                        <TempleDivider variant="subtle" />
                        {getLocalizedField(inv, "content", locale) && (
                          <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm sm:text-base">
                            {getLocalizedField(inv, "content", locale)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50">
                      {inv.pdfUrl && (
                        <Button className="flex-1 rounded-xl" variant="outline" render={<a href={inv.pdfUrl} target="_blank" rel="noreferrer" download />}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      )}
                      <WhatsAppShareButton 
                        invitation={inv} 
                        locale={locale} 
                        messages={messages} 
                        className="flex-1 rounded-xl" 
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <AnimateOnScroll>
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center border rounded-3xl border-dashed border-primary/20 bg-primary/5">
              <FileText className="h-16 w-16 text-primary/30 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                No Invitations Found
              </h3>
              <p className="text-muted-foreground">{messages.home.noData}</p>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </main>
  );
}
