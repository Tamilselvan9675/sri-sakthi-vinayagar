/**
 * Locale Layout
 *
 * Wraps all pages under /[locale]/ with locale-specific context.
 * Includes Header, Footer, and WhatsApp FAB.
 */

import { notFound } from "next/navigation";
import { isValidLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/get-messages";
import { getTempleSettings } from "@/lib/api/settings";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/whatsapp/whatsapp-fab";

export async function generateMetadata(
  props: PageProps<"/[locale]">,
) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);

  return {
    title: {
      default: messages.site.name,
      template: `%s | ${messages.site.name}`,
    },
    description: messages.site.description,
    openGraph: {
      title: messages.site.name,
      description: messages.site.description,
      locale: locale === "ta" ? "ta_IN" : "en_IN",
      type: "website",
    },
    alternates: {
      languages: {
        en: "/en",
        ta: "/ta",
      },
    },
  };
}

export default async function LocaleLayout(
  props: LayoutProps<"/[locale]">,
) {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);
  const settings = await getTempleSettings();

  return (
    <div lang={locale}>
      <Header locale={locale} messages={messages} />
      <div className="flex-1">
        {props.children}
      </div>
      <Footer locale={locale} messages={messages} />
      <WhatsAppFab phoneNumber={settings?.whatsapp || ""} />
    </div>
  );
}
