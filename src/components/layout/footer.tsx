"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Messages } from "@/i18n/get-messages";
import { LanguageSwitcher } from "./language-switcher";
import {
  MapPin,
  Phone,
  Heart,
} from "lucide-react";
import { TEMPLE_CONTACT, SOCIAL_LINKS } from "@/lib/constants/social";
import { MotionButton } from "@/components/home/motion-button";

interface FooterProps {
  locale: string;
  messages: Messages;
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function FooterLogo({ size = "md" }: { size?: "md" | "lg" }) {
  const [hasError, setHasError] = useState(false);
  const dimensions = size === "lg" ? { w: 72, h: 72, css: "h-20 w-20" } : { w: 44, h: 44, css: "h-11 w-11" };

  if (hasError) {
    return (
      <div className={`${dimensions.css} rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 backdrop-blur-sm shadow-xl`}>
        <span className="text-temple-gold font-bold text-2xl" aria-hidden="true">
          ॐ
        </span>
      </div>
    );
  }

  return (
    <div className={`${dimensions.css} rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-white/5 border border-white/10 p-2 backdrop-blur-sm shadow-xl`}>
      <Image
        src="/images/temple-logo.png"
        alt="Sri Sakthi Vinayagar Temple"
        width={dimensions.w}
        height={dimensions.h}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function Footer({ locale, messages }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  const phone = TEMPLE_CONTACT.phone;
  const whatsapp = TEMPLE_CONTACT.whatsapp;
  const address = locale === "ta" ? TEMPLE_CONTACT.address.ta : TEMPLE_CONTACT.address.en;
  // A shorter version of the address for the top bar
  const shortAddress = locale === "ta" ? "கடம்பாடி, மாமல்லபுரம்" : "Kadambadi, Mamallapuram";

  const templeLinks = [
    { href: `/${locale}/about`, label: messages.common.about },
    { href: `/${locale}/story`, label: messages.common.vinayagarStory },
    { href: `/${locale}/pooja`, label: messages.common.pooja },
    { href: `/${locale}/events`, label: messages.common.events },
  ];

  const festivalLinks = [
    { href: `/${locale}/festival`, label: messages.common.festival },
    { href: `/${locale}/winners`, label: messages.common.winners },
    { href: `/${locale}/gallery`, label: messages.common.gallery },
    { href: `/${locale}/videos`, label: messages.common.videos },
  ];

  const connectLinks = [
    { href: `/${locale}/expenses`, label: messages.common.expenses },
    { href: `/${locale}/invitations`, label: messages.common.invitation },
    { href: `/${locale}/contact`, label: messages.common.contact },
  ];

  return (
    <motion.footer
      ref={ref}
      className="relative footer-gradient footer-fade-top text-white/90 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Decorative Top Border */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-temple-gold/40 to-transparent" />

      {/* Sacred Geometry Background (Watermark) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] rounded-full border-[1px] border-white flex items-center justify-center">
          <div className="w-[80%] h-[80%] rounded-full border-[1px] border-white flex items-center justify-center">
            <div className="w-[60%] h-[60%] rounded-full border-[1px] border-white flex items-center justify-center">
              <span className="text-[200px] sm:text-[400px] leading-none text-white font-serif">ॐ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">

        {/* =========================================
            TOP SECTION: Centered Branding & Hero CTA
            ========================================= */}
        <div className="flex flex-col items-center text-center pt-8 pb-6 border-b border-white/10 space-y-5">
          <div className="relative group">
            <div className="absolute -inset-4 bg-temple-gold/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <FooterLogo size="lg" />
          </div>

          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/60 tracking-tight">
              {locale === "ta" ? messages.site.nameTa : "Sri Sakthi Vinayagar Temple"}
            </h2>
            <p className="text-temple-gold/80 italic font-display text-sm sm:text-base">
              {messages.site.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/70 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-temple-gold/80" />
              <span>{shortAddress}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-temple-gold/80" />
              <a href={`tel:+91${phone}`} className="hover:text-temple-gold transition-colors">{phone}</a>
            </div>
          </div>

          <div className="pt-2">
            <Link href={`/${locale}/donations`}>
              <MotionButton variant="premium-gold" className="px-6 h-11 text-[15px] group">
                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" />
                {messages.common.donate}
              </MotionButton>
            </Link>
          </div>
        </div>

        {/* =========================================
            MIDDLE SECTION: Navigation Links
            ========================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 py-8 lg:py-10">
          {/* Column 1: Full Address */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-temple-gold mb-3 font-display">
              {messages.home.location}
            </h4>
            <p className="text-[13px] text-white/80 leading-relaxed whitespace-pre-line border-l-2 border-temple-gold/30 pl-3 py-0.5">
              {address}
            </p>
          </div>

          {/* Column 2: Temple */}
          <nav aria-label="Temple navigation" className="space-y-3 lg:pl-6">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-temple-gold mb-3 font-display">
              {messages.common.temple}
            </h4>
            <ul className="space-y-2">
              {templeLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-[13px] text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-temple-gold/0 group-hover:bg-temple-gold/80 mr-2 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Festival */}
          <nav aria-label="Festival navigation" className="space-y-3 lg:pl-6">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-temple-gold mb-3 font-display">
              {messages.common.festival}
            </h4>
            <ul className="space-y-2">
              {festivalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-[13px] text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-temple-gold/0 group-hover:bg-temple-gold/80 mr-2 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Connect */}
          <nav aria-label="Connect navigation" className="space-y-3 lg:pl-6">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-temple-gold mb-3 font-display">
              {messages.common.contact}
            </h4>
            <ul className="space-y-2">
              {connectLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-[13px] text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-temple-gold/0 group-hover:bg-temple-gold/80 mr-2 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* =========================================
            BOTTOM SECTION: Social & Legal
            ========================================= */}
        <div className="border-t border-white/10 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

            {/* Left: Language */}
            <div className="order-3 lg:order-1">
              <LanguageSwitcher />
            </div>

            {/* Center: Copyright */}
            <div className="order-2 text-center">
              <p className="text-[11px] text-white/40">
                &copy; {currentYear} {messages.site.name}. {messages.site.copyright}
              </p>
              <Link
                href={`/${locale}/admin`}
                className="text-[10px] text-white/20 hover:text-temple-gold transition-colors mt-1 inline-block"
              >
                {messages.common.admin} Login
              </Link>
            </div>

            {/* Right: Social Floating Bar */}
            <div className="order-1 lg:order-3 flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <a
                href={`tel:+91${phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:text-temple-gold hover:bg-white/10 transition-all duration-200"
                aria-label={messages.common.phone}
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:text-green-400 hover:bg-white/10 transition-all duration-200"
                aria-label={messages.common.whatsapp}
              >
                <WhatsappIcon className="h-4 w-4" />
              </a>
              {SOCIAL_LINKS.instagram && (
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:text-pink-400 hover:bg-white/10 transition-all duration-200"
                  aria-label={messages.common.instagram}
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              <a
                href={SOCIAL_LINKS.googleMapsPlaceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:text-temple-gold hover:bg-white/10 transition-all duration-200"
                aria-label={messages.home.location}
              >
                <MapPin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
