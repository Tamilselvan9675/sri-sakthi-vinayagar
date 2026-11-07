import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { getLocalizedField } from "@/lib/utils/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { IndianRupee, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export default async function PublicExpensePage(props: {
  params: Promise<{ locale: string; year: string }>;
}) {
  const { locale, year } = await props.params;
  const yearNum = parseInt(year);

  if (isNaN(yearNum)) notFound();

  const festival = await db.festivalYear.findUnique({
    where: { year: yearNum },
    include: {
      expenses: {
        include: { category: true },
        orderBy: { expenseDate: 'asc' }
      }
    }
  });

  if (!festival) notFound();

  const title = getLocalizedField(festival, 'title', locale);
  
  // Calculate totals
  const totalAmount = festival.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // Category totals
  const categoryTotals = festival.expenses.reduce((acc, curr) => {
    const catName = getLocalizedField(curr.category, 'name', locale);
    acc[catName] = (acc[catName] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-20 max-w-6xl">
        
        <AnimateOnScroll>
          <Button variant="ghost" size="sm" render={<Link href={`/${locale}/expenses`} />} className="gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            {locale === "ta" ? "பின்னே" : "Back"}
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <SectionHeader
              title={`${locale === "ta" ? "செலவு அறிக்கை" : "Expense Report"}: ${title}`}
              subtitle={locale === "ta" 
                ? "திருவிழாவின் போது செய்யப்பட்ட செலவுகளின் வெளிப்படையான கணக்கு."
                : "Transparent accounting of expenses incurred during the festival."}
              icon={IndianRupee}
            />

            <Button className="shrink-0 rounded-xl gap-2" render={<Link href={`/api/pdf/expenses?year=${festival.id}`} target="_blank" />}>
              <Download className="h-4 w-4" /> 
              {locale === "ta" ? "PDF பதிவிறக்க" : "Download PDF"}
            </Button>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100} animation="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-primary/5 border-primary/20 md:col-span-3 shadow-md rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <IndianRupee className="w-48 h-48 text-primary" />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xl flex items-center gap-2 font-display text-primary">
                  <IndianRupee className="h-5 w-5" />
                  <span>{locale === "ta" ? "மொத்த செலவு" : "Total Expenses"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-5xl md:text-6xl font-bold font-display text-foreground">
                  ₹{totalAmount.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            {Object.entries(categoryTotals).map(([category, amount]) => (
              <Card key={category} className="border-border/50 shadow-sm rounded-xl">
                <CardHeader className="pb-2 bg-muted/30">
                  <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold line-clamp-1" title={category}>
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold font-display text-foreground">₹{amount.toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200} animation="fade-up">
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-primary" />
              </div>
              {locale === "ta" ? "செலவு விவரங்கள்" : "Detailed Breakdown"}
            </h2>
            
            <div className="border border-border/50 rounded-2xl shadow-sm overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-muted/50 border-b border-border/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">{locale === "ta" ? "தேதி" : "Date"}</TableHead>
                    <TableHead className="font-semibold">{locale === "ta" ? "வகை" : "Category"}</TableHead>
                    <TableHead className="font-semibold">{locale === "ta" ? "விவரம்" : "Description"}</TableHead>
                    <TableHead className="text-right font-semibold">{locale === "ta" ? "தொகை (₹)" : "Amount (₹)"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {festival.expenses.length > 0 ? (
                    festival.expenses.map(expense => (
                      <TableRow key={expense.id} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="whitespace-nowrap font-medium text-muted-foreground">
                          {format(new Date(expense.expenseDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium">
                            {getLocalizedField(expense.category, 'name', locale)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getLocalizedField(expense, 'description', locale)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground font-display">
                          ₹{Number(expense.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground bg-muted/20">
                        {locale === "ta" ? "செலவு விவரங்கள் இல்லை" : "No expense details found for this year."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </main>
  );
}
