import Link from "next/link";
import { getMessages } from "@/i18n/get-messages";
import { getAllFestivalYears } from "@/lib/api/festival";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.common.expenses,
  };
}

export default async function ExpensesArchivePage(props: PageProps<"/[locale]/expenses">) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  const festivalYears = await getAllFestivalYears();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-5xl">
        
        <AnimateOnScroll>
          <div className="space-y-4 mb-16 text-center">
            <SectionHeader
              title={messages.common.expenses}
              subtitle={locale === "ta" 
                ? "கோவில் திருவிழா மற்றும் தினசரி நிகழ்வுகளுக்கான வெளிப்படையான செலவு அறிக்கைகள்." 
                : "Transparent expense reports for temple festivals and daily activities."}
              icon={FileSpreadsheet}
              align="center"
            />
          </div>
        </AnimateOnScroll>

        {festivalYears.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {festivalYears.map((fy, i) => (
              <AnimateOnScroll key={fy.id} delay={i * 50}>
                <Link href={`/${locale}/expenses/${fy.year}`}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg overflow-hidden relative p-8 flex flex-col items-center text-center h-full bg-card">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                      <FileSpreadsheet className="w-32 h-32 text-primary" />
                    </div>
                    
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                      <span className="font-display text-2xl font-bold">{fy.year}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
                      {locale === "ta" ? `${fy.year} அறிக்கை` : `${fy.year} Report`}
                    </h3>
                    
                    <div className="mt-auto pt-6 w-full flex justify-center">
                      <Button variant="ghost" className="gap-2 group-hover:bg-primary/5">
                        {locale === "ta" ? "விவரங்களைக் காண்க" : "View Details"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <AnimateOnScroll>
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-primary/5 rounded-3xl border border-dashed border-primary/20">
              <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-primary/30" />
              <p className="text-lg font-medium">{messages.home.noData}</p>
            </div>
          </AnimateOnScroll>
        )}

      </div>
    </main>
  );
}
