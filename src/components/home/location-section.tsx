"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Messages } from "@/i18n/get-messages";
import { MotionButton } from "./motion-button";
import {
  MapPin,
  Phone,
  Navigation,
  Share2,
} from "lucide-react";
import { TEMPLE_CONTACT, SOCIAL_LINKS, TEMPLE_COORDINATES } from "@/lib/constants/social";
import { SectionHeader } from "@/components/ui/section-header";

// Custom SVG Icons (Since older lucide versions lack brand icons)
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

interface HomeLocationSectionProps {
  locale: string;
  messages: Messages;
  settings: {
    addressEn?: string | null;
    addressTa?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}

export function HomeLocationSection({
  locale,
  messages,
  settings,
}: HomeLocationSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  const phone = settings?.phone || TEMPLE_CONTACT.phone;
  const whatsapp = settings?.whatsapp || TEMPLE_CONTACT.whatsapp;
  const lat = settings?.latitude || TEMPLE_COORDINATES.latitude;
  const lng = settings?.longitude || TEMPLE_COORDINATES.longitude;

  const address =
    locale === "ta" ? TEMPLE_CONTACT.address.ta : TEMPLE_CONTACT.address.en;

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  const handleShare = async () => {
    const shareData = {
      title: "Sri Sakthi Vinayagar Temple",
      text: address.replace(/\n/g, ", "),
      url: mapsUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    }
  };

  return (
    <motion.section
      ref={ref}
      id="contact"
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left: Address & Actions */}
      <div className="space-y-8 flex flex-col justify-center">
        <div className="relative">
          <div className="absolute -left-6 top-0 w-12 h-12 bg-temple-gold/10 rounded-full blur-xl" />
          <SectionHeader
            title={messages.home.location}
            subtitle={messages.home.contactTemple}
            icon={MapPin}
          />
        </div>

        {/* Premium Address Card */}
        <motion.div 
          className="relative group rounded-3xl border border-primary/10 bg-gradient-to-br from-card to-card/50 p-6 sm:p-8 shadow-lg shadow-primary/5 overflow-hidden transition-all duration-500 hover:shadow-primary/10 hover:border-primary/20"
          whileHover={{ y: -2 }}
        >
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
          
          <div className="relative z-10 space-y-6">
            {/* Address */}
            <div className="flex items-start gap-5">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-primary mt-1 shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold mb-1.5 font-display text-foreground">
                  {locale === "ta"
                    ? "ஸ்ரீ சக்தி விநாயகர் கோயில்"
                    : "Sri Sakthi Vinayagar Temple"}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-medium">
                  {address}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-5">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-primary mt-1 shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold mb-1 text-foreground">
                  {messages.common.phone}
                </h4>
                <a
                  href={`tel:+91${phone}`}
                  className="text-sm text-muted-foreground font-medium hover:text-primary transition-colors"
                >
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <a href={`tel:+91${phone}`}>
            <MotionButton
              variant="outline-temple"
              className="w-full text-sm py-3 font-semibold group rounded-2xl border-primary/20 hover:bg-primary hover:text-primary-foreground dark:text-temple-gold dark:border-temple-gold/30 dark:hover:bg-temple-gold dark:hover:text-black"
            >
              <Phone className="h-4 w-4 group-hover:-rotate-12 transition-transform" />
              {messages.common.call}
            </MotionButton>
          </a>

          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
            <MotionButton
              variant="whatsapp"
              className="w-full text-sm py-3 font-semibold group rounded-2xl bg-green-50/50 hover:bg-[#25D366] hover:text-white border-green-200 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400 dark:hover:bg-[#25D366] dark:hover:text-black"
            >
              <WhatsappIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
              {messages.common.whatsapp}
            </MotionButton>
          </a>

          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <MotionButton
              variant="outline-temple"
              className="w-full text-sm py-3 font-semibold group rounded-2xl border-primary/20 hover:bg-primary hover:text-primary-foreground dark:text-temple-gold dark:border-temple-gold/30 dark:hover:bg-temple-gold dark:hover:text-black"
            >
              <Navigation className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              {messages.common.getDirections}
            </MotionButton>
          </a>

          {SOCIAL_LINKS.instagram ? (
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
              <MotionButton
                variant="outline-temple"
                className="w-full text-sm py-3 font-semibold group rounded-2xl border-primary/20 hover:border-transparent hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white dark:text-pink-400 dark:border-pink-900/50 dark:hover:text-white transition-all"
              >
                <InstagramIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {messages.common.instagram}
              </MotionButton>
            </a>
          ) : (
            <MotionButton
              variant="outline-temple"
              className="w-full text-sm py-3 font-semibold group rounded-2xl border-primary/20 hover:bg-primary hover:text-primary-foreground dark:text-temple-gold dark:border-temple-gold/30 dark:hover:bg-temple-gold dark:hover:text-black"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              {messages.common.shareLocation}
            </MotionButton>
          )}
        </div>
      </div>

      {/* Right: Embedded Map with Premium Frame */}
      <div className="relative h-[400px] lg:h-[600px] w-full mt-6 lg:mt-0 group">
        <div className="absolute -inset-1 bg-gradient-to-br from-temple-gold/30 via-primary/10 to-temple-gold/30 rounded-[1rem] blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        <div className="relative h-full w-full rounded-3xl overflow-hidden border-2 border-white/50 dark:border-white/10 shadow-2xl bg-muted">
          <iframe
            src={mapsEmbedUrl}
            className="w-full h-full border-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sri Sakthi Vinayagar Temple Location"
          />
          {/* Internal Overlay for premium feel (fades on hover) */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] transition-opacity duration-500 group-hover:opacity-0" />
        </div>
      </div>
    </motion.section>
  );
}
