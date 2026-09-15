import { getMessages } from "@/i18n/get-messages";
import { getAllFestivalYears, getVideos } from "@/lib/api/festival";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { VideoCard } from "@/components/festival/video-card";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Video } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.pages.videosTitle,
    description: messages.pages.videosDesc,
  };
}

export default async function VideosPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const messages = await getMessages(locale);
  
  const yearFilter = searchParams.year ? parseInt(searchParams.year) : undefined;
  
  const [years, videos] = await Promise.all([
    getAllFestivalYears(),
    getVideos(yearFilter)
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
              title={messages.pages.videosTitle || messages.common.videos}
              subtitle={messages.pages.videosDesc}
              icon={Video}
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

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <AnimateOnScroll key={video.id} delay={i * 50}>
                <VideoCard 
                  video={video} 
                  locale={locale} 
                  messages={messages} 
                />
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <AnimateOnScroll>
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center border rounded-3xl border-dashed border-primary/20 bg-primary/5">
              <Video className="h-16 w-16 text-primary/30 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                No Videos Found
              </h3>
              <p className="text-muted-foreground">{messages.home.noData}</p>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </main>
  );
}
