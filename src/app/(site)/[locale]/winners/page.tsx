import { getMessages } from "@/i18n/get-messages";
import { getAllFestivalYears, getWinners } from "@/lib/api/festival";
import { WinnersContent } from "./winners-content";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.pages.winnersTitle,
    description: messages.pages.winnersDesc,
  };
}

export default async function WinnersPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  // Fetch ALL data server-side
  const years = await getAllFestivalYears();
  const winners = await getWinners();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#fdfbf7] via-orange-50/30 to-[#fdfbf7] dark:from-background dark:via-red-950/20 dark:to-background relative overflow-hidden">
      {/* Premium Temple Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-temple-gold/10 via-red-900/5 to-transparent blur-[80px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-[0.03] dark:opacity-[0.05] bg-repeat pointer-events-none z-0" />

      <WinnersContent 
        winners={winners} 
        years={years} 
        locale={locale} 
        messages={messages} 
      />
    </main>
  );
}
