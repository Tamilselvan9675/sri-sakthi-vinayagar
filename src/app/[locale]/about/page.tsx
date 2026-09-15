import Image from "next/image";
import { getMessages } from "@/i18n/get-messages";
import { TempleDivider } from "@/components/ui/temple-divider";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Flame, Star, BookOpen, Clock } from "lucide-react";

export default async function AboutPage(props: PageProps<"/[locale]/about">) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[50vh] lg:min-h-[60vh] text-center overflow-hidden">
        <Image
          src="/images/temple-exterior.jpg"
          alt="Sri Sakthi Vinayagar Temple"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 max-w-4xl px-4 sm:px-6 space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            {messages.pages.aboutTitle}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {messages.pages.aboutDesc}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 space-y-20 lg:space-y-28">
        
        {/* Intro */}
        <AnimateOnScroll>
          <section className="max-w-4xl mx-auto text-center space-y-6">
            <Flame className="h-12 w-12 text-temple-gold mx-auto opacity-80" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              A Legacy of Devotion
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              For generations, the Sri Sakthi Vinayagar Temple has stood as a beacon of spirituality, peace, and community harmony. Nestled in the heart of our community, the temple is dedicated to Lord Ganesha, the remover of obstacles and the deity of beginnings and wisdom.
            </p>
          </section>
        </AnimateOnScroll>

        <TempleDivider variant="subtle" />

        {/* Features */}
        <AnimateOnScroll>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center space-y-4 hover:border-primary/30 transition-colors shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold">Divine Architecture</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Experience traditional South Indian temple architecture featuring intricate carvings, majestic gopurams, and peaceful sanctums designed according to ancient Agama shastras.
              </p>
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center space-y-4 hover:border-primary/30 transition-colors shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold">Vedic Traditions</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We strictly adhere to authentic Vedic rituals and pooja methodologies, ensuring every ceremony is conducted with utmost sanctity and devotion.
              </p>
            </div>
            
            <div className="bg-card border border-border/50 rounded-2xl p-8 text-center space-y-4 hover:border-primary/30 transition-colors shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold">Community Focus</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Beyond spiritual services, the temple actively engages in community welfare, educational support, and preserving our rich cultural heritage.
              </p>
            </div>
          </section>
        </AnimateOnScroll>

      </div>
    </main>
  );
}
