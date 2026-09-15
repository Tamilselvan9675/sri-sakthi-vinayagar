import { db } from "@/lib/db";
import { DonationForm } from "@/components/donations/donation-form";
import { Heart, Landmark, Smartphone } from "lucide-react";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Card, CardContent } from "@/components/ui/card";

export default async function DonationsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;

  // Fetch temple settings for general QR or Bank details
  const settings = await db.templeSettings.findFirst();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-6xl">
        
        <AnimateOnScroll>
          <div className="text-center space-y-4 mb-16">
            <SectionHeader
              title={locale === "ta" ? "நன்கொடைகள்" : "Support the Temple"}
              subtitle={locale === "ta" 
                ? "உங்கள் தாராளமான நன்கொடைகள் கோவிலின் வளர்ச்சி மற்றும் விழாக்களை சிறப்பாக நடத்த உதவுகின்றன."
                : "Your generous donations help sustain our daily poojas, major festivals, and community welfare programs."}
              icon={Heart}
              align="center"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: General Instructions & Bank Details */}
          <div className="lg:col-span-5 space-y-8">
            <AnimateOnScroll animation="fade-up" delay={100}>
              <Card className="border border-border/50 shadow-md bg-card">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Landmark className="h-5 w-5 text-primary" />
                    </div>
                    {locale === "ta" ? "வங்கி விவரங்கள்" : "Direct Bank Transfer"}
                  </h2>
                  
                  <div className="space-y-4 text-sm bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex flex-col sm:flex-row justify-between gap-1 pb-3 border-b border-border/50">
                      <span className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">Account Name</span>
                      <span className="font-semibold text-base">{settings?.templeNameEn || "Sakthi Vinayagar Temple"}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 pb-1">
                      <span className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">UPI ID</span>
                      <span className="font-semibold text-base font-mono">{settings?.upiId || "Not available"}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
                    {locale === "ta" 
                      ? "நேரடி வங்கி பரிமாற்றத்திற்குப் பிறகு, ரசீது பெற தயவுசெய்து நிர்வாகத்தை தொடர்பு கொள்ளவும்."
                      : "After a direct bank transfer, please contact the temple administration for your receipt."}
                  </p>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {settings?.qrCodeUrl && (
              <AnimateOnScroll animation="fade-up" delay={200}>
                <Card className="border border-border/50 shadow-md bg-card text-center">
                  <CardContent className="p-8">
                    <h2 className="font-display text-xl font-bold mb-6 flex items-center justify-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      {locale === "ta" ? "பொதுவான QR குறியீடு" : "Scan to Pay"}
                    </h2>
                    <div className="relative w-56 h-56 mx-auto bg-white p-4 rounded-2xl shadow-inner border border-border/50">
                      <Image 
                        src={settings.qrCodeUrl} 
                        alt="Temple QR Code" 
                        fill 
                        className="object-contain p-2" 
                        unoptimized 
                      />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            )}
          </div>

          {/* Right Side: Dynamic Donation Form */}
          <div className="lg:col-span-7">
            <AnimateOnScroll animation="slide-left" delay={300}>
              <div className="relative">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-3xl blur-2xl -z-10" />
                
                <Card className="border border-primary/20 shadow-xl bg-background/80 backdrop-blur overflow-hidden rounded-3xl">
                  <div className="bg-primary px-6 py-4 flex items-center gap-3">
                    <Heart className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                    <h3 className="text-primary-foreground font-semibold text-lg">
                      {locale === "ta" ? "விரைவான ஆன்லைன் நன்கொடை" : "Quick Digital Donation"}
                    </h3>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <DonationForm locale={locale} />
                  </CardContent>
                </Card>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </main>
  );
}
