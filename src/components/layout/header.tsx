"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Messages } from "@/i18n/get-messages";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  locale: string;
  messages: Messages;
}

/**
 * Temple logo component — used in desktop header, mobile header, and footer.
 * Falls back to OM symbol if the logo image is not available.
 */
function TempleLogo({ size = "sm" }: { size?: "sm" | "md" }) {
  const [hasError, setHasError] = useState(false);
  const dimensions = size === "sm" ? { w: 36, h: 36 } : { w: 40, h: 40 };

  if (hasError) {
    return (
      <div
        className={`${size === "sm" ? "h-9 w-9" : "h-10 w-10"} rounded-lg bg-gradient-to-br from-red-950 to-red-900 flex items-center justify-center border border-temple-gold/30 shadow-inner`}
      >
        <span
          className={`text-temple-gold font-bold ${size === "sm" ? "text-base" : "text-lg"} leading-none`}
          aria-hidden="true"
        >
          ॐ
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${size === "sm" ? "h-9 w-9" : "h-10 w-10"} rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-temple-gold/20 shadow-sm`}
    >
      <Image
        src="/images/temple-logo.png"
        alt="Sri Sakthi Vinayagar Temple"
        width={dimensions.w}
        height={dimensions.h}
        className="w-full h-full object-contain bg-white dark:bg-black"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export { TempleLogo };

export function Header({ locale, messages }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}`, label: messages.common.home },
    { href: `/${locale}/about`, label: messages.common.about },
    { href: `/${locale}/events`, label: messages.common.events }, // Consolidates Pooja & Events
    { href: `/${locale}/winners`, label: messages.common.winners },
    { href: `/${locale}/gallery`, label: messages.common.gallery },
    { href: `/${locale}/videos`, label: messages.common.videos },
    { href: `/${locale}/expenses`, label: messages.common.expenses },
    { href: `/${locale}/contact`, label: messages.common.contact },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${scrolled
            ? "bg-[#fdfbf7]/85 dark:bg-[#150a0a]/85 backdrop-blur-sm border-b border-temple-gold/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-white/40 dark:bg-black/20 backdrop-blur-sm border-b border-transparent"
          }`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto flex h-16 sm:h-20 items-center px-4 md:px-6 lg:px-8">
          {/* Logo & Name */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group shrink-0"
          >
            <TempleLogo size="sm" />
            <div className="hidden sm:flex flex-col">
              <span className="font-display text-base font-bold tracking-tight leading-tight text-foreground group-hover:text-temple-gold transition-colors duration-300">
                {locale === "ta" ? messages.site.nameTa : "Sri Sakthi Vinayagar"}
              </span>

            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 ml-8" aria-label="Main navigation">
            <AnimatePresence>
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-2 ${locale === "ta" ? "px-2 text-[10px] tracking-tighter" : "px-3.5 text-[13px] tracking-wide"} font-semibold rounded-md transition-all duration-300 group overflow-hidden`}
                  >
                    <span className={`relative z-10 transition-colors duration-300 ${active ? "text-temple-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" : "text-foreground/80 group-hover:text-foreground"}`}>
                      {link.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-1.5 left-3.5 right-3.5 h-[2px] bg-temple-gold shadow-[0_0_8px_rgba(212,175,55,0.8)] rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div className="absolute inset-0 bg-temple-gold/5 dark:bg-temple-gold/10 opacity-0 group-hover:opacity-100 rounded-md transition-opacity duration-300 pointer-events-none" />
                  </Link>
                );
              })}
            </AnimatePresence>
          </nav>

          {/* Right Side Controls */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {/* Donate Button */}
            <Link href={`/${locale}/donations`} className="hidden sm:block">
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  size="sm"
                  className="bg-[oklch(0.35_0.12_22)] hover:bg-[oklch(0.32_0.13_22)] text-white gap-2 font-semibold tracking-wide text-xs rounded-full px-5 h-9 border border-temple-gold/40 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_-3px_rgba(212,175,55,0.5)] transition-all duration-300"
                >
                  <Heart className="h-3.5 w-3.5 text-temple-gold fill-temple-gold/20" />
                  {messages.common.donate}
                </Button>
              </motion.div>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="xl:hidden h-9 w-9 p-0 hover:bg-temple-gold/10 hover:text-temple-gold"
                  />
                }
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 bg-[#fdfbf7] dark:bg-[#150a0a] border-l border-temple-gold/20">
                <div className="flex flex-col h-full relative overflow-hidden">
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

                  {/* Mobile Header */}
                  <div className="p-6 border-b border-temple-gold/20 relative z-10">
                    <Link
                      href={`/${locale}`}
                      className="flex items-center gap-3"
                      onClick={() => setMobileOpen(false)}
                    >
                      <TempleLogo size="md" />
                      <div className="flex flex-col">
                        <span className="font-display text-sm font-bold leading-tight text-foreground">
                          {locale === "ta" ? messages.site.nameTa : "Sri Sakthi Vinayagar"}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-temple-gold font-semibold">
                          {locale === "ta" ? "கோயில்" : "Temple"}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 overflow-y-auto p-4 relative z-10" aria-label="Mobile navigation">
                    <div className="flex flex-col gap-1">
                      {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`px-4 py-3.5 ${locale === "ta" ? "text-[13px]" : "text-sm"} font-semibold rounded-xl transition-all duration-300 flex items-center ${active
                                ? "text-temple-gold bg-gradient-to-r from-temple-gold/10 to-transparent border-l-2 border-temple-gold"
                                : "text-muted-foreground hover:text-foreground hover:bg-temple-gold/5"
                              }`}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Mobile Footer */}
                  <div className="p-6 border-t border-temple-gold/20 space-y-5 relative z-10 bg-[#fdfbf7]/90 dark:bg-[#150a0a]/90 backdrop-blur-md">
                    <Link
                      href={`/${locale}/donations`}
                      onClick={() => setMobileOpen(false)}
                      className="block"
                    >
                      <Button className="w-full gap-2 bg-[oklch(0.35_0.12_22)] hover:bg-[oklch(0.32_0.13_22)] text-white rounded-full font-semibold border border-temple-gold/40 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)]">
                        <Heart className="h-4 w-4 text-temple-gold fill-temple-gold/20" />
                        {messages.common.donate}
                      </Button>
                    </Link>

                    <div className="flex items-center justify-between px-2">
                      <LanguageSwitcher />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Premium Architectural Curved Edge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="absolute top-full left-0 right-0 w-full pointer-events-none z-0 flex flex-col"
        >
          <svg
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            className={`w-full h-[24px] sm:h-[32px] transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
          >
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b1818" stopOpacity="0.1" />   {/* Maroon fade out */}
                <stop offset="50%" stopColor="#d4af37" stopOpacity="0.7" />  {/* Gold center */}
                <stop offset="100%" stopColor="#8b1818" stopOpacity="0.1" /> {/* Maroon fade out */}
              </linearGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* The fill mimicking the glassmorphism header background */}
            <path
              d="M0,0 C300,40 900,40 1200,0 L1200,0 L0,0 Z"
              className="fill-[#fdfbf7]/85 dark:fill-[#150a0a]/85"
            />
            {/* The decorative glowing stroke */}
            <path
              d="M0,0 C300,40 900,40 1200,0"
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="2"
              filter="url(#goldGlow)"
            />
          </svg>
          {/* Subtle blur mask below the curve to blend it smoothly */}
          <div
            className={`w-full h-6 bg-[#fdfbf7]/60 dark:bg-[#150a0a]/60 backdrop-blur-sm -mt-[1px] transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] ${scrolled ? "opacity-100" : "opacity-0"}`}
          />
        </motion.div>
      </motion.header>

      {/* Spacer to prevent content from going under the fixed header when scrolled to top */}
      <div className="h-16 sm:h-20" aria-hidden="true" />
    </>
  );
}
