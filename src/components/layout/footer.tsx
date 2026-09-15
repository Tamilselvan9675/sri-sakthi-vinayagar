import Link from "next/link";
import { Messages } from "@/i18n/get-messages";
import { MapPin, Phone, MessageCircle } from "lucide-react";

interface FooterProps {
  locale: string;
  messages: Messages;
}

export function Footer({ locale, messages }: FooterProps) {
  const currentYear = new Date().getFullYear();

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
    { href: `/${locale}/donations`, label: messages.common.donations },
    { href: `/${locale}/expenses`, label: messages.common.expenses },
    { href: `/${locale}/invitations`, label: messages.common.invitation },
    { href: `/${locale}/contact`, label: messages.common.contact },
  ];

  return (
    <footer className="relative bg-temple-maroon-deep text-white/90">
      {/* Decorative Top Border */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-temple-gold to-transparent" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 py-12 lg:py-16">
          {/* Temple Identity */}
          <div className="sm:col-span-2 space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <span className="text-temple-gold font-bold text-lg" aria-hidden="true">ॐ</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-semibold leading-tight text-white">
                  {locale === "ta" ? messages.site.nameTa : "Sri Sakthi Vinayagar"}
                </span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                  {locale === "ta" ? "கோயில்" : "Temple"}
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              {messages.site.description}
            </p>
            <p className="text-xs italic text-temple-gold/70 font-display">
              {messages.site.tagline}
            </p>
          </div>

          {/* Temple Links */}
          <nav aria-label="Temple navigation">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              {messages.common.temple}
            </h4>
            <ul className="space-y-2.5">
              {templeLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-temple-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Festival Links */}
          <nav aria-label="Festival navigation">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              {messages.common.festival}
            </h4>
            <ul className="space-y-2.5">
              {festivalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-temple-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect Links */}
          <nav aria-label="Connect navigation">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
              {messages.common.contact}
            </h4>
            <ul className="space-y-2.5">
              {connectLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-temple-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="tel:+910000000000"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-temple-gold hover:bg-white/15 transition-colors"
                aria-label={messages.common.phone}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://wa.me/910000000000"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-green-400 hover:bg-white/15 transition-colors"
                aria-label={messages.common.whatsapp}
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-temple-gold hover:bg-white/15 transition-colors"
                aria-label={messages.home.location}
              >
                <MapPin className="h-3.5 w-3.5" />
              </a>
            </div>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {currentYear} {messages.site.name}. {messages.site.copyright}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin`}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              {messages.common.admin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
