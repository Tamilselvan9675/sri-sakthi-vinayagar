import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/i18n/get-messages";
import { getLocalizedField } from "@/lib/utils/locale";
import { getActiveFestivalYear, getOrganizers } from "@/lib/api/festival";
import { getTempleSettings } from "@/lib/api/settings";
import { Countdown } from "@/components/home/countdown";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HomeLocationSection } from "@/components/home/location-section";
import { SupportTempleSection } from "@/components/home/support-temple-section";
import { ScheduleCalendarSection } from "@/components/home/schedule-calendar-section";
import { MotionButton } from "@/components/home/motion-button";
import { MotionSection } from "@/components/home/motion-section";
import { SectionHeader } from "@/components/ui/section-header";
import { TempleDivider } from "@/components/ui/temple-divider";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Heart,
  ArrowRight,
  FileText,
  MessageCircle,
  Trophy,
  IndianRupee,
  Users
} from "lucide-react";

export default async function LocaleHomePage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);

  const festival = await getActiveFestivalYear();
  const settings = await getTempleSettings();
  const organizers = await getOrganizers();

  const titleLocal = festival
    ? getLocalizedField(festival, "title", locale)
    : messages.home.heroSubtitle;
  const descLocal = festival
    ? getLocalizedField(festival, "description", locale)
    : "";

  return (
    <main className="flex min-h-screen flex-col">
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] lg:min-h-[90vh] text-center overflow-hidden">
        {/* Background Carousel */}
        <HeroCarousel />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-[1]" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl px-4 sm:px-6 space-y-6 flex flex-col items-center">
          {/* Tagline */}
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs sm:text-sm text-white/90 font-medium tracking-wide">
            <Flame className="h-3.5 w-3.5 mr-2 text-temple-gold" />
            <span>{messages.site.tagline}</span>
          </div>

          {/* Temple Name */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-[1.1]">
            {locale === "ta" ? messages.hero.title : "Sri Sakthi Vinayagar"}
            <span className="block text-2xl sm:text-3xl md:text-4xl mt-3 text-white/80 font-normal tracking-wide">
              {locale === "ta" ? "" : "Temple"}
            </span>
          </h1>

          {/* Festival Title */}
          {titleLocal && (
            <p className="text-lg sm:text-xl md:text-2xl text-temple-gold font-display font-medium tracking-wide">
              {titleLocal}
            </p>
          )}

          {/* Subtitle */}
          <p className="max-w-xl text-sm sm:text-base text-white/70 leading-relaxed">
            {messages.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Link href={`/${locale}/festival`}>
              <MotionButton variant="temple-primary">
                {messages.hero.viewFestival}
                <ArrowRight className="h-4 w-4" />
              </MotionButton>
            </Link>
            <Link href={`/${locale}/pooja`}>
              <MotionButton variant="hero-outline">
                {messages.hero.poojaSchedule}
              </MotionButton>
            </Link>
            <Link href={`/${locale}/donations`}>
              <MotionButton variant="hero-gold">
                <Heart className="h-4 w-4" />
                {messages.hero.donate}
              </MotionButton>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ================================================================
          FESTIVAL COUNTDOWN
          ================================================================ */}
      {festival && (
        <section className="relative -mt-16 z-20 container mx-auto px-4 md:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-up">
            <Countdown
              startDate={festival.startDate}
              endDate={festival.endDate}
              messages={messages}
              locale={locale}
            />
          </AnimateOnScroll>
        </section>
      )}

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 space-y-20 lg:space-y-28">
        {/* ================================================================
            TEMPLE INTRODUCTION — Asymmetric Layout
            ================================================================ */}
        <MotionSection>
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-3 space-y-6">
              <SectionHeader
                title={messages.home.templeIntro}
                subtitle={messages.home.templeIntroDesc}
              />
              {descLocal && (
                <p className="text-muted-foreground leading-relaxed text-base">
                  {descLocal}
                </p>
              )}
              <Link href={`/${locale}/about`}>
                <MotionButton variant="outline-temple">
                  {messages.home.exploreTemple}
                  <ArrowRight className="h-4 w-4" />
                </MotionButton>
              </Link>
            </div>
            <div className="lg:col-span-2 relative">
              <div className="aspect-[4/5] rounded-2xl bg-muted overflow-hidden border border-border/50 shadow-xl">
                <Image
                  src="/images/hero-vinayagar.jpg"
                  alt="Sri Sakthi Vinayagar Temple"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border-2 border-temple-gold/20 -z-10" />
            </div>
          </section>
        </MotionSection>

        <TempleDivider variant="gold" />

        {/* ================================================================
            SCHEDULE CALENDAR
            ================================================================ */}
        <MotionSection>
          <ScheduleCalendarSection locale={locale} messages={messages} />
        </MotionSection>

        {/* ================================================================
            INVITATION
            ================================================================ */}
        {festival?.invitations[0] && (
          <MotionSection>
            <section className="relative bg-primary/5 dark:bg-primary/10 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 border border-primary/10 overflow-hidden">
              <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                <FileText className="w-48 h-48 text-primary" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <SectionHeader
                    title={messages.home.invitation}
                    subtitle={getLocalizedField(festival.invitations[0], "title", locale)}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                    {festival.invitations[0].pdfUrl && (
                      <a href={festival.invitations[0].pdfUrl} target="_blank" rel="noreferrer">
                        <MotionButton variant="temple-primary">
                          <FileText className="h-4 w-4" />
                          {messages.invitation.viewInvitation}
                        </MotionButton>
                      </a>
                    )}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(messages.invitation.shareMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MotionButton variant="whatsapp">
                        <MessageCircle className="h-4 w-4" />
                        {messages.home.shareOnWhatsapp}
                      </MotionButton>
                    </a>
                  </div>
                </div>
                {festival.invitations[0].imageUrl && (
                  <div className="flex-shrink-0 w-full max-w-xs rounded-xl overflow-hidden border-2 border-background shadow-xl">
                    <Image
                      src={festival.invitations[0].imageUrl}
                      alt="Festival Invitation"
                      width={320}
                      height={450}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </section>
          </MotionSection>
        )}

        {/* ================================================================
            WINNERS PREVIEW
            ================================================================ */}
        {festival?.winners && festival.winners.length > 0 && (
          <MotionSection>
            <section className="space-y-8">
              <div className="flex items-end justify-between gap-4">
                <SectionHeader
                  title={messages.home.ourWinners}
                  icon={Trophy}
                />
                <Link href={`/${locale}/winners`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    {messages.common.viewAll}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {festival.winners.map((winner, i) => (
                  <AnimateOnScroll key={winner.id} delay={i * 80}>
                    <div className="text-center space-y-3 group">
                      <div className="aspect-square rounded-xl bg-muted overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                        {winner.photoUrl ? (
                          <Image
                            src={winner.photoUrl}
                            alt={winner.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold leading-tight">
                          {winner.name}
                        </h4>
                        <p className="text-xs text-primary font-medium mt-0.5">
                          {winner.position}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getLocalizedField(winner, "category", locale)}
                        </p>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </section>
          </MotionSection>
        )}

        <TempleDivider />

        {/* ================================================================
            DONATION CTA
            ================================================================ */}
        <MotionSection>
          <SupportTempleSection
            locale={locale}
            messages={messages}
            settings={settings}
          />
        </MotionSection>

        {/* ================================================================
            EXPENSE TRANSPARENCY
            ================================================================ */}
        {festival?.expenses && festival.expenses.length > 0 && (
          <MotionSection>
            <section className="space-y-8">
              <div className="flex items-end justify-between gap-4">
                <SectionHeader
                  title={messages.home.recentExpenses}
                  subtitle={messages.home.expensesDesc}
                  icon={IndianRupee}
                />
                <Link href={`/${locale}/expenses`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    {messages.home.viewFullExpenses}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {festival.expenses.map((expense, i) => (
                  <AnimateOnScroll key={expense.id} delay={i * 60}>
                    <Card className="p-4 text-center hover:shadow-sm transition-shadow">
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        {getLocalizedField(expense.category, "name", locale)}
                      </p>
                      <p className="text-lg font-bold text-foreground font-mono">
                        ₹{Number(expense.amount).toLocaleString("en-IN")}
                      </p>
                    </Card>
                  </AnimateOnScroll>
                ))}
              </div>
            </section>
          </MotionSection>
        )}

        {/* ================================================================
            ORGANIZERS
            ================================================================ */}
        {organizers.length > 0 && (
          <MotionSection>
            <section className="space-y-8">
              <SectionHeader
                title={messages.home.ourOrganizers}
                icon={Users}
                align="center"
              />

              <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                {organizers.map((org, i) => (
                  <AnimateOnScroll key={org.id} delay={i * 60}>
                    <div className="flex flex-col items-center gap-3 w-28 sm:w-32 text-center group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted overflow-hidden border-2 border-border/50 group-hover:border-primary/30 transition-colors shadow-sm">
                        {org.photoUrl ? (
                          <Image
                            src={org.photoUrl}
                            alt={org.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <span className="text-xl font-bold text-muted-foreground/50">
                              {org.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold leading-tight">{org.name}</h4>
                        <p className="text-xs text-primary/80 font-medium mt-0.5">
                          {getLocalizedField(org, "role", locale)}
                        </p>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </section>
          </MotionSection>
        )}

        <TempleDivider variant="subtle" />

        {/* ================================================================
            LOCATION & CONTACT
            ================================================================ */}
        <HomeLocationSection
          locale={locale}
          messages={messages}
          settings={settings}
        />
      </div>
    </main>
  );
}
