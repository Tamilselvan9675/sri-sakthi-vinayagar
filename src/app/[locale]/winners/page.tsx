import { getMessages } from "@/i18n/get-messages";
import { getAllFestivalYears, getWinners } from "@/lib/api/festival";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { WinnerCard } from "@/components/festival/winner-card";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Trophy } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.pages.winnersTitle,
    description: messages.pages.winnersDesc,
  };
}

export default async function WinnersPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string, category?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const messages = await getMessages(locale);
  
  const yearFilter = searchParams.year ? parseInt(searchParams.year) : undefined;
  const categoryFilter = searchParams.category;
  
  // Fetch data
  const years = await getAllFestivalYears();
  const winners = await getWinners({ 
    year: yearFilter,
    category: categoryFilter
  });

  const yearOptions = years.map(y => ({
    value: y.year.toString(),
    label: y.year.toString()
  }));

  const dynamicCategories = Array.from(new Set(winners.map(w => w.categoryEn)));
  const categoryOptions = dynamicCategories.map(c => ({
    value: c,
    label: c
  }));

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl">
        
        <AnimateOnScroll>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <SectionHeader
              title={messages.pages.winnersTitle}
              subtitle={messages.pages.winnersDesc}
              icon={Trophy}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
              <div className="w-full sm:w-48">
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
              <div className="w-full sm:w-48">
                <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <FilterDropdown 
                  paramName="category"
                  options={categoryOptions}
                  defaultValue={categoryFilter || "all"}
                  placeholder={messages.filters.allCategories}
                  messages={messages}
                />
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {winners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {winners.map((winner, i) => (
              <AnimateOnScroll key={winner.id} delay={i * 50}>
                <WinnerCard 
                  winner={winner} 
                  locale={locale} 
                  messages={messages} 
                  showYear={!yearFilter}
                />
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <AnimateOnScroll>
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center border rounded-3xl border-dashed border-primary/20 bg-primary/5">
              <Trophy className="h-16 w-16 text-primary/30 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                No Winners Found
              </h3>
              <p className="text-muted-foreground">{messages.home.noData}</p>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </main>
  );
}
