import { getMessages } from "@/i18n/get-messages";
import { getTempleSettings } from "@/lib/api/settings";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { MapPin } from "lucide-react";
import { ContactContent } from "./contact-content";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.common.contact,
  };
}

export default async function ContactPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  const settings = await getTempleSettings();
  
  return (
    <main className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Subtle Background Detail */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/[0.02] -skew-y-3 origin-top-left -z-10 pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-temple-gold/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl relative z-0">
        
        {/* HERO SECTION */}
        <AnimateOnScroll>
          <div className="text-center space-y-4 mb-16 lg:mb-20 max-w-3xl mx-auto">
            <SectionHeader
              title={messages.common.contact}
              subtitle={
                locale === "ta"
                  ? "கோயில் தகவல்கள், பூஜை நேரங்கள் மற்றும் திருவிழா நிகழ்ச்சிகள் குறித்து அறிய எங்களை தொடர்பு கொள்ளவும்."
                  : "We would be happy to hear from you. Reach out to Sri Sakthi Vinayagar Temple for temple information, pooja schedules, festivals and other enquiries."
              }
              icon={MapPin}
              align="center"
            />
          </div>
        </AnimateOnScroll>

        {/* INTERACTIVE CONTENT GRID & MAP */}
        <ContactContent locale={locale} messages={messages} settings={settings} />
      </div>
    </main>
  );
}
