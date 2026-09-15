import { db } from "@/lib/db";
import { ExpenseForm } from "@/components/admin/expense-form";

export default async function NewExpensePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  const [festivalYears, categories] = await Promise.all([
    db.festivalYear.findMany({ orderBy: { year: "desc" } }),
    db.expenseCategory.findMany({ orderBy: { nameEn: "asc" } })
  ]);

  if (festivalYears.length === 0 || categories.length === 0) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-md">
        <p>You must create at least one Festival Year and Expense Category before logging an expense.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log New Expense</h1>
        <p className="text-muted-foreground mt-2">
          Record a new financial expense. This action will be recorded in the audit log.
        </p>
      </div>

      <ExpenseForm locale={locale} festivalYears={festivalYears} categories={categories} />
    </div>
  );
}
