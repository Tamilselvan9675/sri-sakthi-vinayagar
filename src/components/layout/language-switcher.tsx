"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n/config";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  ) || locales[0];

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    startTransition(() => {
      router.push(newPathname);
      router.refresh();
    });
  };

  return (
    <div
      className="flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/30"
      role="radiogroup"
      aria-label="Language selection"
    >
      <button
        onClick={() => switchLanguage("en")}
        disabled={isPending}
        role="radio"
        aria-checked={currentLocale === "en"}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
          currentLocale === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        onClick={() => switchLanguage("ta")}
        disabled={isPending}
        role="radio"
        aria-checked={currentLocale === "ta"}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
          currentLocale === "ta"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="தமிழுக்கு மாற்று"
      >
        தமிழ்
      </button>
    </div>
  );
}
