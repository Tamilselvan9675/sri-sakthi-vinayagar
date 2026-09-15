import { getMessages } from "@/i18n/get-messages";
import { getAllFestivalYears, getGalleryAlbums } from "@/lib/api/festival";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { GalleryAlbumCard } from "@/components/festival/gallery-album-card";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Image as ImageIcon } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.pages.galleryTitle,
    description: messages.pages.galleryDesc,
  };
}

export default async function GalleryPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const messages = await getMessages(locale);
  
  const yearFilter = searchParams.year ? parseInt(searchParams.year) : undefined;
  
  const [years, albums] = await Promise.all([
    getAllFestivalYears(),
    getGalleryAlbums(yearFilter)
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
              title={messages.pages.galleryTitle}
              subtitle={messages.pages.galleryDesc}
              icon={ImageIcon}
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

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album, i) => (
              <AnimateOnScroll key={album.id} delay={i * 50}>
                <GalleryAlbumCard 
                  album={album} 
                  locale={locale} 
                  messages={messages} 
                />
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <AnimateOnScroll>
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center border rounded-3xl border-dashed border-primary/20 bg-primary/5">
              <ImageIcon className="h-16 w-16 text-primary/30 mb-6" />
              <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
                No Albums Found
              </h3>
              <p className="text-muted-foreground">{messages.home.noData}</p>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </main>
  );
}
