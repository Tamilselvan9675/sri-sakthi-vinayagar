import { getMessages } from "@/i18n/get-messages";
import { ExpensesContent } from "./expenses-content";
import { getCmsFinance } from "@/lib/cms/content";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.common.expenses,
  };
}

export default async function ExpensesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const finance = await getCmsFinance();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <ExpensesContent
        locale={locale}
        donors={finance?.donors}
        expenses={finance?.expenses}
        year={finance?.year}
      />
    </main>
  );
}
