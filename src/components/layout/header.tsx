"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    { href: `/${locale}/festival`, label: messages.common.festival },
    { href: `/${locale}/pooja`, label: messages.common.pooja },
    { href: `/${locale}/events`, label: messages.common.events },
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
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6 lg:px-8">
        {/* Logo & Name */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 group shrink-0"
        >
          {/* Temple OM Symbol */}
          <div className="relative h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 transition-colors">
            <span className="text-primary font-bold text-base leading-none" aria-hidden="true">
              ॐ
            </span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display text-base font-semibold tracking-tight leading-tight text-foreground">
              {locale === "ta" ? messages.site.nameTa : "Sri Sakthi Vinayagar"}
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground leading-tight">
              {locale === "ta" ? "கோயில்" : "Temple"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 ml-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${
                isActive(link.href)
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {/* Donate Button */}
          <Link href={`/${locale}/donations`} className="hidden sm:block">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-medium text-xs rounded-lg px-4"
            >
              <Heart className="h-3.5 w-3.5" />
              {messages.common.donate}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="xl:hidden h-9 w-9 p-0"
                />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="p-6 border-b border-border/60">
                  <Link
                    href={`/${locale}`}
                    className="flex items-center gap-3"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-primary font-bold text-lg" aria-hidden="true">ॐ</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display text-sm font-semibold leading-tight">
                        {locale === "ta" ? messages.site.nameTa : "Sri Sakthi Vinayagar"}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {locale === "ta" ? "கோயில்" : "Temple"}
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile navigation">
                  <div className="flex flex-col gap-0.5">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive(link.href)
                            ? "text-primary bg-primary/8"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-border/60 space-y-4">
                  {/* Donate */}
                  <Link
                    href={`/${locale}/donations`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button className="w-full gap-2">
                      <Heart className="h-4 w-4" />
                      {messages.common.donate}
                    </Button>
                  </Link>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
