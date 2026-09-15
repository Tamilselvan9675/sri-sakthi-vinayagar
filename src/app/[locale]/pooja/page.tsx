import { getMessages } from "@/i18n/get-messages";
import { getAllFestivalYears, getPoojaSchedules } from "@/lib/api/festival";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { PoojaCard } from "@/components/festival/pooja-card";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Flame } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.pages.poojaTitle,
    description: messages.pages.poojaDesc,
  };
}

export default async function PoojaPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const messages = await getMessages(locale);
  
  const yearFilter = searchParams.year ? parseInt(searchParams.year) : undefined;
  
  // Fetch data in parallel
  const [years, poojas] = await Promise.all([
    getAllFestivalYears(),
    getPoojaSchedules(yearFilter)
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
              title={messages.pages.poojaTitle}
              subtitle={messages.pages.poojaDesc}
              icon={Flame}
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

        {poojas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poojas.map((pooja, i) => (
              <AnimateOnScroll key={pooja.id} delay={i * 50}>
                <PoojaCard 
                  pooja={pooja} 
                  locale={locale} 
                  messages={messages} 
                  showYear={!yearFilter} // Show year in date if viewing all years
                />
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <AnimateOnScroll>
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center border rounded-3xl border-dashed border-primary/20 bg-primary/5">
              <Flame className="h-16 w-16 text-primary/30 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                {messages.empty.noPooja}
              </h3>
              <p className="text-muted-foreground">{messages.home.noData}</p>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </main>
  );
}
